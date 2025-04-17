'use client'

import { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VoiceCard } from './voice-card'

interface Voice {
 name: string;
 description: string;
 color: string;
 gender: string;
 videoSrc: string;
}

interface VoiceCarouselProps {
 filter: 'all' | 'man' | 'woman';
 voices: Voice[];
 selectedVoice: string;
 onVoiceSelect: (name: string) => void;
}

export function VoiceCarousel({ filter, voices, selectedVoice, onVoiceSelect }: VoiceCarouselProps) {
 const [emblaRef, emblaApi] = useEmblaCarousel({
   loop: true,
   align: 'center',
   containScroll: 'trimSnaps',
 })

 const [filteredVoices, setFilteredVoices] = useState(voices)

 useEffect(() => {
   if (filter === 'all') {
     setFilteredVoices(voices)
   } else {
     setFilteredVoices(voices.filter(voice => voice.gender === filter))
   }
 }, [filter, voices])

 useEffect(() => {
   if (emblaApi) {
     emblaApi.reInit()
   }
 }, [emblaApi, filteredVoices])

 const scrollPrev = () => emblaApi?.scrollPrev()
 const scrollNext = () => emblaApi?.scrollNext()

 return (
   <div className="relative w-full max-w-4xl mx-auto">
     <div className="overflow-hidden" ref={emblaRef}>
       <div className="flex gap-4 py-4">
         {filteredVoices.map((voice, index) => (
           <div key={voice.name} className="flex-[0_0_300px]">
             <VoiceCard
               {...voice}
               isActive={voice.name === selectedVoice}
               onSelect={() => onVoiceSelect(voice.name)}
             />
           </div>
         ))}
       </div>
     </div>
     <button
       onClick={scrollPrev}
       className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30"
     >
       <ChevronLeft className="w-6 h-6 text-white" />
     </button>
     <button
       onClick={scrollNext}
       className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30"
     >
       <ChevronRight className="w-6 h-6 text-white" />
     </button>
   </div>
 )
}

