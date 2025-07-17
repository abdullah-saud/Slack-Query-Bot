# 🔍 Slack Code Query Bot

A developer-focused Slack bot that answers natural language questions about your codebase or product documentation using a Retrieval-Augmented Generation (RAG) pipeline powered by OpenAI and Pinecone.

---

## 🧠 Features

- Ask code-related questions in Slack like:
  - "What does the AuthController do?"
  - "Where do I update environment variables?"
- Automatically searches relevant context from ingested documentation
- Uses OpenAI to generate intelligent answers based on your docs
- Powered by Pinecone vector DB for fast semantic search

---

## 🛠️ Tech Stack

- **Node.js** + **Express**
- **Slack Bolt SDK**
- **Pinecone** (Vector DB)
- **OpenAI API**
- **LangChain** (Embeddings pipeline)
- **ngrok** (for local Slack development)
- **Markdown file ingestion & chunking**

---

## 🚀 How It Works

1. Developer types a question in Slack (`@CodeQueryBot where is the auth logic defined?`)
2. Query is embedded and matched against Pinecone vector index
3. Top relevant document chunks are passed to OpenAI
4. OpenAI returns a concise answer
5. Slack bot replies in the thread

---

## 📁 Project Structure

```
code-query-bot/
│
├── slack-bot/            # Slack bot server using Bolt SDK
│   └── index.js
│
├── rag-engine/           # Core RAG pipeline (OpenAI + Pinecone)
│   ├── rag.js
│   └── pushToPinecone.js
│
├── docs/                 # Markdown files ingested into vector DB
│   └── auth_service_doc.md
│
├── .env                  # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Setup

1. **Clone this repo**

```bash
git clone git@github.com:your-username/code-query-bot.git
cd code-query-bot
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```env
OPENAI_API_KEY=your_openai_key
SLACK_SIGNING_SECRET=your_slack_secret
SLACK_BOT_TOKEN=xoxb-...
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index
PORT=3000
```

4. **Push docs to Pinecone**

```bash
node rag-engine/pushToPinecone.js
```

5. **Start Slack bot**

```bash
npm start
```

6. **Expose via ngrok**

```bash
npx ngrok http 3000
```

Use the HTTPS URL to set your Slack bot's request URL.

---

## ✨ Future Improvements

- Add authentication/permissions
- Add support for querying multiple namespaces
- Build a web dashboard to manage ingested documents
- Add unit tests and monitoring

---

## 🧑‍💻 Made by

**Abdullah Saud** – [GitHub](https://github.com/abdullah-saud)

---
