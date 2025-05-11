Text and transcriptions
Integrate realtime text features into your agent.

Overview
LiveKit Agents supports text inputs and outputs in addition to audio, based on the text streams feature of the LiveKit SDKs. This guide explains what's possible and how to use it in your app.

Transcriptions
When an agent performs STT as part of its processing pipeline, the transcriptions are also published to the frontend in realtime. Additionally, a text representation of the agent speech is also published in sync with audio playback when the agent speaks. These features are both enabled by default when using AgentSession.

Transcriptions use the lk.transcription text stream topic. They include a lk.transcribed_track_id attribute and the sender identity is the transcribed participant.

To disable transcription output, set transcription_enabled=False in RoomOutputOptions.

Synchronized transcription forwarding
When both voice and transcription are enabled, the agent's speech is synchronized with its transcriptions, displaying text word by word as it speaks. If the agent is interrupted, the transcription stops and is truncated to match the spoken output.

Text input
Your agent also monitors the lk.chat text stream topic for incoming text messages from its linked participant. The agent interrupts its current speech, if any, to process the message and generate a new response.

To disable text input, set text_enabled=False in RoomInputOptions.

Text-only output
To disable audio output entirely and send text only, set audio_enabled=False in RoomOutputOptions. The agent will publish text responses to the lk.transcription text stream topic, without a lk.transcribed_track_id attribute and without speech synchronization.

Usage examples
This section contains small code samples demonstrating how to use the text features.

For more information, see the text streams documentation. For more complete examples, see the recipes collection.

Frontend integration
Use the registerTextStreamHandler method to receive incoming transcriptions or text:

JavaScriptSwift
room.registerTextStreamHandler('lk.transcription', async (reader, participantInfo) => {
  const message = await reader.readAll();
  if (reader.info.attributes['lk.transcribed_track_id']) {
    console.log(`New transcription from ${participantInfo.identity}: ${message}`);
  } else {
    console.log(`New message from ${participantInfo.identity}: ${message}`);
  }
});
Copy
Use the sendText method to send text messages:

JavaScriptSwift
const text = 'Hello how are you today?';
const info = await room.localParticipant.sendText(text, {
  topic: 'lk.chat',
});
Copy
Configuring input/output options
The AgentSession constructor accepts configuration for input and output options:

session = AgentSession(
    ..., # STT, LLM, etc.
    room_input_options=RoomInputOptions(
        text_enabled=False # disable text input
    ), 
    room_output_options=RoomOutputOptions(
        audio_enabled=False # disable audio output
    )
)
Copy
Manual text input
To insert text input and generate a response, use the generate_reply method of AgentSession: session.generate_reply(user_input="...").

Custom topics
You may override the text_input_topic of RoomInputOptions and transcription_output_topic of RoomOutputOptions to set a custom text stream topic for text input or output, if desired. The default values are lk.chat and lk.transcription respectively.

Transcription events
Frontend SDKs can also receive transcription events via RoomEvent.TranscriptionReceived.

Deprecated feature
Transcription events will be removed in a future version. Use text streams on the lk.chat topic instead.

AndroidFlutterJavaScriptSwift
room.events.collect { event ->
  if (event is RoomEvent.TranscriptionReceived) {
    event.transcriptionSegments.forEach { segment ->
      println("New transcription from ${segment.senderIdentity}: ${segment.text}")
    }
  }
}
Copy


Session recording and transcripts
Export session data in video, audio, or text format.

Overview
There are many reasons to record or persist the sessions that occur in your app, from quality monitoring to regulatory compliance. LiveKit allows you to record the video and audio from agent sessions or save the text transcripts.

Video or audio recording
Use the Egress feature to record audio and/or video. The simplest way to do this is to start a room composite recorder in your agent's entrypoint. This starts recording when the agent enters the room and automatically captures all audio and video shared in the room. Recording ends when all participants leave. Recordings are stored in the cloud storage provider of your choice.

