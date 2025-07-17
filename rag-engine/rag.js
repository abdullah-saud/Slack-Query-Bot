const express = require('express');
const bodyParser = require('body-parser');
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

// 🔹 Embed text into vector
async function embed(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

// 🔹 Search Pinecone for relevant docs
async function queryDocs(query) {
  const queryVector = await embed(query);
  const res = await index.query({
    vector: queryVector,
    topK: 3,
    includeMetadata: true,
  });

  return res.matches.map((m) => m.metadata.text).join('\n');
}

// 🔹 Generate LLM answer from context
async function generateAnswer(query, context) {
  const prompt = `You're a helpful assistant for developers reading a codebase.\n\nContext:\n${context}\n\nQ: ${query}\nA:`;
  const chatRes = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  return chatRes.choices[0].message.content;
}

// 🔹 API route for Slack bot or frontend
app.post('/ask', async (req, res) => {
  const query = req.body.query;
  try {
    const context = await queryDocs(query);
    const answer = await generateAnswer(query, context);
    res.json({ answer });
  } catch (err) {
    console.error('Error in /ask:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 🔹 Start server
app.listen(8000, () => {
  console.log('Ask endpoint live at http://localhost:8000/ask');
});

module.exports = {
  queryDocs, generateAnswer
}