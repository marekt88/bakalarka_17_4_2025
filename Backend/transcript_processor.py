import os
import time
import json
import logging
import asyncio
from openai import OpenAI, AsyncOpenAI
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Optional

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("transcript_processor")

# Load environment variables
load_dotenv()

# Make sure we have the OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.error("OpenAI API key not found. Make sure OPENAI_API_KEY is set in your environment variables.")
    raise ValueError("OPENAI_API_KEY environment variable is required")

class TranscriptProcessor:
    """Processes transcripts and generates AI voice agent prompts using GPT-4o"""
    
    def __init__(self, base_dir: Optional[str] = None):
        """Initialize the transcript processor."""
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.base_dir = Path(base_dir)
        self.transcripts_dir = self.base_dir / "transcripts"
        self.onboarding_dir = self.transcripts_dir / "onboarding"
        self.prompts_dir = self.base_dir / "generated_prompts"
        
        # Create directories if they don't exist
        self.onboarding_dir.mkdir(exist_ok=True, parents=True)
        self.prompts_dir.mkdir(exist_ok=True)
        
        # Track processed files
        self.processed_files = set()
        self.processed_files_path = self.prompts_dir / "processed_files.json"
        self._load_processed_files()
        
        # Initialize the OpenAI client with the API key
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        logger.info(f"TranscriptProcessor initialized with base directory: {self.base_dir}")
    
    def _load_processed_files(self):
        """Load the list of already processed files."""
        if self.processed_files_path.exists():
            try:
                with open(self.processed_files_path, "r", encoding="utf-8") as f:
                    self.processed_files = set(json.load(f))
                logger.info(f"Loaded {len(self.processed_files)} processed files from record")
            except Exception as e:
                logger.error(f"Error loading processed files record: {e}")
                self.processed_files = set()
        else:
            self.processed_files = set()
    
    def _save_processed_files(self):
        """Save the list of processed files."""
        try:
            with open(self.processed_files_path, "w", encoding="utf-8") as f:
                json.dump(list(self.processed_files), f)
            logger.info(f"Saved {len(self.processed_files)} processed files to record")
        except Exception as e:
            logger.error(f"Error saving processed files record: {e}")
    
    async def _generate_prompt_with_gpt4o(self, transcript_content: str) -> str:
        """Generate an AI voice agent prompt using GPT-4o."""
        try:
            system_prompt = "You are an AI assistant specialized in analyzing conversation transcripts and creating detailed voice agent prompts."
            
            user_prompt = (
                "Turn Transcript into Detailed Voice Agent Prompt.\n\n"
                "You are given a transcript of a conversation between a user and an AI voice agent. "
                "This conversation takes place on a platform that allows users to create their own AI voice agents by speaking with another AI agent.\n\n"
                "The goal of the AI voice agent in the transcript is to ask relevant questions and collect important contextual information "
                "that will help generate a tailored AI voice agent for the user.\n\n"
                "✅ Your Task\n"
                "Based on the transcript, create a detailed, well-structured AI voice agent prompt in markdown. "
                "This prompt will define the behavior, tone, and conversation flow for the new AI voice agent the user wants to create.\n\n"
                "Use the following structure (as in the example below) to write the prompt:\n\n"
                "📌 Format Example: (Use this format for the output)\n"
                "```markdown\n"
                "# [Agent Name] Prompt\n\n"
                "## Identity & Purpose\n"
                "Describe who the AI voice agent is, what company or brand it represents, and what its main goal is during calls.\n\n"
                "## Voice & Persona\n\n"
                "### Personality\n"
                "- Describe the tone and attitude the agent should have (e.g., friendly, professional, supportive).\n\n"
                "### Speech Characteristics\n"
                "- Outline how the agent should sound (e.g., clear, concise, uses contractions, avoids jargon).\n\n"
                "## Conversation Flow\n\n"
                "### Introduction\n"
                "How should the agent introduce itself and the purpose of the call?\n\n"
                "### Core Dialogue Topics\n"
                "Include the main types of questions or information the agent should gather or deliver, based on the user's goals. "
                "Organize them as a clear sequence:\n"
                "1. [Step 1: e.g., Discover needs]\n"
                "2. [Step 2: e.g., Uncover pain points]\n"
                "3. [Step 3: e.g., Suggest action, etc.]\n\n"
                "### Objection Handling (Optional)\n"
                "Describe how the agent should respond to skepticism, disinterest, or objections.\n\n"
                "### Closing\n"
                "What should the agent say to wrap up the conversation? Provide options for different outcomes "
                "(e.g., interest, not interested, follow-up).\n\n"
                "## Response Guidelines\n"
                "- How long should answers be?\n"
                "- How should the agent ask questions?\n"
                "- What tone should be used when referencing the user's replies?\n\n"
                "## Knowledge Base (Optional)\n"
                "Add any specific information the agent should reference during calls "
                "(e.g., product benefits, common customer pain points, unique selling points).\n\n"
                "## Ideal Customer Profile (Optional)\n"
                "Define who the agent is trying to speak with and who the ideal target audience is "
                "(e.g., small business owners, homeowners, HR managers, etc.).\n"
                "```\n\n"
                "🔽 Input\n"
                "Here is the transcript of the conversation you'll base the prompt on:\n\n"
                f"{transcript_content}"
            )
            
            # Using the new OpenAI API (1.0.0+) pattern
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=4000
                )
                
                generated_prompt = response.choices[0].message.content
                logger.info("Successfully generated voice agent prompt")
                return generated_prompt
                
            except Exception as e:
                logger.error(f"Error generating prompt with OpenAI API: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return f"Error generating prompt: {str(e)}"
        
        except Exception as e:
            logger.error(f"Error in prompt generation process: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return f"Error generating prompt: {str(e)}"
    
    def _read_transcript(self, file_path: Path) -> str:
        """Read the content of a transcript file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading transcript file {file_path}: {e}")
            return ""
    
    def _save_generated_prompt(self, file_name: str, prompt_content: str):
        """Save the generated prompt to a file."""
        try:
            # Create a similar filename but with _prompt suffix
            prompt_file = self.prompts_dir / f"{Path(file_name).stem}_prompt.md"
            
            with open(prompt_file, "w", encoding="utf-8") as f:
                f.write(prompt_content)
            
            logger.info(f"Saved generated prompt to {prompt_file}")
            return prompt_file
        except Exception as e:
            logger.error(f"Error saving generated prompt: {e}")
            return None
    
    async def process_new_transcripts(self):
        """Check for new transcript files and process them."""
        # Get list of all transcript files in onboarding directory
        transcript_files = list(self.onboarding_dir.glob("*.md"))
        
        # Find new unprocessed files
        new_files = [f for f in transcript_files if str(f) not in self.processed_files]
        
        if not new_files:
            logger.info("No new transcripts to process")
            return
        
        logger.info(f"Found {len(new_files)} new transcript(s) to process")
        
        for file_path in new_files:
            try:
                logger.info(f"Processing transcript: {file_path}")
                
                # Read transcript content
                transcript_content = self._read_transcript(file_path)
                if not transcript_content:
                    continue
                
                # Generate prompt with GPT-4o
                generated_prompt = await self._generate_prompt_with_gpt4o(transcript_content)
                
                # Save the generated prompt
                saved_path = self._save_generated_prompt(file_path.name, generated_prompt)
                
                if saved_path:
                    # Mark as processed
                    self.processed_files.add(str(file_path))
                    self._save_processed_files()
                    logger.info(f"Successfully processed {file_path.name}")
            
            except Exception as e:
                logger.error(f"Error processing transcript {file_path}: {e}")

async def main():
    """Main function to run the transcript processor."""
    processor = TranscriptProcessor()
    
    # Process new transcripts once
    await processor.process_new_transcripts()
    
    # Continue monitoring for new transcripts
    try:
        while True:
            await asyncio.sleep(30)  # Check every 30 seconds
            await processor.process_new_transcripts()
    except KeyboardInterrupt:
        logger.info("Transcript processor stopped by user")

if __name__ == "__main__":
    asyncio.run(main())