Example
This example shows how to modify the Voice AI quickstart to record sessions. It uses Google Cloud Storage, but you can also save files to any Amazon S3-compatible storage provider or Azure Blob Storage.

For additional egress examples using Amazon S3 and Azure, see the Egress examples. To learn more about credentials.json, see Cloud storage configurations.

To modify the Voice AI quickstart to record sessions, add the following code:

main.py
from livekit import api

async def entrypoint(ctx: JobContext):
    # Add the following code to the top, before calling ctx.connect()

    # Load GCP credentials from credentials.json file.
    file_contents = ""
    with open("/path/to/credentials.json", "r") as f:
        file_contents = f.read()

    # Set up recording
    req = api.RoomCompositeEgressRequest(
        room_name="my-room",
        layout="speaker",
        audio_only=True,
        segment_outputs=[api.SegmentedFileOutput(
            filename_prefix="my-output",
            playlist_name="my-playlist.m3u8",
            live_playlist_name="my-live-playlist.m3u8",
            segment_duration=5,
            gcp=api.GCPUpload(
                credentials=file_contents,
                bucket="<your-gcp-bucket>",
            ),
        )],
    )

    res = await ctx.api.egress.start_room_composite_egress(req)

    # .. The rest of your entrypoint code follows ...
Copy
Text transcripts
Text transcripts are available in realtime via the llm_node or the transcription_node as detailed in the docs on Pipeline nodes. You can use this along with other events and callbacks to record your session and any other data you need.

Additionally, you can access the session.history property at any time to get the full conversation history so far. Using the add_shutdown_callback method, you can save the conversation history to a file after the user leaves and the room closes.

Example
This example shows how to modify the Voice AI quickstart to save the conversation history to a JSON file.

main.py
from datetime import datetime
import json

def entrypoint(ctx: JobContext):
    # Add the following code to the top, before calling ctx.connect()
    
    async def write_transcript():
        current_date = datetime.now().strftime("%Y%m%d_%H%M%S")

        # This example writes to the temporary directory, but you can save to any location
        filename = f"/tmp/transcript_{ctx.room.name}_{current_date}.json"
        
        with open(filename, 'w') as f:
            json.dump(session.history.to_dict(), f, indent=2)
            
        print(f"Transcript for {ctx.room.name} saved to {filename}")

    ctx.add_shutdown_callback(write_transcript)

    # .. The rest of your entrypoint code follows ...



    Transcriptions
Generate realtime transcriptions of agent sessions using client SDKs.

Agents 1.0 available for Python
This documentation is for v0.x of the LiveKit Agents framework.

See updated documentation here: Text and transcriptions.

v1.0 for Node.js is coming soon.

Overview
The Agents framework includes the ability to capture and deliver realtime transcriptions of a user's speech and LLM-generated speech or text.

Both VoicePipelineAgent and MultimodalAgent can forward transcriptions to clients automatically if you implement support for receiving them in your frontend. If you're not using either of these agent classes, you can add transcription forwarding to your agent code.

To learn more about creating transcriptions in the agent process, see Recording agent sessions.

Frontend integration
You can use a LiveKit SDK to receive transcription events in your frontend.

Transcriptions are delivered in segments, each associated with a particular Participant and Track. Each segment has a unique id. Segments might be sent as fragments as they're generated. You can monitor the final property to determine when a segment is complete.

JavaScriptSwiftAndroidFlutter
This example uses React with TypeScript, but the principles are the same for other frameworks.

Collect TranscriptionSegment by listening to RoomEvent.TranscriptionReceived:

import { useEffect, useState } from "react";
import { 
  TranscriptionSegment, 
  Participant,
  TrackPublication,
  RoomEvent, 
} from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";

