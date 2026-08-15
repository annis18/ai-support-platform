/**
 * Splits a long string into overlapping chunks.
 *
 * WHY THIS LOGIC:
 * - chunkSize: how many characters per chunk (~500 tokens ≈ 2000 chars)
 * - overlap: how many chars the next chunk "backs up" to avoid cutting ideas in half
 * - We try to break at sentence boundaries (". ") so chunks are coherent
 */
export function chunkText(text, chunkSize = 2000, overlap = 200) {
  const chunks = [];
  
  // Normalize whitespace first
  const cleanText = text
  .replace(/\0/g, '')        // strip null bytes (PostgreSQL UTF8 rejects these)
  .replace(/\s+/g, ' ')      // normalize whitespace
  .trim();
  
  if (cleanText.length <= chunkSize) {
    return [cleanText]; // Small doc fits in one chunk
  }

  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;

    if (end >= cleanText.length) {
      // Last chunk — take everything remaining
      chunks.push(cleanText.slice(start));
      break;
    }

    // Try to find a sentence boundary to break on
    // Look backwards from 'end' for a ". " to avoid cutting mid-sentence
    const boundarySearch = cleanText.lastIndexOf('. ', end);
    
    if (boundarySearch > start + chunkSize / 2) {
      // Found a good sentence boundary in the second half of the chunk
      end = boundarySearch + 1; // Include the period
    }

    chunks.push(cleanText.slice(start, end));
    start = end - overlap; // Back up by overlap amount for the next chunk
  }

  return chunks;
}

/**
 * Quick test — run `node src/utils/textChunker.js` to verify
 */
if (process.argv[1].includes('textChunker')) {
  const sample = 'Hello world. '.repeat(300);
  const result = chunkText(sample);
  console.log(`Total chunks: ${result.length}`);
  console.log(`First chunk length: ${result[0].length}`);
  console.log(`Overlap check (last 200 chars of chunk 0 = first 200 of chunk 1):`);
  console.log(result[0].slice(-50));
  console.log(result[1].slice(0, 50));
}