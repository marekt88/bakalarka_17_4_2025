'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ProgressSteps } from '@/components/progress-steps'
import { VoiceCarousel } from '@/components/voice-carousel'
import { Button } from '@/components/ui/button'
import { Grid, Save } from 'lucide-react'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { SaveChangesPopup } from '@/components/save-changes-popup'

const steps = [
 { number: 1, title: 'Choose a voice', isActive: true },
 { number: 2, title: 'Load files' },
 { number: 3, title: 'Answer questions' },
 { number: 4, title: 'Test and refine' },
]

const voices = [
 { name: 'Piper', description: 'Great for AI agents', color: 'green', gender: 'woman', videoSrc: '/videos/voice-1.mp4' },
 { name: 'Sarah', description: 'Professional and clear', color: 'blue', gender: 'woman', videoSrc: '/videos/voice-2.mp4' },
 { name: 'Frederick Surrey', description: 'Great for audiobooks', color: 'purple', gender: 'man', videoSrc: '/videos/voice-3.mp4' },
 { name: 'Michael', description: 'Warm and friendly', color: 'orange', gender: 'man', videoSrc: '/videos/voice-4.mp4' },
 { name: 'Emma', description: 'Natural and engaging', color: 'pink', gender: 'woman', videoSrc: '/videos/voice-5.mp4' },
]

export default function ChooseVoicePage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const [assistantName, setAssistantName] = useState('')
 const [filter, setFilter] = useState<'all' | 'man' | 'woman'>('all')
 const [selectedVoice, setSelectedVoice] = useState(voices[0].name)
 const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

 useEffect(() => {
   const name = searchParams.get('name')
   if (name) {
     setAssistantName(decodeURIComponent(name))
   }
 }, [searchParams])

 const handleUse = () => {
   router.push('/load-files')
 }

 return (
   <div className="min-h-screen bg-[#1B1C1F] text-white">
     <SaveChangesPopup 
       isOpen={showSavePopup} 
       onClose={() => setShowSavePopup(false)} 
     />
     {/* Header */}
     <header className="border-b border-white/10">
       <div className="container mx-auto px-4 h-16 flex items-center justify-between">
         <Link
           href="/"
           className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
         >
           <Grid className="w-4 h-4" />
           Back to dashboard
         </Link>
         <Button 
           variant="outline" 
           className="gap-2 text-black border-green-500 bg-green-500/50 hover:bg-green-600/50 hover:text-black"
           onClick={handleSaveChanges}
           disabled={isSaving}
         >
           <Save className="w-4 h-4" />
           {isSaving ? 'Saving...' : 'Save changes'}
         </Button>
       </div>
     </header>

     {/* Main Content */}
     <main className="container mx-auto px-4 py-8 space-y-8">
       <ProgressSteps steps={steps} />
       
       <div className="max-w-4xl mx-auto space-y-4">
         <div>
           <h1 className="text-3xl font-bold">Choose a voice for {assistantName}</h1>
           <p className="text-white/70">You can change your selection later</p>
         </div>

         <VoiceCarousel 
           filter={filter} 
           voices={voices} 
           selectedVoice={selectedVoice}
           onVoiceSelect={setSelectedVoice}
         />

         <div className="flex items-center justify-between pt-8">
           <div className="flex items-center gap-4">
             <span className="text-white/70">Filter:</span>
             <div className="flex gap-2">
               <Button 
                 variant={filter === 'man' ? 'secondary' : 'outline'} 
                 size="sm"
                 onClick={() => setFilter(filter === 'man' ? 'all' : 'man')}
                 className="text-white hover:text-white bg-purple-600 hover:bg-purple-700 border-purple-600"
               >
                 Man
               </Button>
               <Button 
                 variant={filter === 'woman' ? 'secondary' : 'outline'} 
                 size="sm"
                 onClick={() => setFilter(filter === 'woman' ? 'all' : 'woman')}
                 className="text-white hover:text-white bg-purple-600 hover:bg-purple-700 border-purple-600"
               >
                 Woman
               </Button>
             </div>
           </div>
           <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8" onClick={handleUse}>
             USE
           </Button>
         </div>
       </div>
     </main>
   </div>
 )
}

