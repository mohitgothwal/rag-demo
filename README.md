# Retrieval-Augmented Question Answering (RAG) System

This project implements a **Retrieval-Augmented Generation (RAG)** pipeline that answers user questions **strictly grounded in user-provided documents**, with **inline citations** and transparent source display.

The system follows the canonical RAG flow: **retrieve → rerank → generate**, and is designed to be simple, explainable, and compatible with free-tier deployment.

---

## Live Demo

- **Frontend (Vercel):** https://<your-vercel-app>.vercel.app  
- **Backend (Render):** https://<your-render-service>.onrender.com  

---

## Overview

Large Language Models can hallucinate when answering questions without context.  
RAG mitigates this by retrieving relevant document chunks before generating an answer.

This project demonstrates:
- document chunking
- vector-based retrieval
- explicit reranking
- grounded answer generation
- inline citations
- refusal when information is missing

---

## System Architecture

User
│
│ (document / query)
▼
Frontend (Next.js)
│
│ POST /upload
│ POST /ask
▼
Backend (Node.js + Express)
│
├─ Chunking
├─ Vector Representation
├─ Retrieval (Top-K)
├─ Reranking
├─ LLM Answer Generation
│
▼
Answer + Inline Citations + Source Snippets


---

## RAG Pipeline (Step-by-Step)

### 1. Document Chunking
- Uploaded documents are split into overlapping chunks.
- Improves retrieval granularity and reduces context dilution.

### 2. Vector Representation
- Each chunk is converted into a lightweight numeric vector.
- Vectors are stored **in memory** for fast access.
- A similar vector is generated for the user query.

### 3. Retrieval
- Cosine similarity scores query–chunk relevance.
- Top-K most relevant chunks are selected.

### 4. Reranking
- Retrieved chunks are explicitly re-sorted by similarity score.
- Ensures the most relevant context is prioritized.

### 5. Answer Generation
- Top-ranked chunks are passed to the LLM as context.
- The LLM is instructed to:
  - answer only using provided sources
  - cite every factual claim
  - refuse when information is insufficient

### 6. Citations & Sources
- Answers include inline citations (e.g. `[1]`, `[2]`)
- Corresponding source snippets are displayed below the answer

---

## Schema / Index Configuration (Track A)

### Chunking Parameters
| Parameter | Value |
|--------|------|
| Chunk size | ~400 tokens |
| Overlap | ~50 tokens |

### Vector Index
- Type: In-memory array
- Vector dimension: 128
- Similarity metric: Cosine similarity
- Persistence: None (resets on restart)

### Retrieval
- Top-K: 3
- Reranking: Explicit similarity-based sorting

---

## LLM Configuration

- **Provider:** Groq  
- **Model:** `llama-3.1-8b-instant`  
- **Prompt constraints:**
  - strictly source-grounded
  - mandatory inline citations
  - explicit refusal on missing information

---

## Setup Instructions (Local)

### 1. Clone repository
```bash
git clone https://github.com/mohitgothwal/rag-demo.git
cd rag-demo
2. Environment Variables
Create a .env file inside the backend directory using .env.example as reference.

GROQ_API_KEY=your_groq_api_key_here
3. Install dependencies
Backend
cd backend
npm install
node server.js
Expected output:

Backend running on 3001
Frontend
cd ..
npm run dev
Open:

http://localhost:3000
Deployment
Backend (Render)
Create a new Web Service on Render

Connect the GitHub repository

Set root directory to backend

Start command:

node server.js
Add environment variable:

GROQ_API_KEY=your_groq_api_key_here
Frontend (Vercel)
Deploy the repository using Vercel

Framework: Next.js

Update frontend API URLs to point to the Render backend

Usage
Paste a document into the input area

Click Upload to index the document

Enter a question related to the document

View:

grounded answer

inline citations

source snippets

If the answer is not present in the document, the system explicitly declines to answer.

Evaluation
Gold Question–Answer Set
Five manually curated question–answer pairs were used to evaluate:

retrieval correctness

citation alignment

hallucination avoidance

Observed results:

Accuracy (document-contained questions): ~80%

Hallucinations: 0%

Correct refusal when information missing: 100%

Remarks (Trade-offs & Limits)
Limitations
In-memory index resets on server restart

Local vector representations are lexical, not semantic

Single-document workflow

No authentication or persistence layer

Design Trade-offs
Lightweight local embeddings used to avoid paid embedding APIs

Prioritized clarity and correctness over raw performance

Explicit reranking improves explainability

What I’d Do Next
Replace local vectors with OpenAI / Cohere embeddings

Add cross-encoder reranker

Persist index using FAISS or Supabase

Support multi-document corpora

Add latency, token, and cost monitoring

Security & Environment Variables
API keys are never exposed to the frontend

.env is excluded from version control

.env.example documents required configuration

Tech Stack
Frontend: Next.js (React)

Backend: Node.js, Express

LLM: Groq (LLaMA 3.1 Instant)

Retrieval: Custom in-memory vector store

Resume
📄 Resume: https://drive.google.com/file/d/1VyUck2ll7YCe81ZNnF00_GFUuJ8I13zz/view?usp=sharing