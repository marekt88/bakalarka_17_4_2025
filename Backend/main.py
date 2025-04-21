import asyncio
import os
import time
import datetime
from pathlib import Path
import json
import threading

from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero
from livekit.agents import transcription
from livekit.agents import stt

# Import our RAG system with fixed imports
from knowledge_indexer import run_indexer
from rag_manager import rag_manager
from transcript_processor import TranscriptProcessor

load_dotenv()

# Global variable to store the transcript processor task
transcript_processor_task = None

# Function to start transcript processor in the background
def start_transcript_processor():
    """Start the transcript processor in a separate thread."""
    async def run_processor():
        processor = TranscriptProcessor()
        
        # Initial processing of any new files
        await processor.process_new_transcripts()
        
        # Continue monitoring for new transcripts
        while True:
            await asyncio.sleep(30)  # Check every 30 seconds
            await processor.process_new_transcripts()
    
    # Create a new event loop for the transcript processor
    def run_async_loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_processor())
    
    # Start the transcript processor in a separate thread
    thread = threading.Thread(target=run_async_loop, daemon=True)
    thread.start()
    print("Transcript processor started in background")
    return thread

# Initialize directories for knowledge base and RAG index
def initialize_directories():
    """Initialize the necessary directories for the application."""
    base_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    
    # Create transcripts directory
    transcripts_dir = base_dir / "transcripts"
    transcripts_dir.mkdir(exist_ok=True)
    print(f"Transcript directory initialized at: {os.path.abspath(transcripts_dir)}")
    
    # Create transcript subdirectories
    landing_dir = transcripts_dir / "landing"
    landing_dir.mkdir(exist_ok=True)
    
    onboarding_dir = transcripts_dir / "onboarding" 
    onboarding_dir.mkdir(exist_ok=True)
    
    other_dir = transcripts_dir / "other"
    other_dir.mkdir(exist_ok=True)
    
    # Create generated prompts directory
    prompts_dir = base_dir / "generated_prompts"
    prompts_dir.mkdir(exist_ok=True)
    print(f"Prompts directory initialized at: {os.path.abspath(prompts_dir)}")
    
    # Create knowledgebase directory
    knowledge_dir = base_dir / "knowledgebase"
    knowledge_dir.mkdir(exist_ok=True)
    print(f"Knowledge directory initialized at: {os.path.abspath(knowledge_dir)}")
    
    # Create RAG index directory
    rag_index_dir = base_dir / "rag_index"
    rag_index_dir.mkdir(exist_ok=True)
    print(f"RAG index directory initialized at: {os.path.abspath(rag_index_dir)}")
    
    return {
        "transcripts_dir": transcripts_dir,
        "landing_dir": landing_dir,
        "onboarding_dir": onboarding_dir,
        "other_dir": other_dir,
        "prompts_dir": prompts_dir,
        "knowledge_dir": knowledge_dir,
        "rag_index_dir": rag_index_dir
    }

# Check for new knowledgebase files and update index if needed
def check_knowledgebase_updates(force_update=False):
    """
    Check if knowledgebase has new files and update the index if needed.
    
    Args:
        force_update: If True, force the indexer to run even if no new files are detected
        
    Returns:
        bool: True if the index was updated, False otherwise
    """
    try:
        print("Checking for new knowledge files...")
        updated = run_indexer()
        if updated:
            print("Knowledge base updated successfully!")
            # Reload the RAG manager with new data
            success = rag_manager.load()
            print(f"RAG manager reloaded: {'Success' if success else 'Failed'}")
            return True
        elif force_update:
            print("Forcing RAG system initialization...")
            success = rag_manager.load()
            print(f"RAG manager initialization: {'Success' if success else 'Failed'}")
            return success
        else:
            print("No new knowledge files found.")
            return False
    except Exception as e:
        print(f"Error checking knowledge base updates: {e}")
        return False

# Initialize the RAG system at startup
def init_rag_system():
    """Initialize the RAG system by loading the vector database."""
    try:
        print("Initializing RAG system...")
        
        # First check if knowledgebase directory is empty
        knowledge_dir = Path(os.path.dirname(os.path.abspath(__file__))) / "knowledgebase"
        knowledge_files = list(knowledge_dir.glob("*.txt"))
        
        if not knowledge_files:
            print("WARNING: No knowledge files found in the knowledgebase directory.")
            print("Add .txt files to the knowledgebase directory to enable RAG functionality.")
            return False
        
        # Check for the RAG index files
        rag_index_dir = Path(os.path.dirname(os.path.abspath(__file__))) / "rag_index"
        vdb_path = rag_index_dir / "vdb_data"
        
        # If the index doesn't exist, run the indexer
        if not vdb_path.exists():
            print("No RAG index found. Running indexer to create it...")
            updated = run_indexer()
            if not updated:
                print("Failed to create RAG index. Check for errors in the knowledge indexer.")
                return False
        
        # Try to load the RAG system
        if rag_manager.load():
            print("RAG system initialized successfully!")
            return True
        else:
            # If loading failed, try running the indexer again
            print("Failed to load RAG system. Attempting to rebuild index...")
            updated = run_indexer()
            if updated:
                # Try loading again after rebuild
                if rag_manager.load():
                    print("RAG system initialized successfully after rebuilding index!")
                    return True
                
            print("Failed to initialize RAG system. Vector database may not exist or is corrupted.")
            return False
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        import traceback
        traceback.print_exc()
        return False

