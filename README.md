# SupportAI: Multi-Tenant RAG Knowledge Base

A production-ready, context-aware AI support platform built with a Retrieval-Augmented Generation (RAG) architecture. This application allows organizations to safely upload proprietary documentation and retrieve instant, hallucination-free answers with strict data isolation.

## Tech Stack

*   **Frontend:** Next.js 16, React, Tailwind CSS, Lucide Icons
*   **Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM
*   **AI / Generative:** Google Gemini API (`gemini-embedding-001` + `gemini-1.5-flash`)
*   **Vector Database:** Pinecone (3072 dimensions, cosine similarity)
*   **Authentication:** Custom JWT (JSON Web Tokens) with bcrypt password hashing

## Core Engineering Features

*   **Strict Multi-Tenant Isolation:** Engineered a custom JWT-based authentication flow backed by PostgreSQL to replace third-party auth, ensuring organizations can only embed and query their own private Pinecone vectors.
*   **Resilient API Handling (Smart Retry):** Built an exponential backoff and retry wrapper in the Node.js backend to silently catch and resolve `503 Service Unavailable` errors from third-party AI endpoints during high load, preventing application crashes.
*   **Persistent UI State:** Solved Next.js aggressive caching and React unmounting behaviors using `sessionStorage`, URL parameter parsing, and explicit `cache: 'no-store'` directives for seamless chat history persistence across tabs.
*   **Advanced Document Pipeline:** Full document ingestion (PDF/TXT) with intelligent chunking, vectorization, secure deletion cascading, and UI-integrated file attachments directly from the chat interface.

## Local Setup

### 1. Backend Integration
```bash
cd backend
npm install
# Configure your .env file with DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, and PINECONE_API_KEY
npx prisma db push
npm run dev