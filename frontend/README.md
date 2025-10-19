# My Stuff AI - Frontend

React frontend for the RAG Document Chatbot built with Vite, styled-components, and a high-contrast black & white design.

## Features

- **Chat Interface**: Natural language querying with markdown-formatted responses
- **Files Dashboard**: Upload, view, download, and delete documents
- **Mobile Responsive**: Works seamlessly on mobile and desktop devices
- **Dark Theme**: High-contrast dark mode with white text for comfortable viewing
- **SPA Routing**: Smooth navigation between chat and files
- **State Management**: Zustand for efficient caching and persistence

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Styled Components**: CSS-in-JS styling
- **React Router**: Client-side routing
- **Axios**: API communication
- **React Markdown**: Render markdown responses
- **Zustand**: Lightweight state management with persistence

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Configure API endpoint** (optional):
   Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

3. **Start development server**:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory, which is served by the FastAPI backend.

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js         # API client with axios
│   ├── components/
│   │   ├── Chat.jsx           # Chat interface
│   │   ├── FilesDashboard.jsx # File management UI
│   │   └── Navigation.jsx     # Navigation bar
│   ├── store/
│   │   ├── chatStore.js       # Chat state with localStorage persistence
│   │   └── filesStore.js      # Files state with 30s caching
│   ├── styles/
│   │   ├── GlobalStyles.js    # Global CSS
│   │   └── theme.js           # Dark theme configuration
│   ├── App.jsx                # Main app with routing
│   ├── config.js              # API configuration
│   └── main.jsx               # Entry point
├── dist/                      # Production build (served by backend)
├── package.json
└── vite.config.js
```

## Components

### Chat

- Real-time messaging interface
- Markdown rendering for responses
- Loading states and error handling
- Source attribution

### Files Dashboard

- Grid layout of uploaded files
- Upload files via drag-and-drop or file picker
- View file metadata (size, type, upload date)
- Download and delete operations
- Processing status indicators

### Navigation

- **Collapsible Sidebar**: Left sidebar navigation that can be expanded (240px) or collapsed (60px)
- **Icon + Text**: Shows icons when collapsed, icons with labels when expanded
- **Mobile Responsive**: Hidden by default on mobile with hamburger menu to open
- **Smooth Transitions**: Animated collapse/expand with content area adjustment
- **Active Route**: Highlighted with white background and visual indicator

## Styling

The app uses a high-contrast dark theme:

- **Colors**: Black background (#000000) with white text (#FFFFFF) and gray accents
- **Typography**: System fonts for performance
- **Layout**: Responsive grid and flexbox
- **Interactions**: Clear hover states and transitions
- **Borders**: Bold 2px white borders for strong visual hierarchy

## State Management

### Chat Store

The chat store manages conversation state with persistence:

- **Messages**: Persisted to localStorage for session continuity
- **Actions**: `sendQuery()`, `addMessage()`, `clearChat()`
- **Benefits**: Conversation history survives page refreshes

### Files Store

The files store implements smart caching to reduce API calls:

- **Cache Duration**: 30 seconds
- **Actions**: `fetchFiles()`, `uploadFile()`, `deleteFile()`, `clearCache()`
- **Smart Loading**: Automatically checks cache validity before fetching
- **Optimistic Updates**: Immediate UI updates for delete operations

## API Integration

The frontend communicates with the FastAPI backend through REST APIs:

- `POST /api/v1/files/upload` - Upload files
- `GET /api/v1/files/` - List all files
- `GET /api/v1/files/{id}` - Get file details
- `DELETE /api/v1/files/{id}` - Delete file
- `POST /api/v1/query` - Send chat queries

## Mobile Support

- Responsive breakpoints at 768px and 1024px
- Fixed bottom navigation on mobile
- Touch-optimized interactions
- Optimized layouts for small screens

## Deployment

The production build is automatically served by the FastAPI backend at the root path (`/`). No separate hosting required!

Just build the frontend and start the backend:

```bash
cd frontend && npm run build
cd ../backend && uvicorn app.main:app --reload
```

Visit http://localhost:8000 to see the full application.
