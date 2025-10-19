# My Stuff AI - RAG Document Chatbot

A full-stack RAG (Retrieval-Augmented Generation) powered chatbot for querying personal documents. Upload PDFs, Word docs, Excel files, and more, then ask questions in natural language.

## Features

### Backend (FastAPI)

- **Document Upload**: Support for PDF, DOCX, DOC, TXT, CSV, XLSX, XLS
- **Automatic Processing**: Text extraction, chunking, and vector embedding
- **Cloud Storage**: Files stored in Backblaze B2
- **Vector Database**: ChromaDB Cloud for semantic search
- **LLM Integration**: Groq API for intent detection and response generation
- **Smart Responses**: Returns either file download links or AI-generated answers
- **Error Handling**: Automatic rollback on failures

### Frontend (React)

- **Chat Interface**: Natural language querying with markdown responses
- **Files Dashboard**: Upload, view, download, and delete documents
- **Mobile Responsive**: Works on all devices
- **High Contrast Design**: Black and white for maximum readability

## Architecture

```
┌─────────────────┐
│   React SPA     │ ← User Interface (Chat + Files Dashboard)
│  (Vite + SC)    │
└────────┬────────┘
         │
         │ HTTP
         ↓
┌─────────────────┐
│  FastAPI        │ ← API Layer (MVC Pattern)
│  Backend         │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    ↓          ↓          ↓          ↓
┌────────┐┌────────┐┌─────────┐┌────────┐
│SQLite  ││Backblaze││ChromaDB ││ Groq   │
│(Meta)  ││  B2     ││ Cloud   ││  API   │
└────────┘└────────┘└─────────┘└────────┘
```

## Quick Start

### Prerequisites

- Python 3.12
- Node.js 18+
- Groq API key
- Backblaze B2 account
- ChromaDB Cloud account

### Backend Setup

1. **Install dependencies**:

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure environment**:
   Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_key
BACKBLAZE_APPLICATION_KEY=your_key
BACKBLAZE_KEY_ID=your_key_id
BACKBLAZE_KEY_NAME=your_key_name
BACKBLAZE_BUCKET_NAME=your_bucket
CHROMA_TENANT=your_tenant
CHROMA_DATABASE=your_database
CHROMA_API_KEY=your_chroma_key
```

3. **Run backend**:

```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. **Install dependencies**:

```bash
cd frontend
npm install
```

2. **Build for production**:

```bash
npm run build
```

The frontend is automatically served by FastAPI at http://localhost:8000

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

### Frontend Development

```bash
cd frontend
npm run dev
```

Dev server at http://localhost:5173

## API Endpoints

### Files

- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/` - List all files
- `GET /api/v1/files/{id}` - Get file details
- `DELETE /api/v1/files/{id}` - Delete file

### Query

- `POST /api/v1/query` - Send natural language query

## Usage Examples

### Upload a Document

1. Go to Files Dashboard
2. Click "Upload File"
3. Select a PDF, Word doc, or other supported file
4. File is automatically processed and embedded

### Query Your Documents

```
"What is my current role?"
→ Returns: AI-generated answer with citations

"Give me my resume"
→ Returns: Download link in markdown format
```

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy (SQLite)
- ChromaDB Client
- Groq API
- Backblaze B2 SDK
- LangChain Text Splitters
- PyPDF2, python-docx, openpyxl

### Frontend

- React 18
- Vite
- Styled Components
- React Router
- Axios
- React Markdown

## Project Structure

```
my-stuff-ai/
├── backend/
│   ├── app/
│   │   ├── config/
│   │   │   └── settings.py
│   │   ├── models/
│   │   │   ├── database.py
│   │   │   └── file.py
│   │   ├── schemas/
│   │   │   ├── file.py
│   │   │   └── query.py
│   │   ├── services/
│   │   │   ├── backblaze_service.py
│   │   │   ├── chroma_service.py
│   │   │   ├── document_processor.py
│   │   │   ├── file_service.py
│   │   │   └── groq_service.py
│   │   ├── routers/
│   │   │   ├── files.py
│   │   │   └── query.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── .env
│   └── README.md
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    ├── dist/              # Built by backend
    ├── package.json
    └── README.md
```

## Features in Detail

### Document Processing Pipeline

1. **Upload**: File sent to Backblaze B2
2. **Extraction**: Text extracted using format-specific libraries
3. **Chunking**: Split into 500-token chunks with 50-token overlap
4. **Embedding**: Stored in ChromaDB with auto-generated embeddings
5. **Metadata**: File info saved to SQLite

### Query Processing

1. **Intent Detection**: Groq LLM classifies query type
2. **Vector Search**: ChromaDB finds relevant chunks
3. **Response Generation**:
   - File retrieval: Returns download link in markdown
   - Information query: Generates answer with RAG

### Error Recovery

- Automatic rollback if any pipeline step fails
- Cleans up B2, ChromaDB, and database records
- Comprehensive error logging

## Deployment

### Single Server Deployment

```bash
# Build frontend
cd frontend && npm run build

# Start backend (serves frontend + API)
cd ../backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Visit http://your-server:8000

### Docker (Optional)

```dockerfile
# Example Dockerfile
FROM python:3.12-slim
# ... copy backend, install deps
# ... copy frontend/dist
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Configuration

### Environment Variables

**Backend** (`backend/.env`):

- `GROQ_API_KEY` - Groq API key
- `BACKBLAZE_*` - Backblaze B2 credentials
- `CHROMA_*` - ChromaDB Cloud credentials
- `MAX_FILE_SIZE_MB` - Max upload size (default: 50)
- `GROQ_MODEL` - LLM model (default: llama-3.3-70b-versatile)

**Frontend** (`frontend/.env`):

- `VITE_API_BASE_URL` - API endpoint (default: http://localhost:8000)

## Troubleshooting

### Backend Issues

- Check `.env` file has all required variables
- Verify Groq, Backblaze, and ChromaDB credentials
- Check logs for detailed error messages

### Frontend Issues

- Rebuild: `cd frontend && npm run build`
- Clear browser cache
- Check browser console for errors

### Common Errors

- **ChromaDB connection**: Verify tenant, database, and API key
- **Groq model error**: Update GROQ_MODEL to latest available
- **File upload fails**: Check Backblaze permissions and bucket config

## Performance

- File uploads: ~2-5s depending on size
- Query response: ~1-3s for RAG queries
- Vector search: <100ms
- Supports files up to 50MB

## Security

⚠️ **Production Checklist**:

- [ ] Update CORS origins in `main.py`
- [ ] Add authentication middleware
- [ ] Use HTTPS
- [ ] Rotate API keys regularly
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable request logging

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ using FastAPI, React, ChromaDB, and Groq
