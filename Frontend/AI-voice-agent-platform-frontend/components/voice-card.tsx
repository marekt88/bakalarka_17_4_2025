'use client'

import { Play, Settings2 } from 'lucide-react'

interface VoiceCardProps {
 name: string;
 description: string;
 color: string;
 isActive?: boolean;
 videoSrc: string;
 onSelect: () => void;
}

export function VoiceCard({ name, description, color, isActive, videoSrc, onSelect }: VoiceCardProps) {
 return (
   <div 
     className={`relative w-[300px] aspect-square rounded-lg cursor-pointer ${isActive ? 'ring-2 ring-white' : ''}`}
     onClick={onSelect}
   >
     <div className="absolute inset-0 rounded-lg overflow-hidden">
       <video
         className="w-full h-full object-cover"
         poster={`/voice-placeholders/voice-1-placeholder.png?height=300&width=300`}
         loop
         muted
       >
         <source src={videoSrc} type="video/mp4" />
       </video>
     </div>
     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
       <div className="flex items-center justify-between">
         <div>
           <h3 className="text-lg font-semibold text-white">{name}</h3>
           <p className="text-sm text-white/70">{description}</p>
         </div>
         <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
           <Settings2 className="w-4 h-4 text-white" />
         </button>
       </div>
       <div className="mt-2 flex items-center gap-2">
         <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
           <Play className="w-4 h-4 text-white" />
         </button>
         <div className="flex-1 h-1 bg-white/10 rounded-full">
           <div className="h-full w-0 bg-white rounded-full" />
         </div>
         <span className="text-xs text-white/70">0:00 / 0:04</span>
       </div>
     </div>
   </div>
 )
}

