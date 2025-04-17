'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ToggleButtons } from '@/components/toggle-buttons'
import { Button } from '@/components/ui/button'
import { Grid, Save, Mic, FileText, Zap, X as CloseIcon } from 'lucide-react'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { VoiceAgentInterface } from '@/components/VoiceAgentInterface'
import { AgentState } from "@livekit/components-react"


export default function TestAndRefineWithAlicePage() {
  const router = useRouter()
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('test')
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()
  const [agentState, setAgentState] = useState<AgentState>("disconnected")

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
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Test and refine your assistant</h1>
          </div>

          <ToggleButtons activeOption={activeOption} onToggle={handleOptionToggle} />

          <VoiceAgentInterface 
            assistantName="ALICE" 
            autoConnect={true}
            className="max-w-4xl mx-auto"
          />
        </div>
      </main>

      {/* Deploy Button */}
      <div className="fixed bottom-8 right-8">
        <Button 
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-8"
          onClick={() => router.push('/deployment-success')}
        >
          <Zap className="w-4 h-4" />
          DEPLOY
        </Button>
      </div>
    </div>
  )
}
