'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProgressSteps } from '@/components/progress-steps'
import { Button } from '@/components/ui/button'
import { Grid, Save } from 'lucide-react'
import { UnifiedVoiceAgent } from '@/components/UnifiedVoiceAgent'
import { NavigationBar } from '@/components/NavigationBar'

const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files' },
  { number: 3, title: 'Answer questions', isActive: true },
  { number: 4, title: 'Test and refine' },
]

export default function AnswerQuestionsPage() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/test-and-refine-overview')
  }

  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavigationBar />
          <Button variant="outline" className="gap-2 text-black border-green-500 bg-green-500/50 hover:bg-green-600/50 hover:text-black">
            <Save className="w-4 h-4" />
            Save changes
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <ProgressSteps steps={steps} />
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Talk to ALICE</h1>
            <p className="mt-4 text-white/70">
              Answer her questions and tell her all the relevant details. She will create the voice agent based on your input.
            </p>
          </div>

          {/* Unified Voice Agent Component with explicit assistant type */}
          <UnifiedVoiceAgent 
            assistantName="ALICE" 
            className="max-w-2xl mx-auto" 
            assistantType="onboarding"
          />

          <div className="flex justify-end">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              onClick={handleContinue}
            >
              CONTINUE →
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}