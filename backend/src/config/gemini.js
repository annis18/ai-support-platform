import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AQ.Ab8RN6JhTpnXmfiAMwz-2JAFr1Y8GYxMZFyLxQE5Xtpuju1Sfw";

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is missing from .env');
}

// Removed AIza format check — Google now issues AQ. format keys from AI Studio
console.log('[Gemini] API key loaded, prefix:', apiKey.slice(0, 6));

const genAI = new GoogleGenerativeAI(apiKey);

export function getEmbeddingModel() {
  return genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
}

export function getChatModel() {
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
}

export default genAI;