import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

/* ✅ FIX 1: allow all origins (safe for demo APIs) */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* ---------------- EMBEDDINGS ---------------- */

function fakeEmbedding(text) {
  const vec = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % 128] += text.charCodeAt(i);
  }
  return vec;
}

/* ---------------- LLM CLIENT ---------------- */

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/* ---------------- IN-MEMORY STORE ---------------- */

let chunks = [];
let embeddings = [];

/* ---------------- HELPERS ---------------- */

function chunkText(text, size = 400, overlap = 50) {
  const words = text.split(" ");
  const out = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    out.push(words.slice(i, i + size).join(" "));
  }
  return out;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

/* ---------------- ROUTES ---------------- */

/* ✅ FIX 2: /upload ALWAYS responds */
app.post("/upload", async (req, res) => {
  try {
    console.log("📥 /upload called");

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    chunks = chunkText(text);
    embeddings = chunks.map(fakeEmbedding);

    console.log(`✅ Indexed ${chunks.length} chunks`);

    return res.json({
      success: true,
      chunks: chunks.length
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    return res.status(500).json({ error: "Indexing failed" });
  }
});

/* ---------------- ASK ---------------- */

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !embeddings.length) {
      return res.json({
        answer: "Please upload a document first.",
        sources: []
      });
    }

    const qEmbedding = fakeEmbedding(question);

    const scored = embeddings.map((e, i) => ({
      score: cosineSimilarity(qEmbedding, e),
      text: chunks[i]
    }));

    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (top[0].score < 0.2) {
      return res.json({
        answer: "I couldn’t find enough information to answer this question.",
        sources: []
      });
    }

    const context = top
      .map((c, i) => `[${i + 1}] ${c.text}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Answer only using the provided sources. Cite facts like [1][2]."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ]
    });

    return res.json({
      answer: completion.choices[0].message.content,
      sources: top.map((c, i) => ({
        id: i + 1,
        text: c.text
      }))
    });
  } catch (err) {
    console.error("❌ Ask failed:", err);
    return res.status(500).json({
      answer: "An error occurred while answering.",
      sources: []
    });
  }
});

/* ---------------- HEALTH ---------------- */

app.get("/", (_, res) => {
  res.send("RAG backend running");
});

app.listen(3001, () => {
  console.log("Backend running on 3001");
});
