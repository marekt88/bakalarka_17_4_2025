'use client'

import { useState, useRef } from 'react'
import { Settings2 } from 'lucide-react'
import { AudioWaveformPlayer, AudioPlayerRef } from './audio-waveform-player'

interface VoiceCardProps {
  name: string;
  description: string;
  color: string;
  isActive?: boolean;
  audioSrc: string;
  onSelect: () => void;
}

export function VoiceCard({ name, description, color, isActive, audioSrc, onSelect }: VoiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  
  const colorMap: { [key: string]: string } = {
    'green': '#10b981',
    'blue': '#3b82f6',
    'purple': '#8b5cf6',
    'orange': '#f59e0b',
    'pink': '#ec4899'
  }
  
  const bgColor = colorMap[color] || '#6d28d9'

  // Handle card click - both select the voice and play/pause audio
  const handleCardClick = () => {
    onSelect(); // Select the voice (original functionality)
    
    // Play/pause audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.togglePlayPause();
    }
  }

  return (
    <div 
      className={`relative w-[300px] aspect-square rounded-lg overflow-hidden cursor-pointer ${isActive ? 'ring-2 ring-white' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient with the voice's color */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `linear-gradient(45deg, ${bgColor}40 0%, ${bgColor}20 100%)`
        }}
      />

      {/* Waveform pattern decoration (static, just for visual) */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`wavePattern-${name}`} width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" fill="none" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#wavePattern-${name})`} />
        </svg>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 top-0 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-white/70">{description}</p>
          </div>
          <button 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              // Settings action can be added here
            }}
          >
            <Settings2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Audio player at the bottom */}
      <div 
        className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with audio controls
      >
        <AudioWaveformPlayer 
          ref={audioPlayerRef}
          audioSrc={audioSrc} 
          color={bgColor} 
          preload={isActive || isHovered} // Only preload if active or hovered
        />
      </div>
    </div>
  )
}

