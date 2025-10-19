# My Stuff AI - RAG Document Chatbot Backend

A powerful RAG (Retrieval-Augmented Generation) powered chatbot backend for querying personal documents using FastAPI, ChromaDB, Groq LLM, and Backblaze B2 storage.

## Features

- **Document Upload & Management**: Upload PDF, DOCX, TXT, CSV, and XLSX files
- **Automatic Processing**: Files are automatically chunked and embedded into ChromaDB
- **Intelligent Querying**: Natural language queries with intent detection
- **Smart Responses**: Returns either file download links or AI-generated answers
- **Cloud Storage**: Files stored in Backblaze B2 for reliability and scalability
- **Vector Search**: ChromaDB for semantic search across all documents

## Architecture

### MVC Pattern

- **Models**: SQLAlchemy models for file metadata
- **Services**: Business logic layer (Backblaze, ChromaDB, Groq, Document Processing, File Management)
- **Routers**: API endpoints for file operations and querying

### Tech Stack

- **FastAPI**: High-performance web framework
- **SQLAlchemy**: Database ORM (SQLite by default)
- **ChromaDB**: Vector database for embeddings
- **Groq**: LLM for intent detection and response generation
- **Backblaze B2**: Cloud storage for files
- **LangChain**: Text splitting and chunking

## Installation

### Prerequisites

- Python 3.9+
- Groq API key
- Backblaze B2 account and credentials
- ChromaDB Cloud account (or self-hosted instance)

### Setup

1. **Clone the repository and navigate to backend**

```bash
cd backend
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file in the backend directory:

```env
# Application Settings
APP_NAME=My Stuff AI API
APP_VERSION=1.0.0
DEBUG=True

# Database
DATABASE_URL=sqlite:///./app.db

# API Settings
API_PREFIX=/api/v1

# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Backblaze B2
BACKBLAZE_APPLICATION_KEY=your_backblaze_application_key_here
BACKBLAZE_KEY_ID=your_backblaze_key_id_here
BACKBLAZE_KEY_NAME=your_backblaze_key_name_here
BACKBLAZE_BUCKET_NAME=your_bucket_name_here

# ChromaDB Cloud
CHROMA_TENANT=your_chroma_tenant_here
CHROMA_DATABASE=your_chroma_database_here
CHROMA_API_KEY=your_chroma_api_key_here

# File Upload Settings
MAX_FILE_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,doc,txt,csv,xlsx,xls
```

5. **Run the application**

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Python directly
python -m app.main
```

6. **Access the API**

- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Health Check

- `GET /health` - Check API health status

### File Management

#### Upload File

```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**

```json
{
  "id": 1,
  "filename": "uuid_document.pdf",
  "original_name": "document.pdf",
  "file_type": "pdf",
  "file_size": 1024000,
  "backblaze_url": "https://...",
  "upload_date": "2024-01-01T00:00:00",
  "is_processed": true
}
```

#### Get File

```http
GET /api/v1/files/{file_id}
```

**Response:**

```json
{
  "id": 1,
  "filename": "uuid_document.pdf",
  "original_name": "document.pdf",
  "file_type": "pdf",
  "file_size": 1024000,
  "backblaze_url": "https://...",
  "chroma_collection_id": "file_abc123",
  "upload_date": "2024-01-01T00:00:00",
  "is_processed": true
}
```

#### List All Files

```http
GET /api/v1/files/
```

**Response:**

```json
{
  "files": [...],
  "total": 10
}
```

#### Delete File

```http
DELETE /api/v1/files/{file_id}
```

**Response:**

```json
{
  "message": "File deleted successfully",
  "file_id": 1,
  "filename": "document.pdf"
}
```

### Query Endpoint

#### Query Documents

```http
POST /api/v1/query
Content-Type: application/json

{
  "query": "What is my current role mentioned in the resume?"
}
```

**Response:**

```json
{
  "markdown_response": "Based on your resume, your current role is...",
  "sources": [
    {
      "filename": "resume.pdf",
      "chunk_id": "abc123",
      "relevance_score": 0.95
    }
  ],
  "intent": "information_query"
}
```

**Example - File Retrieval:**

```http
POST /api/v1/query
Content-Type: application/json

