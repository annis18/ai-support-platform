import { v4 as uuidv4 } from 'uuid';
import { getEmbeddingModel, getChatModel } from '../config/gemini.js';
import { getPineconeIndex } from '../config/pinecone.js';
import prisma from '../config/db.js';

/**
 * Embeds a user's question using RETRIEVAL_QUERY taskType.
 *
 * WHY different taskType than ingestion?
 * Gemini trains document vectors to "answer" and query vectors to "ask".
 * Using RETRIEVAL_QUERY on the question makes the vector point toward
 * documents that ANSWER it — not toward similar questions.
 * Mixing taskTypes destroys search accuracy.
 */
async function embedQuery(question) {
  const embeddingModel = getEmbeddingModel();

  const result = await embeddingModel.embedContent({
    content: { parts: [{ text: question }], role: 'user' },
    taskType: 'RETRIEVAL_QUERY', // ← different from ingestion!
  });

  return result.embedding.values; // 3072-dim vector
}

/**
 * Searches Pinecone for the most semantically similar chunks.
 *
 * We filter by organizationId so companies only search their
 * own documents — this is what makes it multi-tenant.
 *
 * topK: how many chunks to retrieve. 3 is usually enough context
 * without overloading the LLM prompt. Too many = noisy answers.
 */
async function searchSimilarChunks(queryVector, organizationId, topK = 3) {
  const index = getPineconeIndex();

  const results = await index.query({
    vector: queryVector,
    topK,
    filter: { organizationId: { $eq: organizationId } },
    includeMetadata: true,
  });

  return results.matches; // array of { id, score, metadata }
}

/**
 * Fetches full chunk text from PostgreSQL using pineconeIds.
 *
 * WHY fetch from Postgres if Pinecone already has metadata?
 * Pinecone metadata has a size limit (~40KB total per vector).
 * Full document text can exceed this. Postgres has no such limit.
 * We store full text in Postgres and only a preview in Pinecone.
 */
async function fetchChunksByIds(pineconeIds) {
  return prisma.documentChunk.findMany({
    where: { pineconeId: { in: pineconeIds } },
    include: {
      document: {
        select: { fileName: true, id: true },
      },
    },
  });
}

/**
 * Builds the prompt sent to Gemini Flash.
 *
 * Prompt engineering is critical for RAG quality.
 * Key rules:
 * 1. Tell the LLM it can ONLY use provided context
 * 2. Tell it to say "I don't know" if context doesn't cover the question
 * 3. Ask for source citations so users know where answers came from
 * 4. Keep context chunks clearly separated and labelled
 */
function buildPrompt(question, chunks) {
  const contextBlock = chunks
    .map((chunk, i) => `[Source ${i + 1}: ${chunk.document.fileName}]\n${chunk.content}`)
    .join('\n\n---\n\n');

  return `You are a helpful customer support assistant. Answer the user's question using ONLY the context provided below.

If the context does not contain enough information to answer the question, say: "I don't have enough information in my knowledge base to answer that question."

Always mention which source(s) you used at the end of your answer.

CONTEXT:
${contextBlock}

USER QUESTION:
${question}

ANSWER:`;
}

/**
 * MAIN CHAT FUNCTION
 * Called by the controller on every user message.
 */
export async function processChat({ conversationId, message, organizationId }) {

  // Step 1: Get or create conversation record
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  if (!conversation) {
    // Auto-create org if needed (same pattern as ingestion)
    await prisma.organization.upsert({
  where: { clerkOrgId: organizationId },
  update: {},
  create: {
    id: organizationId,
    clerkOrgId: organizationId,
    name: organizationId,
  },
});
    conversation = await prisma.conversation.create({
      data: { id: uuidv4(), organizationId },
    });
  }

  // Step 2: Save the user's message to Postgres
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: message,
    },
  });

  // Step 3: Embed the question
  console.log('[Chat] Embedding query...');
  const queryVector = await embedQuery(message);
  console.log(`[Chat] Query embedded — ${queryVector.length} dims`);

  // Step 4: Search Pinecone for relevant chunks
  console.log('[Chat] Searching Pinecone...');
  const matches = await searchSimilarChunks(queryVector, organizationId);
  console.log(`[Chat] Found ${matches.length} matches`);

  // Log similarity scores — useful for tuning topK and understanding quality
  matches.forEach((m, i) => {
    console.log(`[Chat] Match ${i + 1}: score=${m.score?.toFixed(4)}, file=${m.metadata?.fileName}`);
  });

  // Step 5: Fetch full text from Postgres
  const pineconeIds = matches.map((m) => m.id);
  const chunks = await fetchChunksByIds(pineconeIds);
  console.log(`[Chat] Fetched ${chunks.length} chunks from Postgres`);

  // Step 6: Build prompt and generate answer
  let answer;

  if (chunks.length === 0) {
    // No relevant chunks found — don't hallucinate
    answer = "I don't have enough information in my knowledge base to answer that question. Please make sure relevant documents have been uploaded.";
  } else {
    const prompt = buildPrompt(message, chunks);
    console.log('[Chat] Sending to Gemini Flash...');

    const chatModel = getChatModel();
    try {
  const result = await chatModel.generateContent(prompt);
  answer = result.response.text();
} catch (genError) {
  if (genError.status === 429) {
    answer = "I'm temporarily rate limited. Please wait 60 seconds and try again.";
    console.warn('[Chat] Rate limited by Gemini — returning fallback message');
  } else {
    throw genError; // re-throw other errors
  }
}
    console.log('[Chat] Answer generated');
  }

  // Step 7: Save assistant's answer to Postgres
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: answer,
    },
  });

  // Step 8: Return answer + sources for frontend to display
  const sources = chunks.map((chunk) => ({
    fileName: chunk.document.fileName,
    documentId: chunk.document.id,
    chunkIndex: chunk.chunkIndex,
    preview: chunk.content.slice(0, 150) + '...', // first 150 chars as preview
  }));

  return {
    conversationId: conversation.id,
    answer,
    sources,
  };
}

/**
 * Fetches full conversation history for a given conversationId.
 * Used by the frontend to render the chat thread.
 */
export async function getConversationHistory(conversationId) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}