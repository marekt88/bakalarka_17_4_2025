# LiveKit AI Voice Agent Call Transcript Retrieval Documentation

LiveKit provides robust support for real-time voice agent interactions with built-in transcription capabilities. This technical documentation focuses specifically on how to retrieve complete call transcripts after a LiveKit AI voice agent session has concluded. The following guide will help developers implement reliable transcript retrieval within existing LiveKit implementations.

## Overview of LiveKit Audio Handling and Transcription

LiveKit Agents provides comprehensive support for audio processing with integrated transcription capabilities. When an agent performs speech-to-text (STT) processing, the transcriptions are automatically published to the frontend in real-time[1]. The system handles both capturing user speech and generating text representations of the agent's responses.

Key transcription features include:
- Real-time transcription publishing during calls
- Synchronized text display that matches audio playback
- Support for both user and agent speech transcription
- Text stream publishing through defined topics

The transcription system operates by default when using the `AgentSession` class, utilizing the `lk.transcription` text stream topic to publish transcribed content[1]. Each transcription includes metadata such as the `lk.transcribed_track_id` attribute and sender identity information.

## Methods for Accessing Complete Call Transcripts

To retrieve the full transcript after a call has concluded, you need to understand the available methods for accessing transcription data:

### During the Call: Real-time Transcription Events

During an active session, transcriptions are made available through the `lk.transcription` text stream topic[1]. The LiveKit system generates transcription events that include:
- The speaker identity (participant information)
- The transcribed text content
- Associated metadata like track IDs

These real-time events can be captured and aggregated to build a complete transcript.

### Accessing Private Transcription Methods

The system includes internal methods like `_onTranscriptionEvent(EngineTranscriptionReceivedEvent event)` that handle both user and bot transcriptions[2]. While these methods are typically private, you can implement listeners for the corresponding public events.

### Client-Side Integration for Transcript Collection

For complete transcript collection, implement a client-side solution using Socket.IO to capture all transcription events:

```javascript
// Initialize connection to transcription service
const socket = io('your-transcription-server-url', {
    transports: ['websocket'],
    autoConnect: true
});

// Join the transcription room (matching your LiveKit room)
socket.emit('join_room', {
    room_id: 'your-room-id',
    participant_id: 'participant-id',
    language: 'en-US'
});

// Store complete transcript
let fullTranscript = [];

// Listen for and collect all transcription events
socket.on('message', (data) => {
    if (data.status === 'transcription') {
        // Add to transcript collection with timestamp
        fullTranscript.push({
            timestamp: new Date(),
            speaker: data.speaker,
            text: data.text
        });
        
        // Option: Save transcript after each update
        saveTranscript(fullTranscript);
    }
});
```

## Required Configuration for Transcript Retrieval

### Enabling Transcription Features

Transcription is enabled by default when using `AgentSession`, but you should verify your configuration:

