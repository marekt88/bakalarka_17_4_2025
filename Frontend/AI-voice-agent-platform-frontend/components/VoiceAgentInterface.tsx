"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AgentState,
  BarVisualizer,
  DisconnectButton,
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { X as CloseIcon } from "lucide-react";

// Define the connection details interface
interface ConnectionDetails {
  roomName?: string;
  participantName?: string;
  participantToken: string;
  serverUrl: string;
}

interface VoiceAgentInterfaceProps {
  className?: string;
  assistantName?: string;
  autoConnect?: boolean;
}

export function VoiceAgentInterface({ 
  className, 
  assistantName = "ALICE",
  autoConnect = false
}: VoiceAgentInterfaceProps) {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(
    undefined
  );
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    
    // Add assistant name as a parameter if provided
    if (assistantName) {
      url.searchParams.append('assistant', assistantName.toLowerCase());
    }
    
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch connection details: ${response.statusText}`);
      }
      const connectionDetailsData = await response.json();
      setConnectionDetails(connectionDetailsData);
    } catch (error) {
      console.error("Error connecting to LiveKit:", error);
      // You could add UI feedback for the error here
    }
  }, [assistantName]);

  // Auto-connect when the component mounts if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      onConnectButtonClicked();
    }
  }, [autoConnect, onConnectButtonClicked]);

  return (
    <div className={`w-full ${className}`}>
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={connectionDetails !== undefined}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => {
          setConnectionDetails(undefined);
        }}
        data-lk-theme="default"
        className="grid grid-rows-[2fr_1fr] items-center bg-[#0A0118]/50 rounded-xl p-6"
      >
        <VoiceVisualizer onStateChange={setAgentState} assistantName={assistantName} />
        <ControlPanel onConnectButtonClicked={onConnectButtonClicked} agentState={agentState} />
        <RoomAudioRenderer />
        <NoAgentNotification state={agentState} />
      </LiveKitRoom>
    </div>
  );
}

interface VoiceVisualizerProps {
  onStateChange: (state: AgentState) => void;
  assistantName: string;
}

function VoiceVisualizer({ onStateChange, assistantName }: VoiceVisualizerProps) {
  const { state, audioTrack } = useVoiceAssistant();
  
  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);
  
  return (
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer h-full w-full"
        options={{ 
          minHeight: 24,
          maxHeight: 100,
          barWidth: 12,
          gap: 8,
          color: '#9333EA',
          animated: true
        }}
      />
      <p className="text-center mt-4 text-white/70 text-sm uppercase tracking-wide">
        {state === 'speaking' ? `${assistantName} IS SPEAKING...` : 
         state === 'listening' ? 'LISTENING...' : 
         state === 'processing' ? 'PROCESSING...' : 
         state === 'connecting' ? 'CONNECTING...' :
         `PRESS BUTTON TO TALK WITH ${assistantName}`}
      </p>
    </div>
  );
}

interface ControlPanelProps {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}

function ControlPanel({ onConnectButtonClicked, agentState }: ControlPanelProps) {
  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={() => onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon className="w-4 h-4" />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoAgentNotification({ state }: { state: AgentState }) {
  const timeToWaitMs = 10_000;
  const timeoutRef = useRef<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const agentHasConnected = useRef(false);

  // If the agent has connected, we don't need to show the notification.
  if (
    ["listening", "thinking", "speaking"].includes(state) &&
    agentHasConnected.current == false
  ) {
    agentHasConnected.current = true;
  }

  useEffect(() => {
    if (state === "connecting") {
      timeoutRef.current = window.setTimeout(() => {
        if (state === "connecting" && agentHasConnected.current === false) {
          setShowNotification(true);
        }
      }, timeToWaitMs);
    } else {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      setShowNotification(false);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [state]);

  return (
    <>
      {showNotification ? (
        <div className="fixed text-sm left-1/2 max-w-[90vw] -translate-x-1/2 flex top-6 items-center gap-4 bg-[#1F1F1F] px-4 py-3 rounded-lg">
          <div>
            {/* Warning Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.85068 3.63564C10.8197 2.00589 13.1793 2.00589 14.1484 3.63564L21.6323 16.2223C22.6232 17.8888 21.4223 20 19.4835 20H4.51555C2.57676 20 1.37584 17.8888 2.36671 16.2223L9.85068 3.63564ZM12 8.5C12.2761 8.5 12.5 8.72386 12.5 9V13.5C12.5 13.7761 12.2761 14 12 14C11.7239 14 11.5 13.7761 11.5 13.5V9C11.5 8.72386 11.7239 8.5 12 8.5ZM12.75 16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16C11.25 15.5858 11.5858 15.25 12 15.25C12.4142 15.25 12.75 15.5858 12.75 16Z"
                fill="#666666"
              />
            </svg>
          </div>
          <p className="text-pretty w-max">
            It&apos;s quiet... too quiet. Is your agent lost? Ensure your agent is properly
            configured and running on your machine.
          </p>
          <a
            href="https://docs.livekit.io/agents/quickstarts/s2s/"
            target="_blank"
            className="underline whitespace-nowrap"
          >
            View guide
          </a>
          <button onClick={() => setShowNotification(false)}>
            {/* Close Icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.16602 3.16666L12.8327 12.8333M12.8327 3.16666L3.16602 12.8333"
                stroke="#999999"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
