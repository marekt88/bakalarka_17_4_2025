# Transcript Processing Module Documentation

## Overview

The Transcript Processing Module is a key component of the AI Voice Assistant Platform, responsible for automatically storing, categorizing, analyzing, and leveraging conversation transcripts to improve AI voice agents. This module processes transcripts from different conversation types and generates optimized prompts and responses that enhance the capabilities of voice assistants.

## System Architecture

The transcript processing system consists of several components:

1. **TranscriptProcessor Class** - Core component that manages transcript processing workflows
2. **Transcript Categories** - Organized directory structure for different transcript types
3. **Prompt Generation System** - AI-powered generator for creating voice agent prompts
4. **Tracking Mechanism** - System for monitoring processed files and preventing duplicates

### Directory Structure

```
Backend/
  ├── transcript_processor.py     # Main transcript processor implementation
  ├── transcripts/               # Root directory for all transcripts
  │   ├── onboarding/           # Transcripts from initial agent creation conversations
  │   ├── alice_improvement/    # Transcripts from agent improvement conversations
  │   ├── generated_agent/      # Transcripts from interactions with created agents
  │   ├── landing/              # Transcripts from landing page interactions
  │   └── other/                # Miscellaneous transcripts
  └── generated_prompts/         # Output directory for generated prompts
      ├── current_voice_agent_prompt.md  # Latest voice agent prompt
      ├── first_message.txt              # Initial greeting message
      └── processed_files.json           # Record of processed transcript files
```

## Transcript Categorization and Processing

### Transcript Categories

The system organizes transcripts into distinct categories to facilitate appropriate processing:

1. **Onboarding Transcripts** (`onboarding/`)
   - Contain conversations between users and an onboarding assistant (Alice)
   - Focus on gathering requirements for creating new voice agents
   - Used to generate initial voice agent prompts and first messages
   - Example naming: `alice_onboarding_[timestamp]_room_[id]_transcript.md`

2. **Improvement Transcripts** (`alice_improvement/`)
   - Contain conversations focused on refining existing voice agents
   - Used to generate improved prompts based on user feedback
   - Example naming: `alice_improvement_[timestamp]_room_[id]_transcript.md`

3. **Generated Agent Transcripts** (`generated_agent/`)
   - Contain conversations between users and their created AI voice agents
   - Used for monitoring and tracking the performance of generated agents
   - Example naming: `generated_assistant_[timestamp]_room_[id]_transcript.md`

4. **Other Categories** (`landing/`, `other/`)
   - Additional categories for specialized transcript types

### Processing Workflow

The transcript processor follows these key steps:

1. **File Detection** - The system periodically scans transcript directories for new files
2. **Category Identification** - New transcripts are categorized based on their location
3. **Content Extraction** - The transcript content is read and prepared for processing
4. **AI-Powered Analysis** - Transcripts are analyzed using GPT-4o to extract insights
5. **Output Generation** - New or improved prompts and messages are created
6. **State Tracking** - Processed files are tracked to prevent duplicate processing

## AI Prompt Generation

### Voice Agent Prompt Generation

For onboarding transcripts, the system:
1. Extracts key information about the desired voice agent (personality, purpose, etc.)
2. Creates a comprehensive markdown-formatted prompt with the following sections:
   - Identity & Purpose
   - Voice & Persona (Personality, Speech Characteristics)
   - Conversation Flow (Introduction, Core Dialogue Topics, Objection Handling, Closing)
   - Response Guidelines
   - Knowledge Base (optional)
   - Ideal Customer Profile (optional)

### First Message Generation

For each new voice agent, the system generates an initial greeting message that:
- Introduces the assistant
- States its purpose clearly
- Sets the appropriate tone for the conversation
- Provides a good first impression to users

### Prompt Improvement Process

For improvement transcripts, the system:
1. Reads the current voice agent prompt and first message
2. Analyzes the improvement feedback from the transcript
3. Generates an improved prompt incorporating user feedback on:
   - Persona characteristics
   - Conversation flow
   - Response style
   - Knowledge requirements
4. Creates an improved first message aligned with the updated prompt

## Utilization in AI Assistant Improvement

The transcript processing system contributes to AI assistant improvement in several ways:

1. **Automated Evolution** - Voice agents automatically improve based on user feedback
2. **Data-Driven Refinement** - Real conversations guide the optimization process
3. **Consistent Format** - Standardized prompt structure ensures completeness and quality
4. **Quick Iteration** - Rapid incorporation of feedback into production systems

### Knowledge Generation Loop

The system operates in a continuous improvement loop:
1. Initial agent is created from onboarding transcript
2. Agent interacts with users (generating transcripts)
3. User provides feedback through improvement conversations
4. System processes feedback to generate improved agent
5. Cycle repeats, continuously enhancing the agent

## Technical Implementation

### Key Components and Features