{
  "query": "Give me my resume"
}
```

**Response:**

```json
{
  "markdown_response": "Here's your resume:\n\n[resume.pdf](https://f002.backblazeb2.com/...)",
  "sources": [...],
  "intent": "file_retrieval"
}
```

## How It Works

### File Upload Pipeline

1. **Validation**: File type and size validation
2. **Upload to B2**: File stored in Backblaze B2 cloud storage
3. **Text Extraction**: Text extracted from document (PDF, DOCX, etc.)
4. **Chunking**: Document split into chunks (500 tokens, 50 overlap)
5. **Vector Storage**: Chunks embedded and stored in ChromaDB
6. **Database Record**: Metadata saved to SQLite database

### Query Pipeline

1. **Intent Detection**: Groq LLM analyzes query to determine intent

   - `file_retrieval`: User wants to download a file
   - `information_query`: User wants information from documents

2. **Vector Search**: ChromaDB searches for relevant chunks across all documents

3. **Response Generation**:

   - **File Retrieval**: Returns markdown with download links
   - **Information Query**: Groq generates answer using retrieved context

4. **Source Attribution**: Returns source documents and relevance scores

## Supported File Types

- PDF (`.pdf`)
- Word Documents (`.docx`, `.doc`)
- Text Files (`.txt`)
- CSV Files (`.csv`)
- Excel Files (`.xlsx`, `.xls`)

## Development

### Project Structure

```
backend/
├── app/
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py          # Configuration management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py          # Database setup
│   │   └── file.py              # File model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── file.py              # File schemas
│   │   └── query.py             # Query schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── backblaze_service.py # B2 storage
│   │   ├── chroma_service.py    # Vector database
│   │   ├── document_processor.py # Text extraction
│   │   ├── groq_service.py      # LLM operations
│   │   └── file_service.py      # File orchestration
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── files.py             # File endpoints
│   │   └── query.py             # Query endpoints
│   ├── __init__.py
│   └── main.py                  # Application entry point
├── requirements.txt
├── .env                         # Environment variables (create this)
└── README.md
```

### Adding New File Types

To add support for new file types, edit:

1. **settings.py**: Add extension to `allowed_extensions`
2. **document_processor.py**: Add extraction method for the new format

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid file type, size, or empty file
- **404 Not Found**: File or resource not found
- **500 Internal Server Error**: Processing errors with rollback

All errors include detailed messages for debugging.

## Rollback Mechanism

If any step of the upload pipeline fails, the system automatically:

1. Deletes the file from Backblaze B2 (if uploaded)
2. Deletes the ChromaDB collection (if created)
3. Prevents database record creation

## Performance Considerations

- **Chunking**: Default 500 tokens with 50 token overlap (configurable)
- **Vector Search**: Returns top 5 most relevant chunks
- **File Size Limit**: 50MB default (configurable)
- **Batch Processing**: Consider background tasks for large files

## Security Notes

⚠️ **Important for Production:**

1. **CORS**: Update `allow_origins` in `main.py` to specific domains
2. **Environment Variables**: Never commit `.env` file
3. **API Keys**: Rotate keys regularly
4. **File Validation**: Additional validation recommended for production
5. **Authentication**: Add authentication middleware for production use

## Troubleshooting

### Database Issues

```bash
# Delete and recreate database
rm app.db
# Database will be recreated on next startup
```

### ChromaDB Connection Issues

- Verify `CHROMA_HOST`, `CHROMA_PORT`, and `CHROMA_API_KEY`
- Check network connectivity to ChromaDB cloud

### Backblaze B2 Issues

- Verify credentials and bucket permissions
- Ensure bucket is public-read or has appropriate policies

## Future Enhancements

- [ ] Background task processing for large files
- [ ] User authentication and multi-tenancy
- [ ] File versioning
- [ ] Advanced search filters
- [ ] Conversation history
- [ ] Support for more file formats (images with OCR, audio transcripts)
- [ ] Caching for frequent queries
- [ ] Rate limiting
- [ ] Webhook notifications

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
