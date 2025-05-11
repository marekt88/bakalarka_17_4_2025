# Backend System Technical Documentation

## Overview

The backend system of the AI voice assistant platform provides a comprehensive framework for creating and managing voice-based AI assistants using LiveKit for real-time audio communication and OpenAI's language models for natural language processing. The system architecture supports multiple specialized assistant types, transcript processing, and a Retrieval-Augmented Generation (RAG) system for enhanced knowledge capabilities.

## System Architecture

### Core Components

1. **Main Application (`main.py`)**: 
   - Entry point for the system
   - Manages the lifecycle of different assistant types
   - Initializes the LiveKit agent system
   - Handles connection states and cleanup

2. **Specialized Assistant Classes**:
   - All assistants inherit from `TranscriptionAssistant` (extends `VoiceAssistant`)
   - Each assistant type is customized for specific use cases
   - Assistants support transcript recording and storage

3. **RAG System**:
   - Knowledge indexing (`knowledge_indexer.py`)
   - Vector database management (`rag_manager.py` and `custom_rag.py`)
   - Context enrichment for conversation enhancement

4. **Transcript Processing**:
   - Automatic processing of conversation transcripts
   - Generation of prompts and assistant configurations
   - Continuous monitoring for new transcripts

5. **API Layer**:
   - Flask-based API endpoints (`api.py`)
   - Supports knowledge base management
   - Provides integration with frontend

## Assistant Types

The system implements several specialized assistant types, each with a unique purpose:

### 1. Landing Page Assistant (`create_landingpage_assistant`)
- **Purpose**: Acts as initial point of contact for users visiting the platform
- **Identity**: "Ava", a friendly, knowledgeable guide
- **Key Features**:
  - Explains platform capabilities and value proposition
  - Answers questions about features, benefits, and usability
  - Optional RAG capability to reference specific knowledge
  - Uses "coral" voice from OpenAI

### 2. Onboarding Assistant (`create_onboarding_assistant`)
- **Purpose**: Guides users through the process of creating a new AI voice agent
- **Identity**: "Alice", an AI Creation Consultant
- **Key Features**:
  - Conducts structured interviews to gather agent requirements
  - Collects information on agent purpose, persona, voice characteristics
  - Systematically builds comprehensive agent profiles
  - Uses "nova" voice from OpenAI

### 3. Generated Assistant (`create_generated_assistant`)
- **Purpose**: Dynamically created assistant based on user specifications
- **Features**:
  - Uses prompts generated from onboarding conversations
  - Implements RAG for knowledge augmentation
  - Voice selection from user preferences
  - Fully customizable behavior based on generated configuration

### 4. Improvement Assistant (`create_improvement_assistant`)
- **Purpose**: Refines existing voice agents based on user feedback
- **Key Features**:
  - Reviews previous conversation transcripts
  - Gathers specific feedback for improvements
  - Updates agent configurations based on feedback
  - Uses "nova" voice from OpenAI

## The `TranscriptionAssistant` Base Class

All assistants extend the `TranscriptionAssistant` class, which provides core functionality:

```python
class TranscriptionAssistant(VoiceAssistant):
    """VoiceAssistant with real-time transcription logging capability."""
    
    def __init__(self, *args, **kwargs):
        # Initialize base class and transcript tracking
        # Set up event handlers for transcript capture
        # Handle interrupted speech
```

Key features:
- Transcript history tracking for both user and assistant
- Automatic transcript storage to markdown files
- Event handling for speech events (start, stop, interrupt)
- Support for RAG integration via callback hooks

## OpenAI LLM and Voice Integration

The system leverages OpenAI's models for:

1. **Speech-to-Text (STT)**:
   - Real-time transcription of user speech
   - Used in conjunction with Silero VAD (Voice Activity Detection)
   - Provides interim and final transcripts

2. **Language Processing (LLM)**:
   - OpenAI's language models for conversation understanding
   - Handled through the LiveKit agents framework
   - Customizable system prompts for different assistant behaviors

