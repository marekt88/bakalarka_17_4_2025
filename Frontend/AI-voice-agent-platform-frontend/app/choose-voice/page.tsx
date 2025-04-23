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
  // Female voices
  { name: 'Shimmer', description: 'Bright and expressive', color: 'pink', gender: 'woman', audioSrc: '/voices/female/voice_shimmer_333668b9-8c03-44d0-994d-5a77534470dc.mp3' },
  { name: 'Sage', description: 'Mature and thoughtful', color: 'green', gender: 'woman', audioSrc: '/voices/female/voice_sage_d3c84a9f-e9eb-459c-a17d-1e2a1d320d74.mp3' },
  { name: 'Nova', description: 'Energetic and clear', color: 'blue', gender: 'woman', audioSrc: '/voices/female/voice_nova_9f8092c4-9a72-4829-abc2-59e86c3eae9a.mp3' },
  { name: 'Fable', description: 'Warm and storytelling', color: 'purple', gender: 'woman', audioSrc: '/voices/female/voice_fable_f84da1eb-f08c-4b3e-b944-45254cfca119.mp3' },
  { name: 'Coral', description: 'Soft and soothing', color: 'orange', gender: 'woman', audioSrc: '/voices/female/voice_coral_6a996e91-d871-48fd-b6a8-876ea3d25922.mp3' },
  { name: 'Alloy', description: 'Balanced and natural', color: 'blue', gender: 'woman', audioSrc: '/voices/female/voice_alloy_c7ed8c89-9754-461a-9356-ba1436ded59e.mp3' },
  
  // Male voices
  { name: 'Onyx', description: 'Deep and authoritative', color: 'purple', gender: 'man', audioSrc: '/voices/male/voice_onyx_51924e96-595a-4158-85f5-cf233e8b5849.mp3' },
  { name: 'Echo', description: 'Clear and resonant', color: 'blue', gender: 'man', audioSrc: '/voices/male/voice_echo_29d02d73-4425-4419-af17-59bf3bdbfaa0.mp3' },
  { name: 'Ballad', description: 'Melodic and smooth', color: 'green', gender: 'man', audioSrc: '/voices/male/voice_ballad_73f24e99-a7eb-4c12-8f46-246b3ad52fa2.mp3' },
  { name: 'Ash', description: 'Warm and friendly', color: 'orange', gender: 'man', audioSrc: '/voices/male/voice_ash_4549eb20-e92c-4a38-9c63-b2d5dbeaacdf.mp3' },
]

export default function ChooseVoicePage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const [assistantName, setAssistantName] = useState('')
 const [filter, setFilter] = useState<'all' | 'man' | 'woman'>('all')
 const [selectedVoice, setSelectedVoice] = useState(voices[0].name)
 const [isSavingVoice, setIsSavingVoice] = useState(false)
 const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
 const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

 useEffect(() => {
   const name = searchParams.get('name')
   if (name) {
     setAssistantName(decodeURIComponent(name))
   }
 }, [searchParams])

 // Clear notification after 5 seconds
 useEffect(() => {
   if (notification) {
     const timer = setTimeout(() => {
       setNotification(null);
     }, 5000);
     return () => clearTimeout(timer);
   }
 }, [notification]);

 const handleUse = async () => {
   try {
     setIsSavingVoice(true);
     
     // Save the selected voice to the backend
     const response = await fetch('/api/save-voice', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ voiceName: selectedVoice }),
     });
     
     if (!response.ok) {
       throw new Error('Failed to save selected voice');
     }
     
     // Show success message
     setNotification({
       type: 'success',
       message: `${selectedVoice} voice has been selected for your assistant.`
     });
     
     // Navigate to the next page after a short delay
     setTimeout(() => {
       router.push('/load-files');
     }, 1000);
     
   } catch (error) {
     console.error('Error saving voice selection:', error);
     
     // Show error message
     setNotification({
       type: 'error',
       message: 'Failed to save voice selection. Please try again.'
     });
   } finally {
     setIsSavingVoice(false);
   }
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

     {/* Notification */}
     {notification && (
       <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg max-w-sm z-50 transition-opacity duration-300 ${
         notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
       }`}>
         <p className="text-white">{notification.message}</p>
       </div>
     )}

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
           <Button 
             className="bg-purple-600 hover:bg-purple-700 text-white px-8" 
             onClick={handleUse}
             disabled={isSavingVoice}
           >
             {isSavingVoice ? 'SAVING...' : 'USE'}
           </Button>
         </div>
       </div>
     </main>
   </div>
 )
}

