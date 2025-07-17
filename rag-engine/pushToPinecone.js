const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read markdown
const filePath = path.join(__dirname, 'docs', 'auth_service_doc.md');
const rawText = fs.readFileSync(filePath, 'utf8');

// Chunking logic
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

(async () => {
  // Create embeddings
  const embeddings = [];

  for (const chunk of chunks) {
    const res = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: chunk,
    });
    embeddings.push(res.data[0].embedding);
  }

  // Pinecone setup
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX);
  const namespace = 'auth-docs';

  const vectors = embeddings.map((values, i) => ({
    id: `auth-${Date.now()}-${i}`,
    values,
    metadata: { text: chunks[i] },
  }));

    await index.namespace(namespace).upsert(vectors);
  console.log(`Upserted ${vectors.length} vectors to Pinecone`);
})();