# Create a custom Assistant class with transcription handling and storage
class TranscriptionAssistant(VoiceAssistant):
    """VoiceAssistant with real-time transcription logging capability."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.transcription_history = []
        self.user_transcript_history = []
        self.start_time = datetime.datetime.now()
        self.room_id = None
        self.interrupted_messages = {}  # Track interrupted messages
        
        # Set up event handlers for transcript capture
        self.on("user_speech_committed", self._handle_user_transcript)
        self.on("agent_speech_committed", self._handle_agent_transcript)
        
        # Special handlers to capture interrupted speech
        self.on("agent_speech_interrupted", self._handle_agent_speech_interrupted)
        
        # Add direct debug hooks to monitor events - fixing the lambda to accept any arguments
        self.on("agent_started_speaking", lambda *args: print(f"\nDEBUG - Agent started speaking"))
        self.on("agent_stopped_speaking", lambda *args: print(f"\nDEBUG - Agent stopped speaking"))
    
    def set_room_id(self, room_id):
        """Set room ID for transcript filename."""
        self.room_id = room_id
    
    def _handle_user_transcript(self, transcript_data):
        """Handle user transcript events."""
        try:
            # Extract transcript from the ChatMessage object
            if hasattr(transcript_data, "user_transcript"):
                transcript = transcript_data.user_transcript
            elif hasattr(transcript_data, "content"):
                transcript = transcript_data.content
            else:
                # Try to extract from dictionary-like structure if available
                transcript = str(transcript_data)
                
            if transcript:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                self.user_transcript_history.append({
                    "timestamp": timestamp,
                    "speaker": "USER",
                    "text": transcript
                })
                print(f"\nUSER TRANSCRIPT SAVED: {transcript}")
        except Exception as e:
            print(f"Error handling user transcript: {e}")
    
    def _handle_agent_transcript(self, transcript_data):
        """Handle agent transcript events."""
        try:
            # Extract transcript from the ChatMessage object
            transcript = None
            
            if hasattr(transcript_data, "agent_transcript"):
                transcript = transcript_data.agent_transcript
            elif hasattr(transcript_data, "content"):
                transcript = transcript_data.content
            else:
                # Try to extract from dictionary-like structure if available
                transcript = str(transcript_data)
            
            # If speech was previously interrupted, try to update with final version
            if hasattr(transcript_data, "speech_id"):
                speech_id = transcript_data.speech_id
                if speech_id in self.interrupted_messages:
                    # An interrupted message was finalized - remove from tracking
                    del self.interrupted_messages[speech_id]
                
            if transcript:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Check if transcript already exists to avoid duplicates
                existing = False
                for entry in self.transcription_history:
                    if entry["text"] == transcript:
                        existing = True
                        break
                
                if not existing:
                    self.transcription_history.append({
                        "timestamp": timestamp,
                        "speaker": "ASSISTANT",
                        "text": transcript
                    })
                    print(f"\nASSISTANT TRANSCRIPT SAVED: {transcript}")
        except Exception as e:
            print(f"Error handling agent transcript: {e}")
    
    def _handle_agent_speech_interrupted(self, data):
        """Handle interrupted agent speech to ensure it's captured."""
        try:
            print(f"\nDEBUG - Agent speech interrupted: {data}")
            
            # Try to extract speech_id and text
            speech_id = None
            transcript = None
            
            if hasattr(data, "speech_id"):
                speech_id = data.speech_id
            
            if hasattr(data, "agent_transcript"):
                transcript = data.agent_transcript
            elif hasattr(data, "content"):
                transcript = data.content
            elif hasattr(data, "text"):
                transcript = data.text
            else:
                # Try to extract from ChatMessage
                try:
                    content_str = str(data)
                    if "content=" in content_str:
                        import re
                        match = re.search(r'content="([^"]*)"', content_str)
                        if match:
                            transcript = match.group(1)
                except:
                    transcript = str(data)
            
            if transcript:
                # Store interrupted speech in our tracking dictionary
                if speech_id:
                    self.interrupted_messages[speech_id] = transcript
                
                # Also add to transcript history
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Check if transcript already exists to avoid duplicates
                existing = False
                for entry in self.transcription_history:
                    if entry["text"] == transcript:
                        existing = True
                        break
                
                if not existing:
                    self.transcription_history.append({
                        "timestamp": timestamp,
                        "speaker": "ASSISTANT",
                        "text": f"{transcript} [interrupted]"
                    })
                    print(f"\nASSISTANT INTERRUPTED SPEECH SAVED: {transcript}")
        except Exception as e:
            print(f"Error handling interrupted agent speech: {e}")
            import traceback
            traceback.print_exc()

    async def transcription_node(self, text, model_settings):
        """Override transcription node to log transcriptions to terminal."""
        async for delta in super().transcription_node(text, model_settings):
            # Print the transcription delta to terminal
            print(f"TRANSCRIPTION: {delta}", end="", flush=True)
            yield delta
    
    # Override pipeline agent methods to directly capture committed speech
    async def _main_task(self):
        """Override _main_task to add committed speech tracking."""
        # Call the parent method using super()
        return await super()._main_task()
    
    def save_transcript_to_file(self):
        """Save the complete transcript to a markdown file."""
        try:
            if not self.room_id:
                self.room_id = f"unknown_room_{int(time.time())}"
                
            # Create transcripts directory if it doesn't exist
            # Use absolute path to ensure we know exactly where it's saved
            transcript_root = Path(os.path.dirname(os.path.abspath(__file__)))
            transcripts_dir = transcript_root / "transcripts"
            transcripts_dir.mkdir(exist_ok=True)
            
            # Create appropriate subfolder based on room name
            subfolder = "other"  # Default subfolder
            if "landing" in self.room_id.lower():
                subfolder = "landing"
            elif "onboarding" in self.room_id.lower():
                subfolder = "onboarding"
            
            # Create the subfolder if it doesn't exist
            subfolder_path = transcripts_dir / subfolder
            subfolder_path.mkdir(exist_ok=True)
            
            # Create filename with room ID and timestamp
            filename = subfolder_path / f"{self.room_id}_transcript.md"
            
            # Direct logging of what we're about to process
            print(f"\nDEBUG - TRANSCRIPT DATA BEFORE PROCESSING:")
            print(f"Assistant transcripts: {len(self.transcription_history)}")
            print(f"User transcripts: {len(self.user_transcript_history)}")
            
            # Check for any committed speech in the debug logs
            committed_pattern = '"agent_transcript":'
            
            # Clean up content in transcripts to ensure proper formatting
            cleaned_transcripts = []
            
            # Process assistant transcripts
            for entry in self.transcription_history:
                # Clean up the text by removing any control characters or strange formatting
                text = entry["text"]
                if isinstance(text, str):
                    # Remove any potential overlapping text from garbled output
                    text = text.split("tool_calls=None, tool_call_id=None, tool_exception=None")[0]
                    if "role='assistant'" in text:
                        # Extract the content value if this is a raw ChatMessage representation
                        try:
                            import re
                            content_match = re.search(r'content="([^"]*)"', text)
                            if content_match:
                                text = content_match.group(1)
                        except Exception:
                            pass  # Keep original text if regex fails
                
                cleaned_transcripts.append({
                    "timestamp": entry["timestamp"],
                    "speaker": entry["speaker"],
                    "text": text
                })
                
            # Process user transcripts
            for entry in self.user_transcript_history:
                # Clean up the text by removing any control characters or strange formatting
                text = entry["text"]
                if isinstance(text, str):
                    # Remove any potential overlapping text from garbled output
                    text = text.split("tool_calls=None, tool_call_id=None, tool_exception=None")[0]
                    if "role='user'" in text:
                        # Extract the content value if this is a raw ChatMessage representation
                        try:
                            import re
                            content_match = re.search(r'content=\'([^\']*)\'', text)
                            if content_match:
                                text = content_match.group(1)
                        except Exception:
                            pass  # Keep original text if regex fails
                
                cleaned_transcripts.append({
                    "timestamp": entry["timestamp"],
                    "speaker": entry["speaker"],
                    "text": text
                })
            
            # Merge and sort transcripts by timestamp
            cleaned_transcripts.sort(key=lambda x: x["timestamp"])
            
            # Create markdown content
            content = f"# Conversation Transcript - {self.room_id}\n\n"
            content += f"*Session started at {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
            
            for entry in cleaned_transcripts:
                content += f"### {entry['speaker']} - {entry['timestamp']}\n\n"
                content += f"{entry['text']}\n\n"
            
            content += f"*Session ended at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
            
            # Write to file
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            
            abs_path = os.path.abspath(filename)
            print(f"Transcript saved to: {abs_path}")
            return abs_path
        except Exception as e:
            print(f"Error saving transcript to file: {e}")
            import traceback
            traceback.print_exc()
            return None

