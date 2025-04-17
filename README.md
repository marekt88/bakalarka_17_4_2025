# Voice Assistant Platform Integration

This project integrates a backend voice assistant system with a frontend platform, allowing users to interact with an AI voice assistant named ALICE that helps them create their own voice agents.

## Project Structure

The integration consists of two main components:

1. **Backend (Bakalarka-code-1 - Copy)**: 
   - Python-based voice assistant implementation using LiveKit and OpenAI
   - Flask API for handling assistant creation and management
   - ALICE assistant implementation for guiding users

2. **Frontend (AI-voice-agent-platform-frontend)**:
   - Next.js application with TypeScript and TailwindCSS
   - LiveKit integration for real-time audio communication
   - User interface for interacting with the voice assistant

## Setup Instructions

### Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- LiveKit account with API key and secret
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd "Bakalarka-code-1 - Copy"
   ```

2. Install the required Python packages:
   ```
   pip install flask python-dotenv livekit-agents openai
   ```

3. Copy the example environment file and fill in your credentials:
   ```
   copy .env.example .env
   ```
   Edit the `.env` file with your LiveKit and OpenAI API credentials.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd Frontend/AI-voice-agent-platform-frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Copy the example environment file and fill in your credentials:
   ```
   copy .env.example .env.local
   ```
   Edit the `.env.local` file with your LiveKit credentials.

## Running the Application

You can start both the backend and frontend servers using the provided batch script:

```
start_servers.bat
```

Or start them individually:

### Backend

```
cd Backend
python main.py start
```

### Frontend

```
cd Frontend
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Navigate to the "Answer Questions" page
3. The system will automatically connect to the ALICE voice assistant
4. Speak with ALICE to create your own voice assistant
5. Follow the on-screen instructions to proceed through the workflow

## API Endpoints

### Backend API

- `GET /api/assistant/voices` - Get available voices for the assistant
- `POST /api/assistant/create` - Create a new assistant with specified parameters
- `GET /health` - Health check endpoint

### Frontend API

- `GET /api/connection-details` - Generate LiveKit room connection details

## Components

### Backend Components

- `api.py` - Flask API implementation
- `alice_assistant.py` - ALICE assistant implementation

### Frontend Components

- `SimpleVoiceAssistant.tsx` - Voice assistant visualization component
- `VoiceControlPanel.tsx` - Controls for the voice assistant
- `NoAgentNotification.tsx` - Notification when no agent is connected

## Environment Variables

### Backend

- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (default: 8000)

### Frontend

- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `BACKEND_API_URL` - Backend API URL (default: http://localhost:8000)
