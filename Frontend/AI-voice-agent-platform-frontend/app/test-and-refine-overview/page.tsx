'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProgressSteps } from '@/components/progress-steps'
import { ToggleButtons } from '@/components/toggle-buttons'
import { Button } from '@/components/ui/button'
import { Grid, Save, Mic, FileText } from 'lucide-react'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { UnifiedVoiceAgent } from '@/components/UnifiedVoiceAgent'

const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files' },
  { number: 3, title: 'Answer questions' },
  { number: 4, title: 'Test and refine', isActive: true },
]

export default function TestAndRefineOverviewPage() {
  const router = useRouter()
  const [showProgress, setShowProgress] = useState(true)
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('test')
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProgress(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleOptionToggle = (option: 'test' | 'edit') => {
    if (option === 'edit') {
      router.push('/edit-manually')
    }
    setActiveOption(option)
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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <Grid className="w-4 h-4" />
              Back to dashboard
            </Link>
            {!showProgress && (
              <>
                <Link
                  href="/choose-voice"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                  <Mic className="w-4 h-4" />
                  Change voice
                </Link>
                <Link
                  href="/load-files"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                  <FileText className="w-4 h-4" />
                  Edit files
                </Link>
              </>
            )}
          </div>
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
        {showProgress && <ProgressSteps steps={steps} />}
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Test and refine your assistant</h1>
          </div>

          <ToggleButtons activeOption={activeOption} onToggle={handleOptionToggle} />

          {/* Replace the VoiceAgentInterface with UnifiedVoiceAgent */}
          <div className="p-6 border border-white/10 rounded-lg bg-white/5">
            <h2 className="text-xl font-semibold mb-6">Test with your assistant</h2>
            
            {/* Renamed simple helpful assistant using UnifiedVoiceAgent */}
            <UnifiedVoiceAgent
              assistantName="YOUR AGENT"
              assistantType="generated_assistant"
              className="max-w-full mx-auto"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

