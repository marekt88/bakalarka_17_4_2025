'use client'

import { Mic } from 'lucide-react'

interface TestMicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function TestMicrophoneButton({ isRecording, onClick }: TestMicrophoneButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-200 ${
        isRecording 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <Mic className={`w-16 h-16 text-white ${isRecording ? 'animate-pulse' : ''}`} />
    </button>
  )
}

