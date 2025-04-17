'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'

interface MicrophoneButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function MicrophoneButton({ onStartRecording, onStopRecording }: MicrophoneButtonProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleClick = () => {
    if (isRecording) {
      setIsRecording(false)
      onStopRecording()
    } else {
      setIsRecording(true)
      onStartRecording()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-pulse' : ''}`} />
    </button>
  )
}

