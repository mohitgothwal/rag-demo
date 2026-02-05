"use client";
import { useState } from "react";

export default function Home() {
  const [doc, setDoc] = useState("");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  async function upload() {
    await fetch("http://localhost:3001/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: doc })
    });
    alert("Document indexed");
  }

  async function ask() {
    const res = await fetch("http://localhost:3001/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(data.sources);
  }

  return (
    <main style={{ padding: 20 }}>
      <h2>RAG Demo</h2>

      <textarea
        rows={6}
        placeholder="Paste document"
        onChange={e => setDoc(e.target.value)}
      />
      <br />
      <button onClick={upload}>Upload</button>

      <hr />

      <input
        placeholder="Ask a question"
        onChange={e => setQ(e.target.value)}
      />
      <button onClick={ask}>Ask</button>

      <h3>Answer</h3>
      <p>{answer}</p>

      <h4>Sources</h4>
      {sources.map(s => (
        <p key={s.id}>
          [{s.id}] {s.text}
        </p>
      ))}

      <small>⏱ ~1.5s | 🔢 ~800 tokens | 💲 ~$0.002</small>
    </main>
  );
}
