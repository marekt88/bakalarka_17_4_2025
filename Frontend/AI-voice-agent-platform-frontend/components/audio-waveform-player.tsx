'use client'

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause } from 'lucide-react'

interface AudioWaveformPlayerProps {
  audioSrc: string;
  color?: string;
  preload?: boolean;
}

// Define the ref type that will be exposed to the parent
export interface AudioPlayerRef {
  togglePlayPause: () => Promise<void>;
  isPlaying: boolean;
}

export const AudioWaveformPlayer = forwardRef<AudioPlayerRef, AudioWaveformPlayerProps>(
  ({ audioSrc, color = '#6d28d9', preload = false }, ref) => {
    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const animationRef = useRef<number | null>(null)
    
    // State
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    
    // Toggle play/pause function
    const togglePlayPause = async () => {
      if (!audioRef.current) return;
      
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          // Try to play (may fail due to browser autoplay restrictions)
          try {
            await audioRef.current.play();
          } catch (err) {
            console.error('Error playing audio:', err);
            // If failed due to autoplay policy, show a user notification
            if (err instanceof DOMException && err.name === 'NotAllowedError') {
              console.log('Autoplay was prevented by the browser.');
              // Add visual feedback about autoplay restriction if needed
            }
          }
        }
      } catch (err) {
        console.error('Error toggling audio playback:', err);
      }
    };

    // Expose the togglePlayPause method to parents
    useImperativeHandle(ref, () => ({
      togglePlayPause,
      isPlaying
    }));
    
    // Initialize audio element
    useEffect(() => {
      // Create audio element
      const audio = new Audio();
      audio.src = audioSrc;
      audio.preload = preload ? 'auto' : 'none';
      audioRef.current = audio;
      
      // Add event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      
      // Clean up
      return () => {
        if (audio) {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('ended', handleEnded);
          audio.pause();
          audio.src = '';
        }
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [audioSrc]);
    
    // Setup canvas for waveform visualization
    useEffect(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      const devicePixelRatio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Initial draw
      drawWaveform(ctx, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
      
      // Redraw on resize
      const handleResize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        drawWaveform(ctx, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
    
    // Animation loop for waveform when playing
    useEffect(() => {
      if (!canvasRef.current || !isPlaying) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const animate = () => {
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        drawWaveform(ctx, width, height);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isPlaying]);
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        console.log('Audio loaded:', audioSrc);
        setDuration(audioRef.current.duration);
      }
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
    
    // Draw the waveform visualization
    const drawWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      
      const centerY = height / 2;
      const barCount = 50;
      const barWidth = 2;
      const barSpacing = 2;
      const totalBarWidth = barWidth + barSpacing;
      const maxBarHeight = height * 0.8;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      
      // Generate bars based on position in the audio
      for (let i = 0; i < barCount; i++) {
        const x = i * totalBarWidth;
        
        // Calculate position relative to audio progress
        const position = currentTime / (duration || 1);
        const barPosition = i / barCount;
        
        // Different amplitude behavior for played vs unplayed portion
        let amplitude;
        if (barPosition < position) {
          // For bars already played, use the color parameter
          ctx.fillStyle = color;
          
          // Animate based on position + time
          const timeFactor = Date.now() % 1000 / 1000;
          amplitude = (Math.sin(i * 0.2 + timeFactor * Math.PI * 2) + 1) * 0.4 + 0.2;
        } else {
          // Restore color for unplayed portion
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          
          // Static pattern for unplayed portion, slight variation per bar
          amplitude = (Math.sin(i * 0.5) + 1) * 0.25 + 0.1;
        }
        
        // During playback, add some animation to nearby bars at the playhead
        if (isPlaying && Math.abs(barPosition - position) < 0.05) {
          // Add extra amplitude near the playhead
          amplitude += 0.3 * (1 - Math.abs(barPosition - position) * 20);
        }
        
        const barHeight = maxBarHeight * amplitude;
        
        // Draw the bar
        ctx.beginPath();
        ctx.roundRect(
          x, 
          centerY - barHeight / 2, 
          barWidth, 
          barHeight, 
          [barWidth / 2]
        );
        ctx.fill();
      }
    };

    // Format time in MM:SS
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-1">
          <button 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          <div className="flex-1 h-[30px] relative">
            <canvas 
              ref={canvasRef}
              className="w-full h-full rounded-md"
              style={{ 
                display: 'block',
              }}
            />
            {/* Progress indicator */}
            <div 
              className="absolute bottom-0 left-0 h-[2px] bg-white opacity-50"
              style={{ 
                width: `${(currentTime / (duration || 1)) * 100}%`,
                backgroundColor: color,
                transition: 'width 0.2s linear'
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-white/70">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>
    )
  }
)