3. **Text-to-Speech (TTS)**:
   - OpenAI's voice synthesis capabilities
   - Support for different voices ("coral", "nova", etc.)
   - Voice selection stored in configuration

4. **Embeddings**:
   - Used for RAG system
   - Utilizes "text-embedding-3-small" model
   - 1536-dimensional embeddings for knowledge retrieval

## LiveKit Integration for Real-time Communication

The system uses LiveKit's agent framework for real-time audio communication:

1. **Room Management**:
   - Creates and manages LiveKit rooms
   - Handles participant connections/disconnections
   - Selects appropriate assistant type based on room name

2. **Audio Streaming**:
   - Bi-directional audio streaming
   - Real-time voice processing
   - Event-based audio handling

3. **Voice Pipeline**:
   - Coordinated pipeline of VAD → STT → LLM → TTS
   - Interruption handling for natural conversation
   - Event-based processing architecture

## Transcript Processing and Storage

The system features comprehensive transcript handling:

1. **Recording**:
   - Real-time capture of both user and assistant speech
   - Storage in structured format with timestamps
   - Support for handling interrupted speech

2. **Storage**:
   - Markdown files with formatted conversation history
   - Organized in directories by assistant type
   - Includes session metadata (start/end times)

3. **Processing (`TranscriptProcessor`)**:
   - Automatic monitoring for new transcript files
   - Processing for different transcript types
   - Generation of agent prompts and configurations
   - Progressive improvement based on feedback

## Retrieval-Augmented Generation (RAG)

The RAG system enhances conversations with contextual knowledge:

1. **Knowledge Indexing**:
   - Processes text and PDF documents
   - Splits into paragraphs for embedding
   - Uses custom implementation with Annoy vector database

2. **Query Processing**:
   - Real-time vector similarity search
   - Integration with conversation flow
   - Transparent addition of context to LLM prompts

3. **Context Enrichment**:
   - Enhances LLM responses with relevant knowledge
   - Maintains conversation coherence
   - Provides specialized knowledge without model retraining

## Prompt Generation and Management

The system dynamically generates and updates prompts:

1. **Initial Prompt Generation**:
   - Analyzes onboarding conversation transcripts
   - Uses GPT-4o to generate structured agent prompts
   - Creates initial greeting messages

2. **Prompt Improvement**:
   - Processes feedback from improvement assistant
   - Updates prompts based on user requirements
   - Maintains prompt structure while integrating changes

3. **Storage**:
   - Standardized storage locations
   - Version management
   - Support for prompt consistency

## Reasons for Separating Assistants into Specialized Classes

The system separates assistant functionality into specialized classes for several key reasons:

1. **Focused Functionality**: Each assistant type has a specific purpose and interaction model, allowing for optimized behavior.

2. **Prompt Management**: Different assistants require different system prompts, personas, and conversation flows.

3. **Development Isolation**: Changes to one assistant type don't affect others, enabling safer development.

4. **User Experience Flow**: The separation supports a clear user journey from landing page to onboarding to using a generated assistant.

5. **Resource Optimization**: Each assistant only loads what it needs (e.g., RAG system only when required).

6. **Testing and Maintenance**: Isolated components are easier to test, debug, and maintain.

7. **Feature Evolution**: New assistant types can be added without modifying existing code.

## API Integration

The system provides a Flask-based API for integration with frontend components:

- Knowledge base management endpoints
- Assistant control functions
- CORS support for cross-origin requests

## System Initialization and Background Processing

The system performs several initialization steps:

1. **Directory Structure Setup**:
   - Creates required directories on startup
   - Ensures consistent folder organization

2. **RAG Initialization**:
   - Loads vector database and knowledge paragraphs
   - Checks for and processes new knowledge files

3. **Background Processing**:
   - Continuous monitoring for new transcripts
   - Automatic prompt generation
   - Flask API server in separate thread

## Conclusion

The backend system provides a robust, extensible framework for creating and managing voice-based AI assistants. Its modular architecture, specialized assistant types, and integrated RAG capabilities enable a wide range of applications while maintaining performance and scalability. The system's comprehensive transcript handling and dynamic prompt generation support continuous improvement of the assistant experience.