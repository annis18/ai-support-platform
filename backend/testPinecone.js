import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function test() {
  try {
    // Step 1: List all indexes
    const indexes = await pinecone.listIndexes();
    console.log('Your Pinecone indexes:', JSON.stringify(indexes, null, 2));

    // Step 2: Describe your specific index
    const indexName = process.env.PINECONE_INDEX_NAME;
    const description = await pinecone.describeIndex(indexName);
    console.log('\nIndex description:', JSON.stringify(description, null, 2));
    console.log('\n✅ Your index dimension is:', description.dimension);

    // Step 3: Try upserting a dummy vector of 3072 dims
    const index = pinecone.index(indexName);
    const dummyVector = Array(3072).fill(0.1); // 3072 floats

    console.log('\nAttempting upsert with 3072-dim vector...');
    // Some versions require explicit namespace
    await index.namespace('').upsert([{
    id: 'test-vector-001',
    values: dummyVector,
    metadata: { test: true }
    }]);
    console.log('✅ Upsert succeeded! Pinecone is working.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));
  }
}

test();