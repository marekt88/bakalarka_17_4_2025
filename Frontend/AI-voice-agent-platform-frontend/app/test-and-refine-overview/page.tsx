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
import { NavigationBar } from '@/components/NavigationBar'
import { useProgressIndicator } from '@/hooks/use-progress-indicator'

const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files' },
  { number: 3, title: 'Answer questions' },
  { number: 4, title: 'Test and refine', isActive: true },
]

export default function TestAndRefineOverviewPage() {
  const router = useRouter()
  const { showProgressIndicator, setupAutoHide } = useProgressIndicator()
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('test')
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

  // Setup auto-hide for the progress indicator after 5 seconds
  useEffect(() => {
    return setupAutoHide(5000);
  }, [setupAutoHide]);

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
          {!showProgressIndicator ? <NavigationBar /> : (
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <Grid className="w-4 h-4" />
                Back to dashboard
              </Link>
            </div>
          )}
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
        {showProgressIndicator && <ProgressSteps steps={steps} />}
        
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Test and refine your assistant</h1>
          </div>

          <ToggleButtons activeOption={activeOption} onToggle={handleOptionToggle} />

          {/* Display both assistants side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generated Assistant (Left) */}
            <div className="p-6 border border-white/10 rounded-lg bg-white/5">
              <h2 className="text-xl font-semibold mb-6">Test with your generated assistant</h2>
              
              <UnifiedVoiceAgent
                assistantName="YOUR AGENT"
                assistantType="generated_assistant"
                className="max-w-full mx-auto"
              />
            </div>
            
            {/* Improvement Assistant (Right) - Replacing Landing Assistant */}
            <div className="p-6 border border-white/10 rounded-lg bg-white/5">
              <h2 className="text-xl font-semibold mb-6">Provide feedback with Alice</h2>
              <p className="text-white/70 mb-4 text-sm">
                Alice will help you identify improvements for your agent based on your conversation history
              </p>
              
              <UnifiedVoiceAgent
                assistantName="ALICE"
                assistantType="improvement"
                className="max-w-full mx-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

