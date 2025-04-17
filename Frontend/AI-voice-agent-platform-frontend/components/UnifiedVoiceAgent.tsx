"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AgentState,
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant
} from "@livekit/components-react";
import { Mic, PhoneOff } from "lucide-react";
import { MediaDeviceFailure } from "livekit-client";

// Define the connection details interface
interface ConnectionDetails {
  participantToken: string;
  serverUrl: string;
}

interface UnifiedVoiceAgentProps {
  assistantName?: string;
  className?: string;
  assistantType?: "landing" | "onboarding"; // Add this parameter
}

export function UnifiedVoiceAgent({ 
  assistantName = "ALICE",
  className = "",
  assistantType = "landing" // Default to landing
}: UnifiedVoiceAgentProps) {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [showTimeoutNotification, setShowTimeoutNotification] = useState(false);
  const [agentHasConnected, setAgentHasConnected] = useState(false);

  // Function to get connection details from the API
  const connectToVoiceAssistant = useCallback(async () => {
    try {
      // Set connecting state immediately for better UX
      setAgentState("connecting");
      
      const url = new URL('/api/connection-details', window.location.origin);
      url.searchParams.append('assistant', assistantName.toLowerCase());
      url.searchParams.append('type', assistantType); // Add assistant type parameter
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }
      
      const connectionDetailsData = await response.json();
      setConnectionDetails(connectionDetailsData);
    } catch (error) {
      console.error('Error connecting to voice assistant:', error);
      // Reset to disconnected on error
      setAgentState("disconnected");
    }
  }, [assistantName, assistantType]);

  // Handle disconnection
  const handleDisconnect = useCallback(() => {
    setConnectionDetails(undefined);
    setAgentState("disconnected");
    setAgentHasConnected(false);
  }, []);

  // Show timeout notification if connection takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (agentState === "connecting" && !agentHasConnected) {
      timeoutId = setTimeout(() => {
        setShowTimeoutNotification(true);
      }, 10000); // 10 seconds timeout
    } else {
      setShowTimeoutNotification(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [agentState, agentHasConnected]);

  // Update agentHasConnected status
  useEffect(() => {
    if (["listening", "speaking", "processing"].includes(agentState)) {
      setAgentHasConnected(true);
    }
  }, [agentState]);

  // Handle device failures
  const onDeviceFailure = (error?: MediaDeviceFailure) => {
    console.error(error);
    alert(
      "Error accessing your microphone. Please make sure you grant the necessary permissions in your browser and reload the page."
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={connectionDetails !== undefined}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={handleDisconnect}
        data-lk-theme="default"
        className="rounded-xl p-6 bg-[#0A0118]/50"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <AnimatePresence mode="wait">
            {/* Initial State - Microphone Button */}
            {connectionDetails === undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                <button 
                  onClick={connectToVoiceAssistant}
                  className="h-24 w-24 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center shadow-lg"
                  aria-label={`Start conversation with ${assistantName}`}
                >
                  <Mic className="h-12 w-12 text-white" />
                </button>
                <p className="text-white/80 text-base font-medium">
                  PRESS BUTTON TO TALK WITH {assistantName}
                </p>
              </motion.div>
            )}
            
            {/* Connected State - Dots Visualization */}
            {connectionDetails !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                {/* Dots Visualization */}
                <div className="h-32 rounded-lg bg-black/20 p-4 flex items-center justify-center w-full max-w-md">
                  <ConnectedVoiceVisualization state={agentState} />
                </div>
                
                {/* Status Text */}
                <p className="text-center text-white/70 text-sm uppercase tracking-wide">
                  {agentState === 'speaking' ? `${assistantName} IS SPEAKING...` : 
                   agentState === 'listening' ? 'LISTENING...' : 
                   agentState === 'processing' ? 'PROCESSING...' : 
                   agentState === 'connecting' ? 'CONNECTING...' :
                   'CALL CONNECTED'}
                </p>
                
                {/* End Conversation Button */}
                <button 
                  onClick={handleDisconnect}
                  className="px-5 py-2.5 rounded-md bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2 text-white"
                  aria-label="End conversation"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Conversation
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Always render the audio components */}
          <AgentStateTracker onStateChange={setAgentState} />
          <RoomAudioRenderer />
        </div>
        
        {/* Connection Timeout Notification */}
        {showTimeoutNotification && (
          <div className="fixed text-sm left-1/2 max-w-[90vw] -translate-x-1/2 flex top-6 items-center gap-4 bg-[#1F1F1F] px-4 py-3 rounded-lg z-50">
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <button onClick={() => setShowTimeoutNotification(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.16602 3.16666L12.8327 12.8333M12.8327 3.16666L3.16602 12.8333"
                  stroke="#999999"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}

// Silent component to track agent state
function AgentStateTracker({ onStateChange }: { onStateChange: (state: AgentState) => void }) {
  const { state } = useVoiceAssistant();
  
  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);
  
  return null; // This component doesn't render anything
}

// Helper component for dots visualization
function ConnectedVoiceVisualization({ state }: { state: AgentState }) {
  // Determine color based on state
  const dotColor = 
    state === 'speaking' ? 'bg-purple-500' : 
    state === 'listening' ? 'bg-green-500' :
    state === 'processing' ? 'bg-blue-500' :
    state === 'connecting' ? 'bg-yellow-500' :
    'bg-gray-400';
  
  return (
    <div className="flex gap-3 items-center justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className={`${dotColor} rounded-full animate-pulse`}
          style={{ 
            height: '16px',
            width: '16px',
            animationDelay: `${i * 0.15}s`,
            animationDuration: state === 'speaking' ? '0.8s' : '1.2s'
          }}
        />
      ))}
    </div>
  );
}