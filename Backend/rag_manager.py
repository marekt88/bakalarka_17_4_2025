import os
import pickle
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from livekit.plugins import openai
from livekit.agents import llm

# Import our custom RAG implementation instead of livekit.plugins.rag
from custom_rag import AnnoyIndex

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_manager")

class RAGManager:
    """
    Manages Retrieval-Augmented Generation (RAG) operations for the LiveKit AI voice agent.
    Handles loading, querying, and maintaining the vector database of knowledge.
    """
    
    def __init__(self):
        self.index_dir = Path(os.path.dirname(os.path.abspath(__file__))) / "rag_index"
        self.vdb_path = self.index_dir / "vdb_data"
        self.paragraphs_path = self.index_dir / "knowledge_data.pkl"
        self.embeddings_dimension = 1536  # OpenAI text-embedding-3-small dimensions
        self.annoy_index = None
        self.paragraphs_by_uuid = {}
        self.is_loaded = False
        
    def load(self) -> bool:
        """Load the vector database and knowledge paragraphs."""
        try:
            # Check if the necessary files exist
            if not self.vdb_path.exists() or not self.paragraphs_path.exists():
                logger.warning("RAG data files not found. Run the indexer first.")
                return False
                
            # Load the Annoy index from our custom implementation
            self.annoy_index = AnnoyIndex.load(str(self.vdb_path))
            
            # Load the paragraphs data
            with open(self.paragraphs_path, "rb") as f:
                self.paragraphs_by_uuid = pickle.load(f)
                
            logger.info(f"RAG system loaded with {len(self.paragraphs_by_uuid)} paragraphs")
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading RAG system: {e}")
            self.is_loaded = False
            return False
    
    async def generate_embedding(self, text: str) -> Optional[Any]:
        """Generate embedding for a piece of text."""
        try:
            results = await openai.create_embeddings(
                input=[text],
                model="text-embedding-3-small",
                dimensions=self.embeddings_dimension,
            )
            return results[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None
    
    async def retrieve_context(self, query: str, max_results: int = 3) -> str:
        """
        Retrieve relevant context for a given query.
        
        Args:
            query: The user query to find relevant context for
            max_results: Maximum number of paragraphs to retrieve
            
        Returns:
            A string containing the retrieved context, or empty string if retrieval failed
        """
        if not self.is_loaded and not self.load():
            logger.warning("RAG system is not loaded properly")
            return ""
        
        try:
            # Generate embedding for the query
            query_embedding = await self.generate_embedding(query)
            if not query_embedding:
                return ""
            
            # Query the vector database for relevant paragraphs
            results = self.annoy_index.query(query_embedding, n=max_results)
            
            # Compose context from retrieved paragraphs
            context_parts = []
            for i, result in enumerate(results):
                paragraph = self.paragraphs_by_uuid.get(result.userdata, "")
                if paragraph:
                    context_parts.append(f"Context {i+1}:\n{paragraph}\n")
            
            # Join all context parts into a single string
            context = "\n".join(context_parts)
            
            logger.info(f"RAG retrieved {len(results)} context paragraphs for query: {query[:50]}...")
            return context
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return ""
    
    async def enrich_chat_context(self, agent, chat_ctx: llm.ChatContext) -> bool:
        """
        Enrich the chat context with relevant knowledge from the RAG system.
        
        This function is designed to be used as a callback for LiveKit's VoicePipelineAgent.
        
        Args:
            agent: The VoicePipelineAgent instance
            chat_ctx: The ChatContext to enrich with RAG knowledge
            
        Returns:
            True if the context was successfully enriched, False otherwise
        """
        if not self.is_loaded and not self.load():
            logger.warning("RAG system is not loaded properly")
            return False
        
        try:
            # Get the latest user message
            user_msg = chat_ctx.messages[-1]
            if user_msg.role != "user":
                return False
                
            # Retrieve relevant context for the user's message
            context = await self.retrieve_context(user_msg.content)
            if not context:
                return False
                
            # Insert the context as an assistant message before the user's message
            rag_msg = llm.ChatMessage.create(
                text=f"Here is some relevant context that may help answer the user's question:\n\n{context}",
                role="assistant",
            )
            
            # Replace the last message with RAG context, then add user message back
            chat_ctx.messages[-1] = rag_msg
            chat_ctx.messages.append(user_msg)
            
            return True
            
        except Exception as e:
            logger.error(f"Error enriching chat context: {e}")
            return False

# Singleton instance for application-wide use
rag_manager = RAGManager()