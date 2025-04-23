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
        self.generated_agent_dir = self.transcripts_dir / "generated_agent"  # Add generated_agent folder
        self.improvement_dir = self.transcripts_dir / "alice_improvement"  # Add improvement assistant folder
        self.prompts_dir = self.base_dir / "generated_prompts"
        
        # Create directories if they don't exist
        self.onboarding_dir.mkdir(exist_ok=True, parents=True)
        self.generated_agent_dir.mkdir(exist_ok=True, parents=True)  # Ensure the generated_agent directory exists
        self.improvement_dir.mkdir(exist_ok=True, parents=True)  # Ensure the improvement directory exists
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
    
    async def _generate_first_message(self, transcript_content: str) -> str:
        """Generate the first message for an AI voice assistant using GPT-4o."""
        try:
            system_prompt = "You are an AI assistant specialized in analyzing conversation transcripts and creating initial welcome messages."
            
            user_prompt = (
                "Turn Transcript into First Message Only.\n\n"
                "You are given a transcript of a conversation between a user and an AI voice agent. "
                "This conversation takes place on a platform that allows users to create their own AI voice agents by speaking with another AI agent.\n\n"
                "The goal of the AI voice agent in the transcript is to ask relevant questions and collect important contextual information "
                "that will help generate a tailored AI voice agent for the user.\n\n"
                "✅ Your Task\n"  
                "Based on the transcript, generate only the **very first message** the new AI voice assistant should say when starting a call with someone. "
                "This message should introduce the assistant, clearly state its purpose, and be written in the tone that matches the user's intent.\n\n"
                "Avoid including follow-up questions or full scripts. Just write the **initial message** as the assistant would say it to begin the conversation.\n\n"
                "🔽 Input\n"  
                "Here is the transcript of the conversation you'll base the message on:\n\n"
                f"{transcript_content}"
            )
            
            # Using the OpenAI API pattern
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                
                generated_message = response.choices[0].message.content
                logger.info("Successfully generated first message")
                return generated_message
                
            except Exception as e:
                logger.error(f"Error generating first message with OpenAI API: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return f"Error generating first message: {str(e)}"
        
        except Exception as e:
            logger.error(f"Error in first message generation process: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return f"Error generating first message: {str(e)}"
            
    async def _generate_improved_prompt(self, transcript_content: str, current_prompt: str) -> str:
        """Generate an improved AI voice agent prompt using GPT-4o based on improvement feedback."""
        try:
            system_prompt = "You are an expert AI prompt engineer specialized in refining AI voice agent prompts."
            
            user_prompt = (
                "# Refine AI Voice Agent Prompt Based on User Feedback\n\n"
                "You are an expert AI prompt engineer tasked with refining an existing AI voice agent prompt.\n\n"
                "You will be given:\n"
                "1.  transcript: A transcript of a conversation between a user and an assistant named Alice. In this conversation, the user provides feedback on an AI voice agent they have previously generated and discusses how they want to improve it. Alice's role was to gather this feedback specifically for prompt improvement.\n"
                "2.  generated_agent_prompt: The current markdown prompt of the AI voice agent that the user discussed with Alice and wants to improve.\n\n"
                "**Your Goal:**\n"
                "Analyze the user's feedback, suggestions, and desired changes expressed in the transcript. Based on this analysis, meticulously edit the provided `{generated_agent_prompt}` to incorporate these improvements. The output should be a complete, revised version of the agent's prompt.\n\n"
                "**✅ Your Task:**\n"
                "Modify the `{generated_agent_prompt}` by integrating the specific feedback points from the transcript. Focus on aspects like:\n"
                "*   Adjusting the agent's **Identity & Purpose** if the user clarified its role.\n"
                "*   Refining the **Voice & Persona** (Personality, Speech Characteristics) based on user comments about tone, friendliness, professionalism, etc.\n"
                "*   Updating the **Conversation Flow** (Introduction, Core Dialogue Topics, Closing) according to the user's feedback on structure, questions asked, or desired interaction sequence.\n"
                "*   Adding or modifying **Objection Handling**, **Response Guidelines**, **Knowledge Base**, or **Ideal Customer Profile** sections if the user provided relevant input in the transcript.\n\n"
                "**Output Requirements:**\n"
                "*   The output **must** be the *entire*, *edited* AI voice agent prompt.\n"
                "*   The output **must** strictly follow the markdown structure defined in the example below. Do not add introductory text like \"Here is the edited prompt:\". Just output the markdown prompt itself.\n"
                "*   Ensure all sections from the original generated_agent_prompt are present in the output, modified as necessary based on the transcript. If a section wasn't mentioned in the feedback, retain its original content unless changes in other sections necessitate minor adjustments for consistency.\n\n"
                "Here is the transcript: {transcript}\n\n"
                "Here is the prompt to be changed: {prompt}"
            )
            
            # Replace placeholders
            user_prompt = user_prompt.replace("{transcript}", transcript_content)
            user_prompt = user_prompt.replace("{prompt}", current_prompt)
            
            # Using the OpenAI API pattern
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
                
                improved_prompt = response.choices[0].message.content
                logger.info("Successfully generated improved voice agent prompt")
                return improved_prompt
                
            except Exception as e:
                logger.error(f"Error generating improved prompt with OpenAI API: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return f"Error generating improved prompt: {str(e)}"
        
        except Exception as e:
            logger.error(f"Error in improved prompt generation process: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return f"Error generating improved prompt: {str(e)}"
    
    async def _generate_improved_first_message(self, transcript_content: str, current_prompt: str, current_first_message: str) -> str:
        """Generate an improved first message based on user feedback."""
        try:
            system_prompt = "You are an expert AI prompt engineer specialized in refining AI voice agent first messages."
            
            user_prompt = (
                "# Refine AI Voice Agent's First Message Based on User Feedback\n\n"
                "You are an expert AI prompt engineer tasked with refining an AI voice agent's **opening message**.\n\n"
                "**Your Goal:**\n"
                "Rewrite the AI voice agent's initial spoken message based on user feedback regarding its introduction, tone, and clarity, ensuring it aligns with the agent's overall purpose derived from its full prompt context.\n\n"
                "**✅ Your Task:**\n"
                "Analyze the user's feedback contained in the **Transcript** provided below. Consider the **Current Agent Prompt** also provided below for essential context about the agent's overall identity, purpose, and intended conversation flow. Based on this combined analysis, meticulously rewrite the **Current First Message** (provided below) to incorporate the user's desired improvements identified in the transcript.\n\n"
                "**Inputs for Analysis:**\n\n"
                "1.  **Transcript (User Feedback):**\n"
                "```\n"
                "{transcript}\n"
                "```\n"
                "*(Analyze this feedback to understand the specific changes the user wants for the first message).*\n\n"
                "2.  **Current Agent Prompt (Context):**\n"
                "```markdown\n"
                "{generated_agent_prompt}\n"
                "```\n"
                "*(Use this for context on the agent's role and persona to ensure the revised first message fits).*\n\n"
                "3.  **Current First Message (To Be Edited):**\n"
                "`{first_message}`\n"
                "*(This is the specific text string you need to rewrite).*\n\n"
                "**Output Requirements:**\n"
                "*   The output **must** be *only* the revised first message text string.\n"
                "*   Do **not** include any introductory text like \"Here is the revised message:\".\n"
                "*   Do **not** include markdown formatting or any other text besides the edited first message itself.\n\n"
                "---\n"
                "**Now, perform the task based on the provided inputs.**"
            )
            
            # Replace placeholders
            user_prompt = user_prompt.replace("{transcript}", transcript_content)
            user_prompt = user_prompt.replace("{generated_agent_prompt}", current_prompt)
            user_prompt = user_prompt.replace("{first_message}", current_first_message)
            
            # Make the OpenAI API call
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                improved_message = response.choices[0].message.content
                logger.info("Successfully generated improved first message")
                return improved_message.strip()
                
            except Exception as e:
                logger.error(f"Error generating improved first message with OpenAI API: {e}")
                import traceback
                logger.error(traceback.format_exc())
                return f"Error generating improved first message: {str(e)}"
        
        except Exception as e:
            logger.error(f"Error in improved first message generation process: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return f"Error generating improved first message: {str(e)}"
            
    def _save_first_message(self, message_content: str):
        """Save the generated first message to a file, overwriting if exists."""
        try:
            # Use a standard filename
            first_message_file = self.base_dir / "generated_prompts" / "first_message.txt"
            
            with open(first_message_file, "w", encoding="utf-8") as f:
                f.write(message_content)
            
            logger.info(f"Saved generated first message to {first_message_file}")
            return first_message_file
        except Exception as e:
            logger.error(f"Error saving first message: {e}")
            return None
    
    def _read_transcript(self, file_path: Path) -> str:
        """Read the content of a transcript file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading transcript file {file_path}: {e}")
            return ""
    
    def _save_generated_prompt(self, file_name: str, prompt_content: str):
        """Save the generated prompt to a file. Deletes any existing prompt files first."""
        try:
            # Delete all existing prompt files in the directory
            for existing_file in self.prompts_dir.glob("*_prompt.md"):
                try:
                    existing_file.unlink()
                    logger.info(f"Deleted previous prompt file: {existing_file}")
                except Exception as e:
                    logger.error(f"Error deleting previous prompt file {existing_file}: {e}")
            
            # Always use a standard filename for consistency
            prompt_file = self.prompts_dir / "current_voice_agent_prompt.md"
            
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
        onboarding_files = list(self.onboarding_dir.glob("*.md"))
        
        # Get list of all transcript files in the generated_agent directory
        generated_agent_files = list(self.generated_agent_dir.glob("*.md"))
        
        # Get list of all transcript files in the improvement assistant directory
        improvement_files = list(self.improvement_dir.glob("*.md"))
        
        # Find new unprocessed files
        new_onboarding_files = [f for f in onboarding_files if str(f) not in self.processed_files]
        new_generated_files = [f for f in generated_agent_files if str(f) not in self.processed_files]
        new_improvement_files = [f for f in improvement_files if str(f) not in self.processed_files]
        
        # Log what we found
        if not new_onboarding_files and not new_generated_files and not new_improvement_files:
            logger.info("No new transcripts to process")
            return
        
        # Process onboarding transcripts - these update the prompts and first message
        if new_onboarding_files:
            logger.info(f"Found {len(new_onboarding_files)} new onboarding transcript(s) to process")
            
            for file_path in new_onboarding_files:
                try:
                    logger.info(f"Processing onboarding transcript: {file_path}")
                    
                    # Read transcript content
                    transcript_content = self._read_transcript(file_path)
                    if not transcript_content:
                        continue
                    
                    # Generate prompt with GPT-4o
                    generated_prompt = await self._generate_prompt_with_gpt4o(transcript_content)
                    
                    # Save the generated prompt
                    saved_prompt_path = self._save_generated_prompt(file_path.name, generated_prompt)
                    
                    # Generate first message
                    generated_first_message = await self._generate_first_message(transcript_content)
                    
                    # Save the generated first message
                    saved_message_path = self._save_first_message(generated_first_message)
                    
                    if saved_prompt_path:
                        # Mark as processed
                        self.processed_files.add(str(file_path))
                        self._save_processed_files()
                        logger.info(f"Successfully processed onboarding transcript {file_path.name}")
                        
                        if saved_message_path:
                            logger.info(f"Generated and saved first message for {file_path.name}")
                
                except Exception as e:
                    logger.error(f"Error processing transcript {file_path}: {e}")

        # Process improvement assistant transcripts - modify existing prompt based on feedback
        if new_improvement_files:
            logger.info(f"Found {len(new_improvement_files)} new improvement assistant transcript(s) to process")
            
            for file_path in new_improvement_files:
                try:
                    logger.info(f"Processing improvement assistant transcript: {file_path}")
                    
                    # Read transcript content
                    transcript_content = self._read_transcript(file_path)
                    if not transcript_content:
                        continue
                    
                    # Read the current voice agent prompt
                    current_prompt_path = self.prompts_dir / "current_voice_agent_prompt.md"
                    if not current_prompt_path.exists():
                        logger.error(f"Current voice agent prompt not found at {current_prompt_path}. Unable to process improvement.")
                        continue
                    
                    current_prompt = self._read_transcript(current_prompt_path)
                    if not current_prompt:
                        logger.error("Current voice agent prompt is empty. Unable to process improvement.")
                        continue
                    
                    # Generate improved prompt with GPT-4o
                    improved_prompt = await self._generate_improved_prompt(transcript_content, current_prompt)
                    
                    # Save the improved prompt
                    saved_prompt_path = self._save_generated_prompt(file_path.name, improved_prompt)
                    
                    # Also update the first message based on improvement feedback
                    # Read the current first message
                    first_message_path = self.prompts_dir / "first_message.txt"
                    if not first_message_path.exists():
                        logger.error(f"Current first message not found at {first_message_path}. Unable to update first message.")
                    else:
                        current_first_message = self._read_transcript(first_message_path)
                        if not current_first_message:
                            logger.error("Current first message is empty. Unable to update first message.")
                        else:
                            # Generate improved first message with GPT-4o
                            improved_first_message = await self._generate_improved_first_message(
                                transcript_content, improved_prompt, current_first_message
                            )
                            
                            # Save the improved first message
                            saved_message_path = self._save_first_message(improved_first_message)
                            
                            if saved_message_path:
                                logger.info(f"Generated and saved improved first message based on {file_path.name}")
                    
                    if saved_prompt_path:
                        # Mark as processed
                        self.processed_files.add(str(file_path))
                        self._save_processed_files()
                        logger.info(f"Successfully processed improvement assistant transcript {file_path.name}")
                
                except Exception as e:
                    logger.error(f"Error processing improvement transcript {file_path}: {e}")
                    import traceback
                    logger.error(traceback.format_exc())

        # Process generated agent transcripts - just mark as processed without changing prompts
        if new_generated_files:
            logger.info(f"Found {len(new_generated_files)} new generated agent transcript(s) to process")
            
            for file_path in new_generated_files:
                try:
                    logger.info(f"Processing generated agent transcript: {file_path}")
                    
                    # Just mark as processed without generating new prompts or messages
                    self.processed_files.add(str(file_path))
                    self._save_processed_files()
                    logger.info(f"Marked generated agent transcript as processed: {file_path.name}")
                    
                except Exception as e:
                    logger.error(f"Error processing generated agent transcript {file_path}: {e}")

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