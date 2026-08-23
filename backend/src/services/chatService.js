import { v4 as uuidv4 } from 'uuid';
import { getEmbeddingModel, getChatModel } from '../config/gemini.js';
import { getPineconeIndex } from '../config/pinecone.js';
import prisma from '../config/db.js';

/**
 * Embeds a user's question using RETRIEVAL_QUERY taskType.
 */
async function embedQuery(question) {
  const embeddingModel = getEmbeddingModel();

  const result = await embeddingModel.embedContent({
    content: { parts: [{ text: question }], role: 'user' },
    taskType: 'RETRIEVAL_QUERY',
  });

  return result.embedding.values; 
}

/**
 * Searches Pinecone for the most semantically similar chunks.
 */
async function searchSimilarChunks(queryVector, organizationId, topK = 3) {
  const index = getPineconeIndex();

  const results = await index.query({
    vector: queryVector,
    topK,
    filter: { organizationId: { $eq: organizationId } },
    includeMetadata: true,
  });

  return results.matches; 
}

/**
 * Fetches full chunk text from PostgreSQL using pineconeIds.
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
    answer = "I don't have enough information in my knowledge base to answer that question. Please make sure relevant documents have been uploaded.";
  } else {
    const prompt = buildPrompt(message, chunks);
    const chatModel = getChatModel();
    
    // --- SMART RETRY LOGIC ---
    let maxRetries = 3;
    let delayMs = 2000; // Start with a 2-second delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Chat] Sending to Gemini Flash... (Attempt ${attempt}/${maxRetries})`);
        const result = await chatModel.generateContent(prompt);
        answer = result.response.text();
        break; // Success! Exit the retry loop
      } catch (genError) {
        // Safely check if it's a 503 error
        const is503 = genError.status === 503 || (genError.message && genError.message.includes('503'));
        
        if (is503 && attempt < maxRetries) {
          console.warn(`[Chat] 503 Server Busy. Retrying in ${delayMs / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs += 1000; // Increase delay by 1s for the next attempt
        } else if (genError.status === 429) {
          answer = "I'm temporarily rate limited by the AI provider. Please wait 60 seconds and try again.";
          console.warn('[Chat] Rate limited by Gemini — returning fallback message');
          break; // Don't retry on rate limits
        } else {
          // If we run out of retries on a 503, fail gracefully
          if (is503) {
            answer = "The AI servers are currently experiencing extremely high demand. Please try asking again in a few moments.";
            console.error('[Chat] Gemini 503 error persisted after all retries.');
            break;
          }
          throw genError; // Throw any other critical errors
        }
      }
    }
    // --- END SMART RETRY LOGIC ---
    
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
    preview: chunk.content.slice(0, 150) + '...', 
  }));

  return {
    conversationId: conversation.id,
    answer,
    sources,
  };
}

/**
 * Fetches full conversation history for a given conversationId.
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