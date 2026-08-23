import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

import { getEmbeddingModel } from '../config/gemini.js';
import { getPineconeIndex } from '../config/pinecone.js';
import prisma from '../config/db.js';
import { chunkText } from '../utils/textChunker.js';



async function extractText(filePath, fileType) {
  if (fileType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    
    // Initialize the new PDFParse class with your file buffer
    const parser = new PDFParse({ data: buffer });
    
    // Extract the text using the getText() method
    const result = await parser.getText();
    
    return result.text;
  }
  
  if (fileType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
}

async function embedChunks(chunks) {
  const embeddingModel = getEmbeddingModel();
  const embeddings = [];

  for (let i = 0; i < chunks.length; i++) {
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text: chunks[i] }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT',
      // NO outputDimensionality — let Gemini return its natural 3072 dims
    });

    const vector = result.embedding.values; // full 3072-dim vector, no slicing

    if (!vector || vector.length === 0) {
      throw new Error(`Gemini returned empty embedding for chunk ${i}`);
    }

    console.log(`[Embedding] Chunk ${i + 1}/${chunks.length} — ${vector.length} dims`);
    embeddings.push(vector);
  }

  return embeddings;
}

export async function ingestDocument({ filePath, fileName, fileType, organizationId }) {


  const document = await prisma.document.create({
    data: {
      organizationId,
      fileName,
      fileType,
      status: 'processing',
    },
  });

  console.log(`[Ingestion] Created document record: ${document.id}`);

  try {
    const rawText = await extractText(filePath, fileType);
    console.log(`[Ingestion] Extracted ${rawText.length} characters`);

    const chunks = chunkText(rawText);
    console.log(`[Ingestion] Split into ${chunks.length} chunks`);

    const embeddings = await embedChunks(chunks);
    console.log(`[Ingestion] Generated ${embeddings.length} embeddings`);

    const pineconeIndex = getPineconeIndex();
    const pineconeVectors = [];
    const dbChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const pineconeId = uuidv4();

      pineconeVectors.push({
        id: pineconeId,
        values: embeddings[i],
        metadata: {
          organizationId,
          documentId: document.id,
          fileName,
          chunkIndex: i,
          text: chunks[i].slice(0, 1000),
        },
      });

      dbChunks.push({
        id: pineconeId,
        documentId: document.id,
        content: chunks[i],
        chunkIndex: i,
        pineconeId,
      });
    }

    // Safety check before hitting Pinecone
    console.log(`[Pinecone] Vectors to upsert: ${pineconeVectors.length}`);
    console.log(`[Pinecone] First vector dims: ${pineconeVectors[0]?.values?.length}`);

    if (pineconeVectors.length === 0) {
      throw new Error('No vectors to upsert — embeddings array was empty');
    }

    const BATCH_SIZE = 100;
    for (let i = 0; i < pineconeVectors.length; i += BATCH_SIZE) {
      const batch = pineconeVectors.slice(i, i + BATCH_SIZE);
      await pineconeIndex.upsert(batch);
      console.log(`[Ingestion] Upserted batch ${Math.floor(i / BATCH_SIZE) + 1} to Pinecone`);
    }

    await prisma.documentChunk.createMany({ data: dbChunks });
    console.log(`[Ingestion] Saved ${dbChunks.length} chunks to Postgres`);

    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'completed' },
    });

    fs.unlinkSync(filePath);

    return { success: true, documentId: document.id, chunksCreated: chunks.length };

  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'failed' },
    });
    console.error('[Ingestion] Failed:', error);
    throw error;
  }
}