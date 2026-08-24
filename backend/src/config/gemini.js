import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;

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
  return genAI.getGenerativeModel({ model: gemini-2.5-flash });
}

export default genAI;