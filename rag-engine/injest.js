const fs = require('fs');
const path = require('path');

// Load your Markdown file
const filePath = path.join(__dirname, 'docs', 'auth_service_doc.md');
const rawText = fs.readFileSync(filePath, 'utf8');

// Split into clean chunks
function splitTextIntoChunks(text, maxChunkSize = 500) {
  const sentences = text.split(/\.\s|\n/);
  const chunks = [];

  let chunk = '';
  for (const sentence of sentences) {
    if ((chunk + sentence).length > maxChunkSize) {
      chunks.push(chunk.trim());
      chunk = sentence;
    } else {
      chunk += sentence + '. ';
    }
  }

  if (chunk) chunks.push(chunk.trim());
  return chunks;
}

const chunks = splitTextIntoChunks(rawText);
console.log(`Total Chunks Created: ${chunks.length}`);

module.exports = { chunks };

const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
require('dotenv').config();

(async () => {
  const embedder = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const embeddings = await embedder.embedDocuments(chunks);
  console.log(`Generated ${embeddings.length} embeddings`);

  // Export both chunks and embeddings for next step
  module.exports = { chunks, embeddings };
})();