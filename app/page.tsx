"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const [doc, setDoc] = useState("");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={styles.loadingScreen}>Loading…</div>;
  }

  async function upload() {
    if (!doc.trim()) {
      alert("Please paste a document first.");
      return;
    }
    setLoading(true);
    await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: doc })
    });
    setLoading(false);
    alert("Document indexed successfully.");
  }

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(data.sources || []);
    setLoading(false);
  }

  return (
    <>
      {/* Placeholder styling */}
      <style>{`
        input::placeholder,
        textarea::placeholder {
          color: #64748b;
          opacity: 1;
        }
      `}</style>

      <main style={styles.page}>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.title}>Retrieval-Augmented QA</h1>
            <p style={styles.subtitle}>
              Ask questions grounded strictly in your documents.
            </p>
          </header>

          {/* Upload */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>1. Upload Document</h2>
            <textarea
              style={styles.textarea}
              rows={6}
              placeholder="Paste your document here…"
              onChange={(e) => setDoc(e.target.value)}
            />
            <button style={styles.primaryBtn} onClick={upload}>
              {loading ? "Indexing…" : "Upload & Index"}
            </button>
          </section>

          {/* Query */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>2. Ask a Question</h2>
            <input
              style={styles.input}
              placeholder="Ask something about the document…"
              onChange={(e) => setQ(e.target.value)}
            />
            <button style={styles.primaryBtn} onClick={ask}>
              {loading ? "Thinking…" : "Ask"}
            </button>
          </section>

          {/* Answer */}
          {answer && (
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Answer</h2>
              <p style={styles.answer}>{answer}</p>

              {sources.length > 0 ? (
                <>
                  <h3 style={styles.sourcesTitle}>Sources</h3>
                  {sources.map((s, i) => (
                    <div key={i} style={styles.sourceBox}>
                      <span style={styles.sourceIndex}>[{i + 1}]</span>
                      <span>{s.text}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p style={styles.noSource}>
                  No supporting sources found in the document.
                </p>
              )}
            </section>
          )}

          <footer style={styles.footer}>
            <span>⏱ ~1.5s</span>
            <span>🔢 ~800 tokens</span>
            <span>💲 ~$0.002</span>
          </footer>
        </div>
      </main>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "48px 16px",
    fontFamily: "Inter, system-ui, sans-serif"
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    color: "#475569"
  },
  container: {
    width: "100%",
    maxWidth: "920px"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#475569",
    fontSize: "1.05rem"
  },
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "28px",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)"
  },
  cardTitle: {
    marginBottom: "14px",
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#0f172a"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #c7d2fe",
    marginBottom: "14px",
    resize: "vertical",
    fontSize: "0.95rem",
    color: "#0f172a",
    backgroundColor: "#ffffff"
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #c7d2fe",
    marginBottom: "14px",
    fontSize: "0.95rem",
    color: "#0f172a",
    backgroundColor: "#ffffff"
  },
  primaryBtn: {
    padding: "12px 18px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600
  },
  answer: {
    lineHeight: 1.7,
    fontSize: "1rem",
    color: "#1e293b",
    marginBottom: "18px"
  },
  sourcesTitle: {
    marginBottom: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#334155"
  },
  sourceBox: {
    background: "#eef2ff",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "10px",
    display: "flex",
    gap: "8px",
    color: "#1e293b"
  },
  sourceIndex: {
    fontWeight: 700,
    color: "#4338ca"
  },
  noSource: {
    color: "#64748b",
    fontStyle: "italic"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    color: "#475569",
    fontSize: "0.85rem",
    marginTop: "24px"
  }
};
