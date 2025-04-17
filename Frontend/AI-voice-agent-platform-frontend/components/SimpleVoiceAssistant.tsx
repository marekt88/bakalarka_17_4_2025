import { AgentState, useVoiceAssistant } from "@livekit/components-react";
import { useEffect } from "react";

interface SimpleVoiceAssistantProps {
  onStateChange: (state: AgentState) => void;
}

/**
 * A component that displays a voice assistant with a simple dot animation.
 * It uses the LiveKit voice assistant hook to handle the voice assistant state.
 */
export function SimpleVoiceAssistant({ onStateChange }: SimpleVoiceAssistantProps) {
  const { state } = useVoiceAssistant();
  
  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);
  
  // Determine color based on state
  const dotColor = 
    state === 'speaking' ? 'bg-purple-500' : 
    state === 'listening' ? 'bg-green-500' :
    state === 'processing' ? 'bg-blue-500' :
    state === 'connecting' ? 'bg-yellow-500' :
    'bg-gray-400';
  
  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Simple dot animation */}
      <div className="h-32 rounded-lg bg-black/20 p-4 flex items-center justify-center">
        {(state !== 'disconnected') && (
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
        )}
        
        {state === 'disconnected' && (
          <div className="text-white/60 text-sm">
            Click connect to start
          </div>
        )}
      </div>
      
      <p className="text-center mt-4 text-white/70 text-sm uppercase tracking-wide">
        {state === 'speaking' ? 'ALICE is speaking...' : 
         state === 'listening' ? 'Listening...' : 
         state === 'processing' ? 'Processing...' : 
         state === 'connecting' ? 'Connecting...' :
         'Press button to talk with ALICE'}
      </p>
    </div>
  );
}