export default function Transcriptions() {
  const room = useMaybeRoomContext();
  const [transcriptions, setTranscriptions] = useState<{ [id: string]: TranscriptionSegment }>({});

  useEffect(() => {
    if (!room) {
      return;
    }

    const updateTranscriptions = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
      setTranscriptions((prev) => {
        const newTranscriptions = { ...prev };
        for (const segment of segments) {
          newTranscriptions[segment.id] = segment;
        }
        return newTranscriptions;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
    };
  }, [room]);

  return (
    <ul>
      {Object.values(transcriptions)
        .sort((a, b) => a.firstReceivedTime - b.firstReceivedTime)
        .map((segment) => (
          <li key={segment.id}>{segment.text}</li>
        ))}
    </ul>
  )
}
Copy
Agent integration
The STTSegmentsForwarder class provides an interface for delivering transcriptions from your custom agent to your frontend in realtime. Here's a sample implementation:

from livekit.agents import stt, transcription
from livekit.plugins.deepgram import STT

async def _forward_transcription(
    stt_stream: stt.SpeechStream,
    stt_forwarder: transcription.STTSegmentsForwarder,
):
    """Forward the transcription and log the transcript in the console"""
    async for ev in stt_stream:
        stt_forwarder.update(ev)
        if ev.type == stt.SpeechEventType.INTERIM_TRANSCRIPT:
            print(ev.alternatives[0].text, end="")
        elif ev.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
            print("\n")
            print(" -> ", ev.alternatives[0].text)


async def entrypoint(job: JobContext):
    stt = STT()
    tasks = []

    async def transcribe_track(participant: rtc.RemoteParticipant, track: rtc.Track):
        audio_stream = rtc.AudioStream(track)
        stt_forwarder = transcription.STTSegmentsForwarder(
            room=job.room, participant=participant, track=track
        )
        stt_stream = stt.stream()
        stt_task = asyncio.create_task(
            _forward_transcription(stt_stream, stt_forwarder)
        )
        tasks.append(stt_task)

        async for ev in audio_stream:
            stt_stream.push_frame(ev.frame)

    @job.room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            tasks.append(asyncio.create_task(transcribe_track(participant, track)))
Copy

Voice pipeline nodes
Learn how to customize the behavior of your agent by overriding nodes in the voice pipeline.

Overview
The Agents framework allows you to fully customize your agent's behavior at multiple nodes in the processing path. A node is a point in the path where one process transitions to another. In the case of STT, LLM, and TTS nodes, in addition to customizing the pre- and post-processing at the transition point from one node to the next, you can also entirely replace the default process with custom code.

These nodes are exposed on the Agent class and occur at the following points in the pipeline:

on_enter(): Agent enters session.
on_exit(): Agent exits session.
on_user_turn_completed(): User's turn is completed.
transcription_node(): Processing agent's LLM output to transcriptions.
stt_node(): Agent's STT processing step (pipeline only).
llm_node(): Agent's LLM processing step (pipeline only).
tts_node(): Agent's TTS processing step (pipeline only).
realtime_audio_output_node(): Agent's audio output step (realtime only).
Note
If you're using a realtime model, on_user_turn_completed is available only if turn detection is handled by the agent instead of the realtime API.

Pipeline and realtime agent differences
Realtime agents aren't componentized like pipeline agents and don't have nodes for STT, LLM, and TTS. Instead, realtime agents use a single model for the entire agent, and the agent processes user input in realtime. You can still customize the behavior of a realtime agent by overriding the transcription node, updating the agent's instructions, or adding to its chat context.

Agent with a voice pipeline
Processing path for a voice pipeline agent:

Diagram showing voice pipeline agent processing path.
Agent with a realtime model
Processing path for a realtime agent:

Diagram showing realtime agent processing path.
Use cases for customization
The following use cases are some examples of how you can customize your agent's behavior:

Use a custom STT, LLM, or TTS provider without a plugin.
Generate a custom greeting when an agent enters a session.
Modify STT output to remove filler words before sending it to the LLM.
Modify LLM output before sending it to TTS to customize pronunciation.
Update the user interface when an agent or user finishes speaking.
Customizing node behavior
Each node is a step in the agent pipeline where processing takes place. By default, some nodes are stub methods, and other nodes (the STT, LLM, and TTS nodes) execute the code in the provider plugin. For these nodes, you can customize behavior by overriding the node and adding additional processing before, after, or instead of the default behavior.

Stub methods are provided to allow you to add functionality at specific points in the processing path.

On enter and exit nodes
The on_enter and on_exit nodes are called when the agent enters or leaves an agent session. When an agent enters a session, it becomes that agent in control and handles processing for the session until the agent exits. To learn more, see Workflows.

For example, initiate a conversation when an agent enters the session:

async def on_enter(self):
    # Instruct the agent to greet the user when it's added to a session
    self.session.generate_reply(
        instructions="Greet the user with a warm welcome",
    )
Copy
For a more comprehensive example of a handoff between agents, and saving chat history in the on_enter node, see the restaurant ordering and reservations example.

You can override the on_exit method to say goodbye before the agent exits the session:

async def on_exit(self):
    # Say goodbye
    await self.session.generate_reply(
        instructions="Tell the user a friendly goodbye before you exit.",
    )
Copy
On turn completed node
The on_user_turn_completed node is called when the user finishes speaking. You can customize this node by overriding the on_user_turn_completed method in your Agent.

At this point, new_message contains the user's input but hasn't yet been added to the chat context. The message is added after on_user_turn_completed returns.

This hook can be used to perform RAG (retrieval-augmented generation) by injecting additional context into the chat history before generation.

async def on_user_turn_completed(
    self, turn_ctx: ChatContext, new_message: ChatMessage,
) -> None:
    # look up context via RAG
    rag_content = await my_rag_lookup(new_message.text_content())
    turn_ctx.add_message(role="assistant", content=rag_content)
    # changes to chat_ctx is used for only the next generation, and not persisted
    # to persist changes to the chat context do the following:
    # chat_ctx = turn_ctx.copy()
    # chat_ctx.add_message(...)
    # await self.update_chat_ctx(chat_ctx)
Copy
To abort generation entirely—for example, in a push-to-talk interface—you can do the following:

async def on_user_turn_completed(
    self, turn_ctx: ChatContext, new_message: ChatMessage,
) -> None:
    if not new_message.text_content:
        # for example, raise StopResponse to stop the agent from generating a reply
        raise StopResponse()
Copy
For a complete example, see the multi-user agent with push to talk example.

STT node
From the STT node, you can customize how audio frames are handled before being sent to the default STT provider, and post-process the STT output before it's passed to the LLM.

To use the default implementation, call Agent.default.stt_node().

For example, you can add noise filtering to the STT node by overriding the stt_node method in your Agent:

# add these imports
from livekit import rtc
from livekit.agents.voice import ModelSettings
from livekit.agents import stt
from typing import AsyncIterable, Optional

async def stt_node(
    self, audio: AsyncIterable[rtc.AudioFrame], model_settings: ModelSettings
) -> Optional[AsyncIterable[stt.SpeechEvent]]:
    async def filtered_audio():
        async for frame in audio:
            # Apply some noise filtering logic here
            yield frame
    
    async for event in Agent.default.stt_node(self, filtered_audio(), model_settings):
        yield event
Copy
LLM node
The LLM node is responsible for generating the agent's response. You can customize the LLM node by overriding the llm_node method in your Agent.

llm_node can be used to integrate with custom LLM providers without having to create a plugin. As long as it returns AsyncIterable[llm.ChatChunk], the LLM node will forward the chunks to the next node in the pipeline.

You can also update the LLM output before sending it to the TTS node as in the following example:

# add these imports
from livekit.agents.voice import ModelSettings
from livekit.agents import llm, FunctionTool
from typing import AsyncIterable

async def llm_node(
    self,
    chat_ctx: llm.ChatContext,
    tools: list[FunctionTool],
    model_settings: ModelSettings
) -> AsyncIterable[llm.ChatChunk]:
    
    # Process with base LLM implementation
    async for chunk in Agent.default.llm_node(self, chat_ctx, tools, model_settings):
        # Do something with the LLM output before sending it to the next node
        yield chunk
Copy
llm_node can also be used to handle structured output. See full example here.

TTS node
The TTS node is responsible for converting the LLM output into audio. You can customize the TTS node by overriding the tts_node method in your Agent. For example, you can update the TTS output before sending it to the user interface as in the following example:

# add these imports
from livekit import rtc
from livekit.agents.voice import ModelSettings
from livekit.agents import tts
from typing import AsyncIterable

async def tts_node(
    self,
    text: AsyncIterable[str],
    model_settings: ModelSettings
) -> AsyncIterable[rtc.AudioFrame]:
    """
    Process text-to-speech with custom pronunciation rules before synthesis.
    Adjusts common technical terms and abbreviations for better pronunciation.
    """
    # Dictionary of pronunciation replacements.
    # Support for custom pronunciations depends on the TTS provider.
    # To learn more, see the Speech documentation:
    # https://docs.livekit.io/agents/build/speech/#pronunciation.
    pronunciations = {
        "API": "A P I",
        "REST": "rest",
        "SQL": "sequel",
        "kubectl": "kube control",
        "AWS": "A W S",
        "UI": "U I",
        "URL": "U R L",
        "npm": "N P M",
        "LiveKit": "Live Kit",
        "async": "a sink",
        "nginx": "engine x",
    }
    
    async def adjust_pronunciation(input_text: AsyncIterable[str]) -> AsyncIterable[str]:
        async for chunk in input_text:
            modified_chunk = chunk
            
            # Apply pronunciation rules
            for term, pronunciation in pronunciations.items():
                # Use word boundaries to avoid partial replacements
                modified_chunk = re.sub(
                    rf'\b{term}\b',
                    pronunciation,
                    modified_chunk,
                    flags=re.IGNORECASE
                )
            
            yield modified_chunk
    
    # Process with modified text through base TTS implementation
    async for frame in Agent.default.tts_node(
        self,
        adjust_pronunciation(text),
        model_settings
    ):
        yield frame
Copy
Transcription node
The transcription node is part of the forwarding path for agent transcriptions. By default, the node simply passes the transcription to the task that forwards it to the designated output. You can customize this behavior by overriding the transcription_node method in your Agent. For example, you can strip any unwanted formatting before it's sent to the client as transcripts.

# add these imports
from livekit.agents.voice import ModelSettings
from typing import AsyncIterable

async def transcription_node(self, text: AsyncIterable[str], model_settings: ModelSettings) -> AsyncIterable[str]:    
    def cleanup_text(text_chunk: str) -> str:
        # Strip unwanted characters
        return text_chunk.replace("😘", "")

    async for delta in text:
        yield cleanup_text(delta)
Copy
Realtime audio output node
The realtime_audio_output_node is called when a realtime model outputs speech. This allows you to modify the audio output before it's sent to the user. For example, you can speed up or slow down the audio in the following example:

# add these imports
from livekit import rtc
from livekit.agents.voice import ModelSettings
from livekit.agents import utils
from typing import AsyncIterable

def _process_audio(self, frame: rtc.AudioFrame) -> rtc.AudioFrame:
    pass

async def _process_audio_stream(
    audio: AsyncIterable[rtc.AudioFrame]
) -> AsyncIterable[rtc.AudioFrame]:
    stream: utils.audio.AudioByteStream | None = None
    async for frame in audio:
        if stream is None:
            stream = utils.audio.AudioByteStream(
                sample_rate=frame.sample_rate,
                num_channels=frame.num_channels,
                samples_per_channel=frame.sample_rate // 10,  # 100ms
            )
        for f in stream.push(frame.data):
            yield _process_audio(f)

    for f in stream.flush():
        yield _process_audio(f)


async def realtime_audio_output_node(
    self, audio: AsyncIterable[rtc.AudioFrame], model_settings: ModelSettings
) -> AsyncIterable[rtc.AudioFrame]:
    return _process_audio_stream(
        Agent.default.realtime_audio_output_node(self, audio, model_settings)
    )




Sending text
Use text streams to send any amount of text between participants.

Overview
Text streams provide a simple way to send text between participants in realtime, supporting use cases such as chat, streamed LLM responses, and more. Each individual stream is associated with a topic, and you must register a handler to receive incoming streams for that topic. Streams can target specific participants or the entire room.

To send other kinds of data, use byte streams instead.

Sending all at once
Use the sendText method when the whole string is available up front. The input string is automatically chunked and streamed so there is no limit on string size.

JavaScriptSwiftPythonNode.jsGo
const text = 'Lorem ipsum dolor sit amet...';
const info = await room.localParticipant.sendText(text, {
  topic: 'my-topic',
});

console.log(`Sent text with stream ID: ${info.id}`);
Copy
Streaming incrementally
If your text is generated incrementally, use streamText to open a stream writer. You must explicitly close the stream when you are done sending data.

JavaScriptSwiftPythonNode.jsGo
const streamWriter = await room.localParticipant.streamText({
  topic: 'my-topic',
});   

console.log(`Opened text stream with ID: ${streamWriter.info.id}`);

// In a real app, you would generate this text asynchronously / incrementally as well
const textChunks = ["Lorem ", "ipsum ", "dolor ", "sit ", "amet..."]
for (const chunk of textChunks) {
  await streamWriter.write(chunk)
}

// The stream must be explicitly closed when done
await streamWriter.close(); 

console.log(`Closed text stream with ID: ${streamWriter.info.id}`);
Copy
Handling incoming streams
Whether the data was sent with sendText or streamText, it is always received as a stream. You must register a handler to receive it.

JavaScriptSwiftPythonNode.jsGo
room.registerTextStreamHandler('my-topic', (reader, participantInfo) => {
  const info = reader.info;
  console.log(
    `Received text stream from ${participantInfo.identity}\n` +
    `  Topic: ${info.topic}\n` +
    `  Timestamp: ${info.timestamp}\n` +
    `  ID: ${info.id}\n` +
    `  Size: ${info.size}` // Optional, only available if the stream was sent with `sendText`
  );  

  // Option 1: Process the stream incrementally using a for-await loop.
  for await (const chunk of reader) {
    console.log(`Next chunk: ${chunk}`);
  }

  // Option 2: Get the entire text after the stream completes.
  const text = await reader.readAll();
  console.log(`Received text: ${text}`);
});
Copy
Stream properties
These are all of the properties available on a text stream, and can be set from the send/stream methods or read from the handler.

Property	Description	Type
id	Unique identifier for this stream.	string
topic	Topic name used to route the stream to the appropriate handler.	string
timestamp	When the stream was created.	number
size	Total expected size in bytes (UTF-8), if known.	number
attributes	Additional attributes as needed for your application.	string dict
destinationIdentities	Identities of the participants to send the stream to. If empty, is sent to all.	array
Concurrency
Multiple streams can be written or read concurrently. If you call sendText or streamText multiple times on the same topic, the recipient's handler will be invoked multiple times, once for each stream. These invocations will occur in the same order as the streams were opened by the sender, and the stream readers will be closed in the same order in which the streams were closed by the sender.

Joining mid-stream
Participants who join a room after a stream has been initiated will not receive any of it. Only participants connected at the time the stream is opened are eligible to receive it.

No message persistence
LiveKit does not include long-term persistence for text streams. All data is transmitted in real-time between connected participants only. If you need message history, you'll need to implement storage yourself using a database or other persistence layer.

Chat components
LiveKit provides pre-built React components for common text streaming use cases like chat. For details, see the Chat component and useChat hook.

Note
Streams are a simple and powerful way to send text, but if you need precise control over individual packet behavior, the lower-level data packets API may be more appropriate.



Voice AI quickstart
Build a simple voice assistant with Python in less than 10 minutes.

Overview
This guide walks you through the setup of your very first voice assistant using LiveKit Agents for Python. In less than 10 minutes, you'll have a voice assistant that you can speak to in your terminal, browser, telephone, or native app.

Requirements
The following sections describe the minimum requirements to get started with LiveKit Agents.

Python
LiveKit Agents requires Python 3.9 or later.

Looking for Node.js?
The Node.js beta is still in development and has not yet reached v1.0. See the v0.x documentation for Node.js reference and join the LiveKit Community Slack to be the first to know when the next release is available.

LiveKit server
You need a LiveKit server instance to transport realtime media between user and agent. The easiest way to get started is with a free LiveKit Cloud account. Create a project and use the API keys in the following steps. You may also self-host LiveKit if you prefer.

AI providers
LiveKit Agents integrates with most AI model providers and supports both high-performance STT-LLM-TTS voice pipelines, as well as lifelike multimodal models.

The rest of this guide assumes you use one of the following two starter packs, which provide the best combination of value, features, and ease of setup.

STT-LLM-TTS pipelineRealtime model
Your agent strings together three specialized providers into a high-performance voice pipeline. You need accounts and API keys for each.

Diagram showing STT-LLM-TTS pipeline.
Component	Provider	Required Key	Alternatives
STT	Deepgram	DEEPGRAM_API_KEY	STT integrations
LLM	OpenAI	OPENAI_API_KEY	LLM integrations
TTS	Cartesia	CARTESIA_API_KEY	TTS integrations
Setup
Use the instructions in the following sections to set up your new project.

Packages
Noise cancellation
This example integrates LiveKit Cloud enhanced background voice/noise cancellation, powered by Krisp. If you're not using LiveKit Cloud, omit the plugin and the noise_cancellation parameter from the following code.

STT-LLM-TTS pipelineRealtime model
Install the following packages to build a complete voice AI agent with your STT-LLM-TTS pipeline, noise cancellation, and turn detection:

pip install \
  "livekit-agents[deepgram,openai,cartesia,silero,turn-detector]~=1.0" \
  "livekit-plugins-noise-cancellation~=0.2" \
  "python-dotenv"
Copy
Environment variables
Create a file named .env and add your LiveKit credentials along with the necessary API keys for your AI providers.

STT-LLM-TTS pipelineRealtime model
.env
DEEPGRAM_API_KEY=<Your Deepgram API Key>
OPENAI_API_KEY=<Your OpenAI API Key>
CARTESIA_API_KEY=<Your Cartesia API Key>
LIVEKIT_API_KEY=<your API Key>
LIVEKIT_API_SECRET=<your API Secret>
LIVEKIT_URL=<your LiveKit server URL>
Reveal API Key and Secret
Copy
Agent code
Create a file named main.py containing the following code for your first voice agent.

STT-LLM-TTS pipelineRealtime model
main.py
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are a helpful voice AI assistant.")


async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
Copy
Download model files
To use the turn-detector, silero, or noise-cancellation plugins, you first need to download the model files:

python main.py download-files
Copy
Speak to your agent
Start your agent in console mode to run inside your terminal:

python main.py console
Copy
Your agent speaks to you in the terminal, and you can speak to it as well.

Screenshot of the CLI console mode.
Connect to playground
Start your agent in dev mode to connect it to LiveKit and make it available from anywhere on the internet:

python main.py dev
Copy
Use the Agents playground to speak with your agent and explore its full range of multimodal capabilities.

Congratulations, your agent is up and running. Continue to use the playground or the console mode as you build and test your agent.

Agent CLI modes
In the console mode, the agent runs locally and is only available within your terminal.

Run your agent in dev (development / debug) or start (production) mode to connect to LiveKit and join rooms.

Next steps
Follow these guides bring your voice AI app to life in the real world.
