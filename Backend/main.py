import asyncio
import os

from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero
from livekit.agents import transcription  # Add transcription module
from livekit.agents import stt  # Add STT module

load_dotenv()

# Create a custom Assistant class with transcription handling
class TranscriptionAssistant(VoiceAssistant):
    """VoiceAssistant with real-time transcription logging capability."""
    
    async def transcription_node(self, text, model_settings):
        """Override transcription node to log transcriptions to terminal."""
        async for delta in super().transcription_node(text, model_settings):
            # Print the transcription delta to terminal
            print(f"TRANSCRIPTION: {delta}", end="", flush=True)
            yield delta

# Function to forward transcriptions to terminal
async def _forward_transcription(stt_stream, stt_forwarder):
    """Forward transcriptions and log them to the console."""
    async for ev in stt_stream:
        stt_forwarder.update(ev)
        if ev.type == stt.SpeechEventType.INTERIM_TRANSCRIPT:
            print(f"USER TRANSCRIPT (interim): {ev.alternatives[0].text}", end="", flush=True)
        elif ev.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
            print(f"\nUSER TRANSCRIPT (final): {ev.alternatives[0].text}")

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
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello, I'm Dashboard. Welcome to VoiceForge AI! How may I help you today?", allow_interruptions=True)

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
    assistant.start(ctx.room)

    await asyncio.sleep(1)
    await assistant.say("Hello! I'm Alice, and I'll be your guide in creating your new AI voice agent here on the VoiceForge AI platform. "
    "My job is to ask you some questions to understand exactly what you need so we can build the perfect assistant for you. "
    "To kick things off, could you tell me: What will be the main purpose or primary goal of the voice agent you want to create?", allow_interruptions=True)

# Add a function to handle direct transcriptions from audio tracks
async def process_audio_tracks_with_transcription(ctx: JobContext):
    """Set up direct transcription forwarding from audio tracks."""
    stt_instance = openai.STT()
    tasks = []

    async def transcribe_track(participant, track):
        """Process a single audio track for transcription."""
        audio_stream = ctx.room.create_audio_stream(track)
        stt_forwarder = transcription.STTSegmentsForwarder(
            room=ctx.room, participant=participant, track=track
        )
        stt_stream = stt_instance.stream()
        
        # Create task to process transcriptions
        forward_task = asyncio.create_task(
            _forward_transcription(stt_stream, stt_forwarder)
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

    # Keep the function running
    try:
        await asyncio.Future()
    finally:
        # Clean up tasks when done
        for task in tasks:
            task.cancel()

async def entrypoint(ctx: JobContext):
    # Get the assistant version from the room name
    room_name = ctx.room.name if ctx.room and ctx.room.name else ""
    
    # For direct transcription without using an assistant
    if "transcribe" in room_name.lower():
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        await process_audio_tracks_with_transcription(ctx)
        return
    
    # Check for specific identifiers in the room name
    if "onboarding" in room_name.lower():
        await create_onboarding_assistant(ctx)
    elif "landing" in room_name.lower():
        await create_landingpage_assistant(ctx)
    else:
        # Default to landing page assistant if no specific identifier
        await create_landingpage_assistant(ctx)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
