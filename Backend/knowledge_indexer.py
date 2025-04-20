import asyncio
import pickle
import uuid
import os
import aiohttp
from pathlib import Path
from datetime import datetime
from livekit.agents import tokenize
from livekit.plugins import openai
from tqdm import tqdm
from dotenv import load_dotenv

# Import our custom RAG implementation instead of livekit.plugins.rag
from custom_rag import IndexBuilder, tokenize_paragraphs

load_dotenv()

# Configuration
EMBEDDINGS_DIMENSION = 1536  # OpenAI text-embedding-3-small dimensions
KNOWLEDGE_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "knowledgebase"
INDEX_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "rag_index"
PROCESSED_FILES = set()  # Track already processed files

# Ensure directories exist
KNOWLEDGE_DIR.mkdir(exist_ok=True)
INDEX_DIR.mkdir(exist_ok=True)

# File to track processed files
PROCESSED_FILES_RECORD = INDEX_DIR / "processed_files.txt"

async def create_embeddings(input_text, http_session):
    """Generate embeddings for the given text using OpenAI's embedding model."""
    results = await openai.create_embeddings(
        input=[input_text],
        model="text-embedding-3-small",
        dimensions=EMBEDDINGS_DIMENSION,
        http_session=http_session
    )
    return results[0]

def load_processed_files():
    """Load the list of already processed files."""
    if PROCESSED_FILES_RECORD.exists():
        with open(PROCESSED_FILES_RECORD, "r", encoding="utf-8") as f:
            return set(f.read().splitlines())
    return set()

def save_processed_files(processed_files):
    """Save the list of processed files."""
    with open(PROCESSED_FILES_RECORD, "w", encoding="utf-8") as f:
        f.write("\n".join(processed_files))

async def process_knowledge_file(file_path, idx_builder, paragraphs_by_uuid, http_session):
    """Process a single knowledge file, generating embeddings for each paragraph."""
    print(f"Processing file: {file_path}")
    
    # Read file content
    with open(file_path, "r", encoding="utf-8") as f:
        raw_data = f.read()
    
    # Process paragraphs - use our custom tokenize_paragraphs function if tokenize.basic is not available
    file_paragraphs = 0
    try:
        paragraphs = tokenize.basic.tokenize_paragraphs(raw_data)
    except AttributeError:
        # Fall back to our custom implementation
        paragraphs = tokenize_paragraphs(raw_data)
    
    for p in paragraphs:
        # Skip empty paragraphs or ones that are too short
        if len(p.strip()) < 10:
            continue
            
        p_uuid = uuid.uuid4()
        paragraphs_by_uuid[p_uuid] = p
        
        # Generate embedding and add to index
        resp = await create_embeddings(p, http_session)
        idx_builder.add_item(resp.embedding, p_uuid)
        
        file_paragraphs += 1
    
    print(f"Added {file_paragraphs} paragraphs from {file_path}")
    return file_paragraphs

async def main():
    """Process all knowledge base files and build vector database."""
    # Load existing processed files
    processed_files = load_processed_files()
    
    # Get all .txt files in knowledge directory
    knowledge_files = list(KNOWLEDGE_DIR.glob("*.txt"))
    
    # Check if there are any new files to process
    new_files = [f for f in knowledge_files if str(f) not in processed_files]
    
    if not new_files:
        print("No new knowledge files to process.")
        return False
    
    print(f"Found {len(new_files)} new knowledge files to process")
    
    # Initialize the index builder from our custom implementation
    idx_builder = IndexBuilder(f=EMBEDDINGS_DIMENSION, metric="angular")
    
    # Load existing paragraphs data if available
    paragraphs_by_uuid = {}
    paragraphs_file = INDEX_DIR / "knowledge_data.pkl"
    if paragraphs_file.exists():
        with open(paragraphs_file, "rb") as f:
            try:
                paragraphs_by_uuid = pickle.load(f)
                print(f"Loaded {len(paragraphs_by_uuid)} existing paragraphs")
            except Exception as e:
                print(f"Error loading existing paragraphs: {e}")
    
    # Process each file
    total_paragraphs = 0
    async with aiohttp.ClientSession() as http_session:
        for file_path in tqdm(new_files):
            try:
                file_paragraphs = await process_knowledge_file(
                    file_path, idx_builder, paragraphs_by_uuid, http_session
                )
                total_paragraphs += file_paragraphs
                processed_files.add(str(file_path))
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
    
    # Build and save the index
    if total_paragraphs > 0:
        idx_builder.build()
        idx_builder.save(str(INDEX_DIR / "vdb_data"))
        
        # Save paragraphs data
        with open(paragraphs_file, "wb") as f:
            pickle.dump(paragraphs_by_uuid, f)
            
        # Save processed files list
        save_processed_files(processed_files)
        
        print(f"Index created with {total_paragraphs} new paragraphs")
        print(f"Total paragraphs in index: {len(paragraphs_by_uuid)}")
        
        # Save a timestamp file to mark when the index was last updated
        with open(INDEX_DIR / "last_updated.txt", "w") as f:
            f.write(datetime.now().isoformat())
            
        return True
    
    return False

def run_indexer():
    """Run the indexer and return whether new data was processed."""
    return asyncio.run(main())

if __name__ == "__main__":
    run_indexer()