import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function test() {
  try {
    console.log('Testing with key prefix:', process.env.GOOGLE_API_KEY?.slice(0, 8));
    
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    
    const result = await model.embedContent({
      content: { parts: [{ text: 'hello world test' }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    const vector = result.embedding.values;
    console.log('✅ Gemini embedding works!');
    console.log('Vector dimensions:', vector.length);
    console.log('First 3 values:', vector.slice(0, 3));

  } catch (err) {
    console.error('❌ Gemini test failed:');
    console.error('Status:', err.status);
    console.error('Message:', err.message);
  }
}

test();