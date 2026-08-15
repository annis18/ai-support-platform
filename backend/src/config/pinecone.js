import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Returns the index object we'll use to upsert and query
export const getPineconeIndex = () => {
  return pinecone.index(process.env.PINECONE_INDEX_NAME);
};

export default pinecone;