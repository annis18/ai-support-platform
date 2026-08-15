# AI Customer Support Platform

An AI-powered customer support platform built with RAG (Retrieval-Augmented Generation) architecture. Businesses upload documentation and customers get instant, cited answers.

## Tech Stack

**Frontend:** Next.js 16, Tailwind CSS, Clerk Auth  
**Backend:** Node.js, Express, PostgreSQL, Prisma 7  
**AI:** Google Gemini (gemini-embedding-001 + gemini-flash-latest)  
**Vector DB:** Pinecone (3072 dimensions, cosine similarity)  
**Payments:** Stripe  

## Core Features

- Document ingestion pipeline (PDF + TXT) with chunking and embedding
- Semantic search with multi-tenant isolation per organization
- AI-generated answers with source citations
- Conversation history persistence
- Clerk authentication with Google/GitHub OAuth
- Stripe billing with Free/Pro plans
- SaaS dashboard with document management

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env  # fill in your keys
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

## Environment Variables

See `.env.example` in both `backend/` and `frontend/` for required keys.