1. **Asynchronous Processing** - Uses asyncio for efficient non-blocking operations
2. **Exception Handling** - Comprehensive error handling to ensure robustness
3. **File Tracking** - JSON-based tracking of processed files
4. **Logging System** - Detailed logging of all operations for troubleshooting
5. **AI Integration** - Seamless integration with OpenAI's GPT-4o model

### Main Functions

- `process_new_transcripts()` - Core function that orchestrates the processing workflow
- `_generate_prompt_with_gpt4o()` - Creates voice agent prompts from transcripts
- `_generate_first_message()` - Creates initial greeting messages for agents
- `_generate_improved_prompt()` - Updates prompts based on improvement feedback
- `_generate_improved_first_message()` - Updates greeting messages based on feedback

## Future Enhancements and Recommendations

### Potential Improvements

1. **Automated Quality Assessment**
   - Implement metrics to evaluate the quality of generated prompts
   - Create feedback loops for monitoring agent performance

2. **Enhanced Categorization**
   - Add more sophisticated transcript categorization based on content analysis
   - Implement automated tagging of transcripts by topic or issue

3. **Expanded Analysis Capabilities**
   - Add sentiment analysis to detect user satisfaction levels
   - Implement trend analysis across multiple transcripts

4. **Performance Optimizations**
   - Batch processing for more efficient handling of multiple transcripts
   - Caching frequently used prompts and patterns for faster generation

5. **Integration Enhancements**
   - Connect transcript insights with the RAG system for improved knowledge retrieval
   - Create bridges to analytics dashboards for insight visualization

### Efficiency Recommendations

1. **Parallelized Processing**
   - Process multiple transcripts concurrently for improved throughput
   - Implement work queuing for handling processing backlogs

2. **Intelligent Scheduling**
   - Process higher-priority categories first (e.g., improvement transcripts)
   - Schedule processing during system low-load periods

3. **Enhanced Prompt Templates**
   - Develop more specialized templates for different agent types
   - Implement version control for prompt evolution

4. **Content Filtering**
   - Add preprocessing to remove noise or irrelevant content from transcripts
   - Implement context chunking for more focused analysis

## Conclusion

The Transcript Processing Module is a sophisticated system that transforms conversation transcripts into valuable assets for improving AI voice agents. By automatically categorizing, analyzing, and leveraging these transcripts, the system enables continuous improvement of voice agents based on real user interactions and feedback. The modular design and extensible architecture allow for ongoing enhancements to meet evolving requirements.

# LiveKit Voice Integration Documentation

## Overview

This document describes the integration of LiveKit for real-time audio communication in our AI Voice Assistant platform, focusing on the `VoicePipelineAgent` class and related audio processing components including Voice Activity Detection (VAD), Speech-to-Text (STT), Text-to-Speech (TTS), and room management.

## Voice Pipeline Architecture

The system implements a sophisticated voice processing pipeline that enables real-time audio communication between users and AI assistants. At its core, the `VoicePipelineAgent` class coordinates several specialized components:

```
User Audio → VAD → STT → LLM → TTS → Audio Output
```

### Core Components

1. **VoicePipelineAgent**: The central orchestrator that manages the audio processing pipeline and event flow
2. **Voice Activity Detection (VAD)**: Detects when a user is speaking
3. **Speech-to-Text (STT)**: Converts spoken audio to text
4. **Large Language Model (LLM)**: Processes the text input and generates responses
5. **Text-to-Speech (TTS)**: Converts text responses into speech

## Real-Time Audio Processing

### Voice Activity Detection (VAD)

The system uses Silero VAD for high-quality voice activity detection, which provides several benefits:

- **Real-time speech detection**: Identifies when a user starts and stops speaking
- **Interruption handling**: Enables natural conversation flow by detecting when users want to interrupt
- **Low latency**: Processes audio frames in real-time with minimal delay
- **Configurable parameters**:
  - `min_speech_duration`: Minimum duration to consider as speech (default: 0.05s)
  - `min_silence_duration`: Silence duration to detect end of speech (default: 0.55s)
  - `prefix_padding_duration`: Buffer to include before speech (default: 0.5s)
  - `activation_threshold`: Confidence threshold for speech detection (default: 0.5)

The VAD component emits events including:
- `START_OF_SPEECH`: When a user begins speaking
- `INFERENCE_DONE`: During ongoing analysis of audio frames
- `END_OF_SPEECH`: When a user stops speaking

### Audio Stream Processing

The system handles audio streams through:

1. **Audio Frame Processing**: Audio is processed in frames, which are small chunks of audio data
2. **Buffer Management**: Speech buffers collect audio frames while VAD determines if speech is occurring
3. **Event-Driven Architecture**: Audio processing components communicate through events, allowing asynchronous processing

Example of audio frame handling in the VAD stream:

```python
async def _audio_stream_co():
    # Forward the audio stream to the VAD and STT streams
    async for ev in audio_stream:
        stt_stream.push_frame(ev.frame)
        vad_stream.push_frame(ev.frame)
```