1. Ensure transcription output is enabled (it's on by default):
   ```python
   # Transcription is enabled by default, but to explicitly enable:
   room_output_options = RoomOutputOptions(transcription_enabled=True)
   ```

2. Configure synchronized transcription forwarding for complete capture:
   - When both voice and transcription are enabled, the agent's speech is synchronized with its transcriptions[1]
   - This ensures word-by-word text display as the agent speaks

3. If using a recording component (for backup transcript verification), create a proper configuration file:
   ```yaml
   # config.yaml example
   api_key: 
   api_secret: 
   ws_url: 
   file_output:
     local: true
   ```

### Environment Setup

For a comprehensive transcription system, set up the necessary environment variables:

```
LIVEKIT_URL=wss://your-livekit-server.com
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-2
```

These configurations enable integration with message queuing and storage services essential for robust transcript handling[4].

## Storing and Processing Retrieved Transcripts

Once you've collected the complete transcript, you have several options for storage and processing:

### Local Storage Options

Store transcripts locally as JSON or text files with metadata:

```javascript
function saveTranscript(transcriptData) {
    // Convert to formatted JSON with metadata
    const transcriptObject = {
        callId: "unique-call-id",
        startTime: transcriptData[0]?.timestamp || new Date(),
        endTime: new Date(),
        participants: [...getUniqueParticipants(transcriptData)],
        exchanges: transcriptData
    };
    
    // Save to local file system or database
    fs.writeFileSync(
        `transcripts/${transcriptObject.callId}.json`, 
        JSON.stringify(transcriptObject, null, 2)
    );
}
```

### Cloud Storage Integration

For production environments, implement AWS S3 integration for durable transcript storage:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function uploadTranscriptToS3(transcriptData, callId) {
    const params = {
        Bucket: 'your-transcript-bucket',
        Key: `transcripts/${callId}.json`,
        Body: JSON.stringify(transcriptData, null, 2),
        ContentType: 'application/json'
    };
    
    try {
        const result = await s3.upload(params).promise();
        console.log(`Transcript uploaded successfully: ${result.Location}`);
        return result.Location;
    } catch (error) {
        console.error('Error uploading transcript:', error);
        throw error;
    }
}
```

### Processing Options

To enhance transcript value, consider these processing approaches:

1. Message queue integration for async processing:
   ```javascript
   const amqp = require('amqplib');
   
   async function queueTranscriptForProcessing(transcriptData) {
       const connection = await amqp.connect(process.env.RABBITMQ_URL);
       const channel = await connection.createChannel();
       const queue = 'transcript_processing';
       
       await channel.assertQueue(queue, { durable: true });
       channel.sendToQueue(
           queue, 
           Buffer.from(JSON.stringify(transcriptData)),
           { persistent: true }
       );
       
       console.log("Transcript queued for processing");
       setTimeout(() => connection.close(), 500);
   }
   ```

2. Real-time analysis during collection:
   - Sentiment analysis on each exchange
   - Key topic extraction
   - Action item identification

## Implementing a Complete Transcript Retrieval System

For a robust implementation, follow these steps:

### 1. Server-Side Transcript Collection Service

Create a dedicated service to handle audio track processing and transcript generation:

```python
class TranscriptionService:
    def __init__(self, socketio):
        self.sio = socketio
        self.transcript_repository = TranscriptRepository()
        
    async def handle_track_subscribed(self, track, publication, participant, room_id, participant_id):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            await self._handle_audio_track_safe(
                track=track,
                participant_name=participant.name,
                room_id=room_id,
                participant_id=participant_id,
                sio=self.sio
            )
    
    async def _handle_audio_track_safe(self, track, participant_name, room_id, participant_id, sio):
        # Process audio track for transcription
        # This is where LiveKit processes the audio into text
        # Events are emitted through socket.io
        
        # Also store in transcript repository for retrieval after call
        self.transcript_repository.add_entry(room_id, {
            'participant': participant_name,
            'participant_id': participant_id,
            'text': transcribed_text,
            'timestamp': datetime.now().isoformat()
        })
```

### 2. Transcript Repository Implementation

Create a repository to manage transcript storage and retrieval:

```python
class TranscriptRepository:
    def __init__(self):
        self.redis_client = redis.from_url(os.environ.get('REDIS_URL'))
        self.transcript_ttl = 60 * 60 * 24 * 7  # 7 days
    
    def add_entry(self, room_id, entry):
        # Add to in-memory collection
        transcript_key = f"transcript:{room_id}"
        self.redis_client.rpush(transcript_key, json.dumps(entry))
        self.redis_client.expire(transcript_key, self.transcript_ttl)
    
    def get_complete_transcript(self, room_id):
        # Retrieve full transcript
        transcript_key = f"transcript:{room_id}"
        entries = self.redis_client.lrange(transcript_key, 0, -1)
        return [json.loads(entry) for entry in entries]
        
    def export_transcript(self, room_id, format='json'):
        transcript = self.get_complete_transcript(room_id)
        if format == 'json':
            return json.dumps(transcript, indent=2)
        elif format == 'text':
            return '\n'.join([f"[{e['timestamp']}] {e['participant']}: {e['text']}" for e in transcript])
        # Add more format options as needed
```

### 3. API Endpoint for Transcript Retrieval

Implement a REST API to retrieve complete transcripts after calls:

```python
@app.route('/api/transcripts/', methods=['GET'])
def get_transcript(room_id):
    repo = TranscriptRepository()
    format = request.args.get('format', 'json')
    transcript = repo.export_transcript(room_id, format)
    
    if format == 'json':
        return jsonify(transcript)
    else:
        return Response(transcript, mimetype='text/plain')
```

### 4. Call Completion Handler

Implement a handler for call completion to finalize and process the transcript:

```python
async def handle_call_ended(room_id):
    # Retrieve the complete transcript
    repo = TranscriptRepository()
    transcript = repo.get_complete_transcript(room_id)
    
    # Process and store permanently
    await upload_transcript_to_s3(transcript, room_id)
    
    # Optionally trigger additional processing
    await queue_transcript_for_analysis(transcript, room_id)
    
    return {
        'status': 'success',
        'message': 'Call transcript processed successfully',
        'transcript_url': f"https://your-s3-bucket.s3.amazonaws.com/transcripts/{room_id}.json"
    }
```

## Conclusion

Retrieving complete call transcripts from LiveKit AI voice agent sessions involves:

1. Capturing real-time transcription events during the call
2. Storing these events in a durable repository
3. Providing access methods to retrieve the compiled transcript after the call ends
4. Implementing proper storage and processing mechanisms

By following the guidance in this documentation, developers can implement a robust transcript retrieval system that integrates seamlessly with existing LiveKit AI voice agent implementations. The resulting transcripts can provide valuable call records for analysis, compliance, and user experience improvement.