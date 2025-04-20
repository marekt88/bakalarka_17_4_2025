import os
import uuid
import pickle
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("custom_rag")

class AnnoyIndex:
    """
    A basic implementation of Annoy vector search functionality.
    This is a simplified version that doesn't rely on external libraries.
    """
    
    def __init__(self, vector_dimension=1536):
        self.vector_dimension = vector_dimension
        self.vectors = []
        self.user_data = []
        
    def add_item(self, vector, user_data):
        """Add a vector and its associated user data to the index."""
        self.vectors.append(vector)
        self.user_data.append(user_data)
    
    def build(self):
        """Build the index (in this simple version, just converts to numpy array)."""
        self.vectors = np.array(self.vectors, dtype=np.float32)
        logger.info(f"Built index with {len(self.vectors)} vectors")
    
    def save(self, file_path):
        """Save the index to a file."""
        data = {
            'vectors': self.vectors,
            'user_data': self.user_data,
            'dimension': self.vector_dimension
        }
        with open(file_path, 'wb') as f:
            pickle.dump(data, f)
        logger.info(f"Saved index to {file_path}")
    
    @classmethod
    def load(cls, file_path):
        """Load an index from a file."""
        with open(file_path, 'rb') as f:
            data = pickle.load(f)
        
        index = cls(vector_dimension=data['dimension'])
        index.vectors = data['vectors']
        index.user_data = data['user_data']
        
        logger.info(f"Loaded index with {len(index.vectors)} vectors")
        return index
    
    def query(self, query_vector, n=1):
        """
        Find the n most similar vectors to the query vector.
        
        Args:
            query_vector: The query vector
            n: Number of results to return
            
        Returns:
            List of SearchResult objects containing user data and distance
        """
        # Convert to numpy array if not already
        query_np = np.array(query_vector, dtype=np.float32)
        
        # Calculate cosine similarity (using angular distance approximation)
        # First normalize vectors
        query_norm = query_np / np.linalg.norm(query_np)
        
        # Initialize results
        results = []
        
        # For each vector, calculate similarity and collect results
        for i, vector in enumerate(self.vectors):
            vector_norm = vector / np.linalg.norm(vector)
            # Cosine similarity = dot product of normalized vectors
            similarity = np.dot(query_norm, vector_norm)
            # Convert to distance (1 - similarity)
            distance = 1 - similarity
            results.append((distance, self.user_data[i]))
        
        # Sort by distance (lower is better)
        results.sort(key=lambda x: x[0])
        
        # Return top n results as SearchResult objects
        return [SearchResult(distance=dist, userdata=ud) for dist, ud in results[:n]]

class SearchResult:
    """Simple container for search results."""
    def __init__(self, distance: float, userdata: Any):
        self.distance = distance
        self.userdata = userdata

class IndexBuilder:
    """Builder for the AnnoyIndex class."""
    def __init__(self, f=1536, metric="angular"):
        """
        Initialize the index builder.
        
        Args:
            f: Dimensionality of the vectors
            metric: Distance metric to use (only 'angular' is supported in this simplified version)
        """
        self.index = AnnoyIndex(vector_dimension=f)
    
    def add_item(self, vector, user_data):
        """Add a vector to the index."""
        self.index.add_item(vector, user_data)
    
    def build(self):
        """Build the index."""
        self.index.build()
    
    def save(self, file_path):
        """Save the index to a file."""
        self.index.save(file_path)

def tokenize_paragraphs(text):
    """Simple paragraph tokenizer based on double newlines."""
    # Split on double newlines, filter out empty strings
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    return paragraphs