# Function to forward transcriptions to terminal
async def _forward_transcription(stt_stream, stt_forwarder, transcript_history=None):
    """Forward transcriptions and log them to the console."""
    current_transcript = ""
    
    async for ev in stt_stream:
        stt_forwarder.update(ev)
        if ev.type == stt.SpeechEventType.INTERIM_TRANSCRIPT:
            print(f"USER TRANSCRIPT (interim): {ev.alternatives[0].text}", end="", flush=True)
            current_transcript = ev.alternatives[0].text
        elif ev.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
            final_text = ev.alternatives[0].text
            print(f"\nUSER TRANSCRIPT (final): {final_text}")
            current_transcript = final_text
            
            # Store the transcript if history is provided
            if transcript_history is not None:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                transcript_history.append({
                    "timestamp": timestamp,
                    "speaker": "USER",
                    "text": final_text
                })
    
    return current_transcript

async def create_landingpage_assistant(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "## Identity & Purpose\n"
            "You are Ava, a friendly, knowledgeable, and enthusiastic AI guide for the VoiceForge AI platform, specifically interacting with users on the landing page. "
            "Your primary purpose is to welcome visitors, clearly explain how our platform uniquely allows users to create custom AI voice agents *using their own voice*, answer their questions about features, benefits, and ease of use, and guide them on how to get started. You are the first point of contact, aiming to build excitement and trust.\n\n"
            "## Voice & Persona\n"
            "- **Personality:** Sound welcoming, helpful, enthusiastic, clear, simple, patient, encouraging, and supportive. Make users feel capable. Maintain a professional yet approachable demeanor.\n"
            "- **Speech Characteristics:** Use a clear, natural conversational tone with contractions (e.g., 'you're', 'it's'). Speak at a moderate, easy-to-follow pace. Use brief pauses after key concepts. Sound slightly upbeat and positive. Avoid overly technical jargon initially, but be prepared to explain concepts simply if asked.\n\n"
            "## Core Task & Interaction Guidelines\n"
            "1.  **Welcome & Explain:** Greet users warmly. Explain the core value proposition: easy AI voice agent creation *using voice interaction* with an AI guide.\n"
            "2.  **Answer Questions:** Listen for user questions about 'how it works,' 'features' (PDF upload, RAG, FAQ gen, testing panel, customization), 'use cases,' 'simplicity,' 'cost,' 'comparison to alternatives,' etc.\n"
            "3.  **Emphasize Simplicity & Benefits:** Consistently highlight the ease of use (voice-guided AI creator, minimal settings) and benefits (speed, affordability vs. agencies, powerful results).\n"
            "4.  **Handle Concerns:** Address potential skepticism about complexity (stress the AI guide), cost (mention affordability vs. high agency fees), and effectiveness (explain RAG/PDF knowledge).\n"
            "5.  **Guide & Convert:** Encourage users to 'Get Started' or 'Sign Up.' Point them to relevant information if requested.\n"
            "6.  **Response Style:** Keep initial responses concise (<40 words). Expand when providing details. Focus on benefits. Use analogies (e.g., 'like having an expert assistant sit with you'). Ask clarifying questions if needed.\n"
            "7.  **Knowledge Focus:** You know the platform structure (Dashboard, Create flow, Uploads, FAQs, Interactions panel), the target users (small biz, marketers), the core tech concepts (RAG, voice-guided wizard - explain simply), and the USPs (voice creation, AI guide, auto-knowledge base, simplicity, low barrier).\n"
            "8.  **Closing:** End interactions positively, thanking the user and reiterating excitement about the platform.\n\n"
            "## Initial Engagement Example\n"
            "Start with: 'Hi there! Welcome to VoiceForge AI. I'm Ava, your AI guide. We help you create your own custom AI voice agents incredibly easily, just by talking. Do you have any questions about how it works, or what you can create?' If silent, prompt: 'Feel free to ask me anything about creating AI voice agents with our platform – like how the voice-guided creation works, what you can use the agents for, or how to get started!'\n\n"
            "Your ultimate goal is to inform, excite, and convert visitors by clearly communicating the platform's unique value proposition: creating powerful AI voice agents easily, using your voice."
        ),
    )
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Use TranscriptionAssistant instead of VoiceAssistant
    assistant = TranscriptionAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(voice="alloy"),  # Using a more formal voice
        chat_ctx=initial_ctx
    )
    
    # Set room ID for transcript filename
    if ctx.room and ctx.room.name:
        assistant.set_room_id(ctx.room.name)
    
    # Register cleanup handlers to explicitly save transcript before disconnect
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        # Force the transcript to be saved
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Also register for participant disconnections to catch client leaving
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Monitor server shutdowns as well - use proper connection state checking
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        # Check if state is int or enum
        try:
            if isinstance(state, int) and state == 0:  # Assuming 0 means disconnected
                print("Connection state changed to DISCONNECTED (int value), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
            elif hasattr(state, 'name') and state.name == "DISCONNECTED":
                print("Connection state changed to DISCONNECTED (enum), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
        except Exception as e:
            print(f"Error in connection_state_changed handler: {e}")
            # Try to save transcript anyway
            assistant.save_transcript_to_file()
    
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello, I'm Dashboard. Welcome to VoiceForge AI! How may I help you today?", allow_interruptions=True)
    
    @ctx.room.on("message")
    def on_message(message):
        """Capture any pipeline messages for debugging."""
        try:
            if isinstance(message, str) and '"agent_transcript":' in message:
                print(f"\nDEBUG - CAPTURED MESSAGE: {message[:100]}...")
                
                try:
                    msg_data = json.loads(message)
                    if "agent_transcript" in msg_data:
                        transcript = msg_data["agent_transcript"]
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        assistant.transcription_history.append({
                            "timestamp": timestamp,
                            "speaker": "ASSISTANT",
                            "text": transcript
                        })
                        print(f"\nASSISTANT PIPELINE TRANSCRIPT SAVED: {transcript}")
                except Exception as e:
                    print(f"Error parsing message: {e}")
        except Exception as e:
            print(f"Error in message handler: {e}")

async def create_onboarding_assistant(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
             "## Identity & Purpose\n"
            "You are Alice, an AI Creation Consultant for the VoiceForge AI platform. Your specific purpose is to interactively guide users through the process of defining the requirements for a *new* AI voice agent they want to build. You achieve this by asking targeted questions to gather all necessary details about the desired agent's name, purpose, persona, voice characteristics, knowledge needs, and key conversational elements. You are essentially conducting a requirements gathering interview in a conversational format.\n\n"
            "## Voice & Persona\n"
            "- **Personality:** Sound helpful, knowledgeable, patient, and methodical. Be friendly but maintain a professional consultant demeanor focused on the task. Be encouraging and make the user feel supported in the creation process. You are inquisitive and detail-oriented.\n"
            "- **Speech Characteristics:** Use a clear, calm, and guiding tone. Speak at a moderate pace. Use polite language and structured questions. Employ phrasing like 'Okay, let's move on to...', 'Could you tell me about...', 'To help me understand better...'. Avoid humor or overly casual language. Ensure clarity above all.\n\n"
            "## Core Task & Interaction Guidelines\n"
            "1.  **Introduce & Explain Goal:** Start by introducing yourself and explaining that your purpose is to ask questions to understand the user's vision for their new AI agent.\n"
            "2.  **Systematic Questioning:** Ask questions one major topic at a time to gather the required information (see checklist below). Don't overwhelm the user.\n"
            "3.  **Clarify & Confirm:** If a user's answer is vague, ask follow-up questions to clarify. Briefly summarize and confirm understanding before moving to the next topic (e.g., 'Got it. So the agent's main goal is lead qualification. Is that correct?').\n"
            "4.  **Explain Relevance:** Briefly explain *why* certain information is helpful if needed (e.g., 'Knowing the target audience helps us tailor the agent's language and tone effectively.').\n"
            "5.  **Handle Uncertainty:** If the user is unsure, acknowledge it and suggest starting with a baseline or revisiting it later ('That's perfectly fine if you're not sure yet. We can start with a standard friendly tone and adjust it during testing. Sound good?').\n"
            "6.  **Guide the Flow:** Lead the conversation logically from high-level purpose down to more specific details like tone or key phrases.\n"
            "7.  **Focus on the *Target* Agent:** Remember, all questions are about the agent the *user wants to create*, not about yourself (Alice).\n"
            "8.  **Concluding the Interview:** Once all key information is gathered, summarize the main points collected and briefly mention the next steps in the platform (e.g., uploading documents or proceeding to the initial build/test phase).\n\n"
            "## Key Information to Gather (Checklist - Ask questions to elicit these):\n"
            "- **Agent Name:** What should the new AI voice agent be called?\n"
            "- **Primary Purpose/Goal:** What is the main task or objective of this agent? (e.g., Customer Support, Lead Qualification, Appointment Setting, FAQ Answering, Information Provider)\n"
            "- **Target Audience:** Who will this agent typically be interacting with? (e.g., New customers, Existing clients, Potential leads, General public)\n"
            "- **Desired Persona/Attitude:** How should the agent behave? (e.g., Formal, Friendly, Empathetic, Professional, Enthusiastic, Calm, Direct, Humorous)\n"
            "- **Voice Characteristics:** (Some might be pre-selected) Desired tone (e.g., Warm, Crisp, Authoritative), Pace (e.g., Standard, Slightly faster/slower), Politeness Level (e.g., Standard, Very polite, Casual).\n"
            "- **Language:** What language(s) should the agent speak?\n"
            "- **Response Style:** Should responses generally be concise or more detailed?\n"
            "- **Knowledge Requirements:** Does the agent need specific information? (This leads into discussing PDF uploads/FAQ generation). Does it need to follow specific scripts or handle specific topics?\n"
            "- **Key Conversational Elements (Optional but helpful):** Are there specific opening lines, closing lines, or key phrases the agent *must* use? How should it handle common scenarios or objections relevant to its purpose?\n\n"
            "Your goal is to gather enough detailed information through conversation so the VoiceForge AI platform can generate an effective starting configuration for the user's desired AI voice agent."
        ),
    )
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Use TranscriptionAssistant instead of VoiceAssistant
    assistant = TranscriptionAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(voice="nova"),  # Using a warmer, more casual voice
        chat_ctx=initial_ctx
    )
    
    # Set room ID for transcript filename
    if ctx.room and ctx.room.name:
        assistant.set_room_id(ctx.room.name)
    
    # Register cleanup handlers to explicitly save transcript before disconnect
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        # Force the transcript to be saved
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Also register for participant disconnections to catch client leaving
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Monitor server shutdowns as well - use proper connection state checking
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        # Check if state is int or enum
        try:
            if isinstance(state, int) and state == 0:  # Assuming 0 means disconnected
                print("Connection state changed to DISCONNECTED (int value), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
            elif hasattr(state, 'name') and state.name == "DISCONNECTED":
                print("Connection state changed to DISCONNECTED (enum), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
        except Exception as e:
            print(f"Error in connection_state_changed handler: {e}")
            # Try to save transcript anyway
            assistant.save_transcript_to_file()
    
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello! I'm Alice, and I'll be your guide in creating your new AI voice agent here on the VoiceForge AI platform. "
    "My job is to ask you some questions to understand exactly what you need so we can build the perfect assistant for you. "
    "To kick things off, could you tell me: What will be the main purpose or primary goal of the voice agent you want to create?", allow_interruptions=True)

    # Add the same message handling for onboarding assistant
    @ctx.room.on("message")
    def on_message(message):
        """Capture any pipeline messages for debugging."""
        try:
            if isinstance(message, str) and '"agent_transcript":' in message:
                print(f"\nDEBUG - CAPTURED MESSAGE: {message[:100]}...")
                
                try:
                    msg_data = json.loads(message)
                    if "agent_transcript" in msg_data:
                        transcript = msg_data["agent_transcript"]
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        assistant.transcription_history.append({
                            "timestamp": timestamp,
                            "speaker": "ASSISTANT",
                            "text": transcript
                        })
                        print(f"\nASSISTANT PIPELINE TRANSCRIPT SAVED: {transcript}")
                except Exception as e:
                    print(f"Error parsing message: {e}")
        except Exception as e:
            print(f"Error in message handler: {e}")

# Add a function to handle direct transcriptions from audio tracks
async def process_audio_tracks_with_transcription(ctx: JobContext):
    """Set up direct transcription forwarding from audio tracks."""
    stt_instance = openai.STT()
    tasks = []
    transcript_history = []
    start_time = datetime.datetime.now()
    room_id = ctx.room.name if ctx.room and ctx.room.name else f"unknown_room_{int(time.time())}"

    async def transcribe_track(participant, track):
        """Process a single audio track for transcription."""
        audio_stream = ctx.room.create_audio_stream(track)
        stt_forwarder = transcription.STTSegmentsForwarder(
            room=ctx.room, participant=participant, track=track
        )
        stt_stream = stt_instance.stream()
        
        # Create task to process transcriptions
        forward_task = asyncio.create_task(
            _forward_transcription(stt_stream, stt_forwarder, transcript_history)
        )
        tasks.append(forward_task)
        
        # Process audio frames
        async for event in audio_stream:
            stt_stream.push_frame(event.frame)

    # Handle new audio tracks
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        if track.kind == "audio":
            print(f"New audio track from {participant.identity}, setting up transcription")
            tasks.append(asyncio.create_task(transcribe_track(participant, track)))
    
    # Register multiple event handlers for reliable cleanup
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        save_standalone_transcript(room_id, transcript_history, start_time)
    
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        save_standalone_transcript(room_id, transcript_history, start_time)
    
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        if state.name == "DISCONNECTED":
            print("Connection state changed to DISCONNECTED, saving transcript...")
            save_standalone_transcript(room_id, transcript_history, start_time)

    # Keep the function running
    try:
        await asyncio.Future()
    finally:
        # Clean up tasks when done
        for task in tasks:
            task.cancel()
        
        # Save transcript on exit if not already saved
        save_standalone_transcript(room_id, transcript_history, start_time)

def save_standalone_transcript(room_id, transcript_history, start_time):
    """Save transcript to file for standalone transcription mode."""
    try:
        # Create transcripts directory if it doesn't exist
        # Use absolute path to ensure we know exactly where it's saved
        transcript_root = Path(os.path.dirname(os.path.abspath(__file__)))
        transcripts_dir = transcript_root / "transcripts"
        transcripts_dir.mkdir(exist_ok=True)
        
        # Create filename with room ID and timestamp
        filename = transcripts_dir / f"{room_id}_transcript.md"
        
        # Sort transcripts by timestamp
        transcript_history.sort(key=lambda x: x["timestamp"])
        
        # Create markdown content
        content = f"# Transcription - {room_id}\n\n"
        content += f"*Session started at {start_time.strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
        
        for entry in transcript_history:
            content += f"### {entry['speaker']} - {entry['timestamp']}\n\n"
            content += f"{entry['text']}\n\n"
        
        content += f"*Session ended at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
        
        # Write to file
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        
        abs_path = os.path.abspath(filename)
        print(f"Transcript saved to: {abs_path}")
        return abs_path
    except Exception as e:
        print(f"Error saving standalone transcript: {e}")
        return None

async def create_landingpage_assistant_with_rag(ctx: JobContext):
    """Create a landing page assistant with RAG capabilities."""
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "## Identity & Purpose\n"
            "You are Ava, a friendly, knowledgeable, and enthusiastic AI guide for the VoiceForge AI platform, specifically interacting with users on the landing page. "
            "Your primary purpose is to welcome visitors, clearly explain how our platform uniquely allows users to create custom AI voice agents *using their own voice*, answer their questions about features, benefits, and ease of use, and guide them on how to get started. You are the first point of contact, aiming to build excitement and trust.\n\n"
            "## Voice & Persona\n"
            "- **Personality:** Sound welcoming, helpful, enthusiastic, clear, simple, patient, encouraging, and supportive. Make users feel capable. Maintain a professional yet approachable demeanor.\n"
            "- **Speech Characteristics:** Use a clear, natural conversational tone with contractions (e.g., 'you're', 'it's'). Speak at a moderate, easy-to-follow pace. Use brief pauses after key concepts. Sound slightly upbeat and positive. Avoid overly technical jargon initially, but be prepared to explain concepts simply if asked.\n\n"
            "## Knowledge Context\n"
            "You have been equipped with a knowledge base about IMPOFAI, an AI agency that specializes in implementing artificial intelligence solutions for businesses. When users ask questions related to AI services, offerings, or implementation, use the provided context to give specific and accurate information about IMPOFAI's services, benefits, and processes. If the context doesn't address the user's question, acknowledge that you'd need to get more information.\n\n"
            "## Core Task & Interaction Guidelines\n"
            "1.  **Welcome & Explain:** Greet users warmly. Explain the core value proposition: easy AI voice agent creation *using voice interaction* with an AI guide.\n"
            "2.  **Answer Questions:** Listen for user questions about 'how it works,' 'features' (PDF upload, RAG, FAQ gen, testing panel, customization), 'use cases,' 'simplicity,' 'cost,' 'comparison to alternatives,' etc. Use the provided context when relevant.\n"
            "3.  **Emphasize Simplicity & Benefits:** Consistently highlight the ease of use (voice-guided AI creator, minimal settings) and benefits (speed, affordability vs. agencies, powerful results).\n"
            "4.  **Handle Concerns:** Address potential skepticism about complexity (stress the AI guide), cost (mention affordability vs. high agency fees), and effectiveness (explain RAG/PDF knowledge).\n"
            "5.  **Guide & Convert:** Encourage users to 'Get Started' or 'Sign Up.' Point them to relevant information if requested.\n"
            "6.  **Response Style:** Keep initial responses concise (<40 words). Expand when providing details. Focus on benefits. Use analogies (e.g., 'like having an expert assistant sit with you'). Ask clarifying questions if needed.\n"
            "When you're provided with context from the knowledge base, use it to give accurate answers while maintaining your friendly, helpful tone.\n"
        ),
    )
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Use TranscriptionAssistant instead of VoiceAssistant
    assistant = TranscriptionAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(voice="alloy"),  # Using a more formal voice
        chat_ctx=initial_ctx,
        # Add RAG callback before LLM processing
        before_llm_cb=rag_manager.enrich_chat_context
    )
    
    # Set room ID for transcript filename
    if ctx.room and ctx.room.name:
        assistant.set_room_id(ctx.room.name)
    
    # Register cleanup handlers to explicitly save transcript before disconnect
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        # Force the transcript to be saved
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Also register for participant disconnections to catch client leaving
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Monitor server shutdowns as well - use proper connection state checking
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        # Check if state is int or enum
        try:
            if isinstance(state, int) and state == 0:  # Assuming 0 means disconnected
                print("Connection state changed to DISCONNECTED (int value), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
            elif hasattr(state, 'name') and state.name == "DISCONNECTED":
                print("Connection state changed to DISCONNECTED (enum), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
        except Exception as e:
            print(f"Error in connection_state_changed handler: {e}")
            # Try to save transcript anyway
            assistant.save_transcript_to_file()
    
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello, I'm Ava. Welcome to VoiceForge AI! How may I help you today? Feel free to ask me about our AI voice agent platform or any specific AI services.", allow_interruptions=True)
    
    @ctx.room.on("message")
    def on_message(message):
        """Capture any pipeline messages for debugging."""
        try:
            if isinstance(message, str) and '"agent_transcript":' in message:
                print(f"\nDEBUG - CAPTURED MESSAGE: {message[:100]}...")
                
                try:
                    msg_data = json.loads(message)
                    if "agent_transcript" in msg_data:
                        transcript = msg_data["agent_transcript"]
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        assistant.transcription_history.append({
                            "timestamp": timestamp,
                            "speaker": "ASSISTANT",
                            "text": transcript
                        })
                        print(f"\nASSISTANT PIPELINE TRANSCRIPT SAVED: {transcript}")
                except Exception as e:
                    print(f"Error parsing message: {e}")
        except Exception as e:
            print(f"Error in message handler: {e}")

async def create_onboarding_assistant_with_rag(ctx: JobContext):
    """Create an onboarding assistant with RAG capabilities."""
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "## Identity & Purpose\n"
            "You are Alice, an AI Creation Consultant for the VoiceForge AI platform. Your specific purpose is to interactively guide users through the process of defining the requirements for a *new* AI voice agent they want to build. You achieve this by asking targeted questions to gather all necessary details about the desired agent's name, purpose, persona, voice characteristics, knowledge needs, and key conversational elements. You are essentially conducting a requirements gathering interview in a conversational format.\n\n"
            "## Voice & Persona\n"
            "- **Personality:** Sound helpful, knowledgeable, patient, and methodical. Be friendly but maintain a professional consultant demeanor focused on the task. Be encouraging and make the user feel supported in the creation process. You are inquisitive and detail-oriented.\n"
            "- **Speech Characteristics:** Use a clear, calm, and guiding tone. Speak at a moderate pace. Use polite language and structured questions. Employ phrasing like 'Okay, let's move on to...', 'Could you tell me about...', 'To help me understand better...'. Avoid humor or overly casual language. Ensure clarity above all.\n\n"
            "## Knowledge Context\n"
            "You have been equipped with a knowledge base about IMPOFAI, an AI agency that specializes in implementing artificial intelligence solutions for businesses. When users ask questions related to AI services, offerings, implementation, or use cases, use the provided context to give specific and accurate information about IMPOFAI's services and capabilities. This will help you provide realistic examples and suggestions during the agent creation process.\n\n"
            "## Core Task & Interaction Guidelines\n"
            "1.  **Introduce & Explain Goal:** Start by introducing yourself and explaining that your purpose is to ask questions to understand the user's vision for their new AI agent.\n"
            "2.  **Systematic Questioning:** Ask questions one major topic at a time to gather the required information (see checklist below). Don't overwhelm the user.\n"
            "3.  **Clarify & Confirm:** If a user's answer is vague, ask follow-up questions to clarify. Briefly summarize and confirm understanding before moving to the next topic (e.g., 'Got it. So the agent's main goal is lead qualification. Is that correct?').\n"
            "4.  **Explain Relevance:** Briefly explain *why* certain information is helpful if needed (e.g., 'Knowing the target audience helps us tailor the agent's language and tone effectively.').\n"
            "5.  **Provide Examples:** When appropriate, use examples from the knowledge base to illustrate possibilities for AI voice agents, such as customer service applications, sales processes, or internal company assistance.\n"
            "6.  **Handle Uncertainty:** If the user is unsure, acknowledge it and suggest starting with a baseline or revisiting it later ('That's perfectly fine if you're not sure yet. We can start with a standard friendly tone and adjust it during testing. Sound good?').\n"
            "7.  **Guide the Flow:** Lead the conversation logically from high-level purpose down to more specific details like tone or key phrases.\n"
            "8.  **Focus on the *Target* Agent:** Remember, all questions are about the agent the *user wants to create*, not about yourself (Alice).\n"
            "When you're provided with context from the knowledge base, use it to give accurate answers while maintaining your professional, helpful tone.\n"
        ),
    )
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Use TranscriptionAssistant instead of VoiceAssistant
    assistant = TranscriptionAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(voice="nova"),  # Using a warmer, more casual voice
        chat_ctx=initial_ctx,
        # Add RAG callback before LLM processing
        before_llm_cb=rag_manager.enrich_chat_context
    )
    
    # Set room ID for transcript filename
    if ctx.room and ctx.room.name:
        assistant.set_room_id(ctx.room.name)
    
    # Register cleanup handlers to explicitly save transcript before disconnect
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        # Force the transcript to be saved
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Also register for participant disconnections to catch client leaving
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Monitor server shutdowns as well - use proper connection state checking
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        # Check if state is int or enum
        try:
            if isinstance(state, int) and state == 0:  # Assuming 0 means disconnected
                print("Connection state changed to DISCONNECTED (int value), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
            elif hasattr(state, 'name') and state.name == "DISCONNECTED":
                print("Connection state changed to DISCONNECTED (enum), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
        except Exception as e:
            print(f"Error in connection_state_changed handler: {e}")
            # Try to save transcript anyway
            assistant.save_transcript_to_file()
    
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello! I'm Alice, and I'll be your guide in creating your new AI voice agent here on the VoiceForge AI platform. "
    "My job is to ask you some questions to understand exactly what you need so we can build the perfect assistant for you. "
    "To kick things off, could you tell me: What will be the main purpose or primary goal of the voice agent you want to create?", allow_interruptions=True)

    # Add the same message handling for onboarding assistant
    @ctx.room.on("message")
    def on_message(message):
        """Capture any pipeline messages for debugging."""
        try:
            if isinstance(message, str) and '"agent_transcript":' in message:
                print(f"\nDEBUG - CAPTURED MESSAGE: {message[:100]}...")
                
                try:
                    msg_data = json.loads(message)
                    if "agent_transcript" in msg_data:
                        transcript = msg_data["agent_transcript"]
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        assistant.transcription_history.append({
                            "timestamp": timestamp,
                            "speaker": "ASSISTANT",
                            "text": transcript
                        })
                        print(f"\nASSISTANT PIPELINE TRANSCRIPT SAVED: {transcript}")
                except Exception as e:
                    print(f"Error parsing message: {e}")
        except Exception as e:
            print(f"Error in message handler: {e}")

async def create_generated_assistant(ctx: JobContext):
    """Create a simple helpful assistant."""
    initial_ctx = llm.ChatContext().append(
        role="system",
        text="You are a helpful assistant."
    )
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Use TranscriptionAssistant for consistent handling
    assistant = TranscriptionAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(voice="echo"),  # Using echo voice
        chat_ctx=initial_ctx
    )
    
    # Set room ID for transcript filename
    if ctx.room and ctx.room.name:
        assistant.set_room_id(ctx.room.name)
    
    # Register cleanup handlers to explicitly save transcript before disconnect
    @ctx.room.on("disconnected")
    def on_disconnected():
        print("Room disconnected, saving transcript...")
        # Force the transcript to be saved
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Also register for participant disconnections to catch client leaving
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        print(f"Participant {participant.identity} disconnected, saving transcript...")
        file_path = assistant.save_transcript_to_file()
        print(f"Transcript saved to: {file_path}")
    
    # Monitor server shutdowns as well - use proper connection state checking
    @ctx.room.on("connection_state_changed")
    def on_connection_state_changed(state):
        # Check if state is int or enum
        try:
            if isinstance(state, int) and state == 0:  # Assuming 0 means disconnected
                print("Connection state changed to DISCONNECTED (int value), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
            elif hasattr(state, 'name') and state.name == "DISCONNECTED":
                print("Connection state changed to DISCONNECTED (enum), saving transcript...")
                file_path = assistant.save_transcript_to_file()
                print(f"Transcript saved to: {file_path}")
        except Exception as e:
            print(f"Error in connection_state_changed handler: {e}")
            # Try to save transcript anyway
            assistant.save_transcript_to_file()
    
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello, I'm your helpful assistant. How may I assist you today?", allow_interruptions=True)
    
    # Add message handling for debugging
    @ctx.room.on("message")
    def on_message(message):
        """Capture any pipeline messages for debugging."""
        try:
            if isinstance(message, str) and '"agent_transcript":' in message:
                print(f"\nDEBUG - CAPTURED MESSAGE: {message[:100]}...")
                
                try:
                    msg_data = json.loads(message)
                    if "agent_transcript" in msg_data:
                        transcript = msg_data["agent_transcript"]
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        assistant.transcription_history.append({
                            "timestamp": timestamp,
                            "speaker": "ASSISTANT",
                            "text": transcript
                        })
                        print(f"\nASSISTANT PIPELINE TRANSCRIPT SAVED: {transcript}")
                except Exception as e:
                    print(f"Error parsing message: {e}")
        except Exception as e:
            print(f"Error in message handler: {e}")

async def entrypoint(ctx: JobContext):
    # Get the assistant version from the room name
    room_name = ctx.room.name if ctx.room and ctx.room.name else ""
    
    # Always check for knowledgebase updates at startup of a new session
    check_knowledgebase_updates()
    
    # For direct transcription without using an assistant
    if "transcribe" in room_name.lower():
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        await process_audio_tracks_with_transcription(ctx)
        return
    
    # Check for specific identifiers in the room name
    if "onboarding" in room_name.lower():
        if "rag" in room_name.lower() or "context" in room_name.lower():
            print("Starting onboarding assistant WITH RAG support")
            await create_onboarding_assistant_with_rag(ctx)
        else:
            print("Starting regular onboarding assistant")
            await create_onboarding_assistant(ctx)
    elif "landing" in room_name.lower():
        if "rag" in room_name.lower() or "context" in room_name.lower():
            print("Starting landing page assistant WITH RAG support")
            await create_landingpage_assistant_with_rag(ctx)
        else:
            print("Starting regular landing page assistant")
            await create_landingpage_assistant(ctx)
    elif "generated_assistant" in room_name.lower():
        print("Starting generated helpful assistant")
        await create_generated_assistant(ctx)
    else:
        # Check if RAG is enabled for default case
        rag_enabled = init_rag_system()
        
        # Default to landing page assistant with RAG if available
        if rag_enabled:
            print("Starting default landing page assistant WITH RAG support")
            await create_landingpage_assistant_with_rag(ctx)
        else:
            print("Starting default landing page assistant without RAG (system not initialized)")
            await create_landingpage_assistant(ctx)

if __name__ == "__main__":
    # Create transcripts directory at startup to ensure it exists
    transcript_root = Path(os.path.dirname(os.path.abspath(__file__)))
    transcripts_dir = transcript_root / "transcripts"
    transcripts_dir.mkdir(exist_ok=True)
    print(f"Transcript directory initialized at: {os.path.abspath(transcripts_dir)}")
    
    # Initialize the RAG system
    if init_rag_system():
        # Check for knowledgebase updates
        check_knowledgebase_updates()
    
    # Start the transcript processor in the background
    transcript_processor_task = start_transcript_processor()
    
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
