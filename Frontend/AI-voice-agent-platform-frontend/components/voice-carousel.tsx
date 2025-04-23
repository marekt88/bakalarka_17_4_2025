'use client'

import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VoiceCard } from './voice-card'

interface Voice {
  name: string;
  description: string;
  color: string;
  gender: string;
  audioSrc: string;
}

interface VoiceCarouselProps {
  filter: 'all' | 'man' | 'woman';
  voices: Voice[];
  selectedVoice: string;
  onVoiceSelect: (name: string) => void;
}

export function VoiceCarousel({ filter, voices, selectedVoice, onVoiceSelect }: VoiceCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // Changed to false to reduce complexity
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter voices when filter changes
  useEffect(() => {
    const newFilteredVoices = filter === 'all' 
      ? voices 
      : voices.filter(voice => voice.gender === filter)
    
    setFilteredVoices(newFilteredVoices)
  }, [filter, voices])

  // Re-initialize carousel when filtered voices change
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
      
      // Reset to the first slide when filter changes
      emblaApi.scrollTo(0)
      setCurrentIndex(0)
    }
  }, [emblaApi, filteredVoices])

  // Track current slide index for optimization
  useEffect(() => {
    if (!emblaApi) return
    
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap())
    }
    
    emblaApi.on('select', onSelect)
    onSelect() // Set initial index
    
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Function to check if a slide is visible or in the near vicinity
  const isSlideInViewport = (index: number): boolean => {
    if (currentIndex === index) return true
    return Math.abs(currentIndex - index) <= 1
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 py-4">
          {filteredVoices.map((voice, index) => (
            <div 
              key={voice.name} 
              className="flex-[0_0_300px] transition-opacity"
              style={{ 
                opacity: isSlideInViewport(index) ? 1 : 0.5,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <VoiceCard
                name={voice.name}
                description={voice.description}
                color={voice.color}
                audioSrc={voice.audioSrc}
                isActive={voice.name === selectedVoice}
                onSelect={() => onVoiceSelect(voice.name)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {filteredVoices.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
      
      {/* Pagination dots */}
      {filteredVoices.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {filteredVoices.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/30'}`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

