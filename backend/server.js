import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";


const app = express();
app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());

function fakeEmbedding(text) {
  const vec = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % 128] += text.charCodeAt(i);
  }
  return vec;
}


const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});


// ---- In-memory store ----
let chunks = [];
let embeddings = [];

// ---- Helpers ----
function chunkText(text, size = 400, overlap = 50) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    chunks.push(words.slice(i, i + size).join(" "));
  }
  return chunks;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

// ---- Upload Document ----
app.post("/upload", async (req, res) => {
  const { text } = req.body;
  chunks = chunkText(text);

  embeddings = [];
  for (const chunk of chunks) {
    embeddings.push(fakeEmbedding(chunk));

  }

  res.json({ message: "Document indexed", chunks: chunks.length });
});

// ---- Ask Question ----
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  const qEmbedding = fakeEmbedding(question);


  // Retrieve
  const scored = embeddings.map((e, i) => ({
    score: cosineSimilarity(qEmbedding, e)
,
    text: chunks[i],
    id: i
  }));

  // Rerank (explicit step)
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (top[0].score < 0.2) {
    return res.json({
      answer: "I couldn’t find enough information to answer this question.",
      sources: []
    });
  }

  // LLM Answer
  const context = top.map((c, i) => `[${i + 1}] ${c.text}`).join("\n");

  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "Answer using only the sources. Cite like [1][2]." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
    ]
  });

  res.json({
    answer: completion.choices[0].message.content,
    sources: top.map((c, i) => ({
      id: i + 1,
      text: c.text
    }))
  });
});

app.listen(3001, () => console.log("Backend running on 3001"));
