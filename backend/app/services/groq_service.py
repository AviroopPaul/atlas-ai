from groq import Groq
import logging
from typing import List, Dict, Any
from app.config.settings import get_settings
import json

logger = logging.getLogger(__name__)
settings = get_settings()


class GroqService:
    """Service for LLM operations using Groq API."""

    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    def detect_query_intent(self, query: str, available_files: List[str]) -> Dict[str, Any]:
        """
        Detect user's intent from query using Groq LLM.

        Args:
            query: User's query text
            available_files: List of available filenames

        Returns:
            Dict with 'intent' (file_retrieval or information_query) and 'target_file' if applicable
        """
        try:
            files_list = "\n".join(
                [f"- {f}" for f in available_files]) if available_files else "No files available"

            system_prompt = f"""You are an intelligent assistant that analyzes user queries to determine their intent.

Available files in the system:
{files_list}

Your task is to classify the query into one of two intents:
1. "file_retrieval" - User wants to download/get a specific file (e.g., "give me the resume", "send me contract.pdf")
2. "information_query" - User wants information from documents (e.g., "what does my resume say about skills?", "summarize the contract")

Respond ONLY with a JSON object in this exact format:
{{"intent": "file_retrieval" or "information_query", "target_file": "filename if applicable or null"}}

Examples:
Query: "Give me the resume"
Response: {{"intent": "file_retrieval", "target_file": "resume.pdf"}}

Query: "What experience is listed in my resume?"
Response: {{"intent": "information_query", "target_file": null}}

Query: "Send me the contract document"
Response: {{"intent": "file_retrieval", "target_file": "contract.docx"}}
"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.1,
                max_tokens=150
            )

            result_text = response.choices[0].message.content.strip()

            # Parse JSON response
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                # Fallback to information_query if parsing fails
                logger.warning(f"Failed to parse intent JSON: {result_text}")
                result = {"intent": "information_query", "target_file": None}

            logger.info(f"Detected intent: {result}")
            return result

        except Exception as e:
            logger.error(f"Failed to detect query intent: {str(e)}")
            # Default to information query on error
            return {"intent": "information_query", "target_file": None}

    def generate_rag_response(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        intent: str,
        chat_history: List[Dict[str, str]],
        file_urls: Dict[str, str] = None
    ) -> str:
        """
        Generate RAG response using retrieved context.

        Args:
            query: User's query
            context_chunks: Retrieved document chunks with metadata
            intent: Query intent (file_retrieval or information_query)
            chat_history: List of previous messages [{"role": "user"/"assistant", "content": "..."}]
            file_urls: Dict mapping filenames to download URLs

        Returns:
            Markdown-formatted response
        """
        try:
            if intent == "file_retrieval" and file_urls:
                # Generate file retrieval response with download links
                return self._generate_file_retrieval_response(query, context_chunks, file_urls, chat_history)
            else:
                # Generate information query response
                return self._generate_information_response(query, context_chunks, chat_history)

        except Exception as e:
            logger.error(f"Failed to generate RAG response: {str(e)}")
            raise

    def _generate_file_retrieval_response(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        file_urls: Dict[str, str],
        chat_history: List[Dict[str, str]]
    ) -> str:
        """Generate response for file retrieval intent with download links."""
        try:
            # Use only the most relevant source (first chunk)
            context_text = ""
            if context_chunks:
                most_relevant = context_chunks[0]
                context_text = most_relevant.get('document', '')

            system_prompt = """You are a helpful assistant. The user is asking for a file.
Based on the context provided, generate a natural, friendly response that includes download links for the relevant files.

Format the response in markdown with clickable download links like this:
[filename](download_url)

Be conversational and helpful. DO NOT mention sources, chunk numbers, or document metadata in your response."""

            user_prompt = f"""User query: {query}

Available files and URLs:
{chr(10).join([f"- {name}: {url}" for name, url in file_urls.items()])}

Context from relevant document:
{context_text}

Generate a friendly response with download links in markdown format."""

            # Build messages with chat history
            messages = [{"role": "system", "content": system_prompt}]

            # Add chat history if provided
            if chat_history:
                messages.extend(chat_history)

            # Add current user query
            messages.append({"role": "user", "content": user_prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(
                f"Failed to generate file retrieval response: {str(e)}")
            # Fallback response
            links = "\n".join(
                [f"- [{name}]({url})" for name, url in file_urls.items()])
            return f"Here are the files you requested:\n\n{links}"

    def _generate_information_response(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        chat_history: List[Dict[str, str]]
    ) -> str:
        """Generate response for information query intent."""
        try:
            if not context_chunks:
                return "I couldn't find any relevant information in your documents to answer that question."

            # Use only the most relevant source (first chunk)
            context_text = context_chunks[0].get('document', '')

            system_prompt = """You are a helpful AI assistant that answers questions based on the user's documents.

Your task:
1. Answer the user's question using ONLY the information provided in the context
2. Format your response in clean, readable markdown
3. Be concise but comprehensive
4. If the context doesn't contain enough information, say so
5. Use bullet points, headings, and formatting to make the response easy to read

DO NOT:
- Make up information that's not in the context
- Mention source documents, filenames, or chunk numbers in your response
- Include any metadata or technical information about the documents"""

            user_prompt = f"""User question: {query}

Context from documents:
{context_text}

Please answer the question based on the context above."""

            # Build messages with chat history
            messages = [{"role": "system", "content": system_prompt}]

            # Add chat history if provided
            if chat_history:
                messages.extend(chat_history)

            # Add current user query
            messages.append({"role": "user", "content": user_prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=1000
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Failed to generate information response: {str(e)}")
            raise


def get_groq_service() -> GroqService:
    """Get GroqService instance."""
    return GroqService()
