import { AgentState, VoiceAssistantControlBar } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic } from "lucide-react";

interface VoiceControlPanelProps {
  agentState: AgentState;
  onReconnect: () => void;
}

/**
 * A component that displays controls for the voice assistant.
 * It shows a connect button when disconnected and control buttons when connected.
 */
export function VoiceControlPanel({ agentState, onReconnect }: VoiceControlPanelProps) {
  return (
    <div className="mt-8 flex flex-col items-center">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="rounded-full w-16 h-16 bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
            onClick={onReconnect}
            aria-label="Connect to voice assistant"
          >
            <Mic className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {agentState !== "disconnected" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4"
          >
            <VoiceAssistantControlBar 
              controls={{ 
                mute: true, 
                stop: true,
                leave: true
              }}
              className="bg-[#2A2B2F] p-2 rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