## Speech Processing Modules

### Speech-to-Text (STT)

The STT module converts user speech to text, with these features:

- **Streaming transcription**: Provides both interim and final transcripts
- **Real-time feedback**: Shows partial results as the user speaks
- **Multiple provider support**: Works with Deepgram, OpenAI, and other STT providers

### Language Processing (LLM)

The system uses LLMs like OpenAI's models to:

- **Process user queries**: Understand and respond to user requests
- **Maintain context**: Keep track of conversation history
- **Support functions**: Execute special functions like RAG (Retrieval Augmented Generation)

### Text-to-Speech (TTS)

The TTS module provides natural-sounding voice responses:

- **Streaming synthesis**: Starts playing audio before the full response is generated
- **Voice customization**: Supports different voices and speaking styles
- **Interruption handling**: Can be interrupted by the user for a more natural conversation flow

## Room Management and Participant Connections

### Room Connection

The system manages LiveKit rooms for real-time communication:

```python
def start(self, room: rtc.Room, participant: rtc.RemoteParticipant | str | None = None):
    # Initializes the connection between users and assistants
```

- **Room connection**: Establishes audio channels between users and assistants
- **Participant tracking**: Links users to their corresponding assistant instances
- **Track management**: Manages audio tracks for each participant

### Event Handling

The system uses an event-driven architecture for communication:

- **User events**: `user_started_speaking`, `user_stopped_speaking`, `user_speech_committed`
- **Agent events**: `agent_started_speaking`, `agent_stopped_speaking`, `agent_speech_interrupted`
- **Processing events**: `function_calls_collected`, `function_calls_finished`, `metrics_collected`

## Interruption Handling

One of the key features is natural conversation flow through interruption handling:

1. **Speech interruption detection**:
   - VAD detects when a user starts speaking while the assistant is speaking
   - System evaluates if the speech meets interruption criteria (duration, word count)

2. **Graceful interruption**:
   - Assistant speech can be interrupted when configured to allow it
   - System truncates current response and prepares for the next user input

3. **Configurable parameters**:
   - `allow_interruptions`: Toggle interruption capability
   - `interrupt_speech_duration`: Minimum speech duration to trigger interruption
   - `interrupt_min_words`: Minimum word count to trigger interruption

## Frontend Integration

The frontend connects to the voice assistant using the LiveKit SDK:

```typescript
// Connection establishment
const connectionDetails = await fetch('/api/connection-details').then(r => r.json());

// LiveKit room connection
<LiveKitRoom
  token={connectionDetails?.participantToken}
  serverUrl={connectionDetails?.serverUrl}
  connect={true}
  audio={true}
  video={false}
>
  {/* Voice assistant components */}
</LiveKitRoom>
```

The frontend visualizes conversation state through agent state tracking:
- **Disconnected**: Initial state before connection
- **Connecting**: During the connection setup
- **Listening**: When the assistant is waiting for user input
- **Speaking**: When the assistant is speaking
- **Processing**: When the assistant is processing user input

## Technologies Used

The system leverages several key technologies:

1. **LiveKit SDK**: For WebRTC-based real-time communication
2. **Silero VAD**: For high-quality voice activity detection
3. **Provider-specific SDKs**:
   - Deepgram for STT
   - OpenAI for LLM
   - Various TTS providers (Cartesia, OpenAI, etc.)
4. **WebRTC**: For real-time audio streaming
5. **Noise Cancellation**: Optional noise suppression for better audio quality

## Implementation Example

A simplified implementation of a voice assistant using the pipeline:

```python
async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    # Create a voice assistant with the pipeline components
    assistant = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(),
        chat_ctx=ChatContext().append(
            role="system",
            text="You are a helpful voice assistant."
        )
    )
    
    # Start the assistant in the room
    assistant.start(ctx.room)
    
    # Initial greeting
    await assistant.say("Hello! How can I help you today?", allow_interruptions=True)
```

## Advanced Features

### Transcription and Recording

The system supports:

- **Real-time transcription**: Shows spoken text as it's being processed
- **Session recording**: Records conversations for later review
- **Transcript export**: Saves transcripts to files

### Custom Voice Assistant Extensions

The `TranscriptionAssistant` class extends the base `VoiceAssistant` to provide enhanced features:

```python
class TranscriptionAssistant(VoiceAssistant):
    """VoiceAssistant with real-time transcription logging capability."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.transcript = []
    
    def save_transcript_to_file(self):
        """Save the complete transcript to a markdown file."""
        # Implementation for saving transcripts
```

## Conclusion

The LiveKit integration provides a powerful, flexible framework for building real-time voice assistants with natural conversation flow. The modular architecture allows for customization and extension while maintaining high-quality audio processing and natural interactions.

The system's event-driven design and pipeline architecture make it well-suited for a variety of use cases, from simple voice interfaces to complex conversational agents that can understand context, maintain conversation history, and provide helpful responses with minimal latency.