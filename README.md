# Agentic RAG App

![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen)

## Overview

**Agentic RAG App** is a full‑stack Retrieval‑Augmented Generation (RAG) demonstration built with a **React/Vite** frontend and an **Express** backend.  It showcases how to:

- Upload documents, chunk them, and store the embeddings in a vector store.
- Perform similarity search against stored chunks.
- Use a language model (LLM) to generate answers that are grounded in the retrieved context.
- Secure the API with JWT‑based authentication.

The project is intentionally modular so you can swap out the embedding model, vector store, or LLM with minimal changes.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind (or vanilla CSS), Axios |
| Backend  | Node.js, Express, Mongoose (MongoDB), `dotenv` |
| Vector Store | Pinecone / FAISS (configurable) |
| LLM | OpenAI / Anthropic (via `ollama` wrapper) |
| Auth | JWT, bcrypt |
| Database | MongoDB |

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or later) and **npm**
- **MongoDB** instance (local or Atlas)
- API key for the LLM provider you plan to use (e.g., OpenAI)

### Installation

```bash
# Clone the repo
git clone https://github.com/your‑username/agentic-rag-app.git
cd agentic-rag-app

# Install dependencies for both backend and frontend
npm install          # installs root scripts (optional)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Environment Variables

Create a `.env` file in `backend/` with the following keys:

```dotenv
MONGODB_URI=mongodb://localhost:27017/agentic_rag
JWT_SECRET=your_jwt_secret
LLM_API_KEY=your_llm_api_key
VECTOR_STORE=faiss   # or pinecone
```

### Run the Application

```bash
# Start backend (on port 5000 by default)
cd backend && npm run dev &

# Start frontend (Vite dev server on port 5173)
cd ../frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
agentic-rag-app/
├─ backend/                 # Express server
│  ├─ controllers/          # request handling (document, query)
│  ├─ middleware/           # auth middleware, rate‑limit, etc.
│  ├─ models/               # Mongoose schemas (User, Document, Chunk)
│  ├─ routes/               # API routes
│  ├─ services/             # LLM, embedding, vector‑store helpers
│  └─ server.js
├─ frontend/                # Vite + React UI
│  ├─ src/
│  │  ├─ api/               # Axios instance
│  │  ├─ components/        # reusable UI components
│  │  ├─ pages/             # page‑level components (Auth, Dashboard, …)
│  │  ├─ index.css
│  │  └─ main.jsx
│  └─ index.html
└─ README.md
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/register` | Register a new user (email, password) |
| **POST** | `/api/auth/login` | Login and receive JWT |
| **POST** | `/api/documents` | Upload a document (requires auth) |
| **GET**  | `/api/documents/:id` | Retrieve document metadata |
| **POST** | `/api/query` | Send a question, get LLM‑generated answer with citations |

All protected routes expect the JWT in the `Authorization: Bearer <token>` header.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome‑feature`)
3. Commit your changes with clear messages
4. Open a Pull Request

Please follow the existing code style (Prettier + ESLint) and write unit tests for new functionality.
.
