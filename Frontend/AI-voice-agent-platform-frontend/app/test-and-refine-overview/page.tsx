'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProgressSteps } from '@/components/progress-steps'
import { ToggleButtons } from '@/components/toggle-buttons'
import { ProcessSteps } from '@/components/process-steps'
import { Button } from '@/components/ui/button'
import { Grid, Save, Mic, FileText } from 'lucide-react'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'

const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files' },
  { number: 3, title: 'Answer questions' },
  { number: 4, title: 'Test and refine', isActive: true },
]

const processSteps = [
  {
    number: 1,
    description: "Alice will explain the process and connect you with your new assistant"
  },
  {
    number: 2,
    description: "You will talk to your new assistant and alice will store the call recording for context"
  },
  {
    number: 3,
    description: "You will be connected back to Alice and you will explain what to change"
  },
  {
    number: 4,
    description: "Alice will take notes and make the changes."
  },
  {
    number: 5,
    description: "Repeat this process untill you are happy with the results"
  },
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

  const handleContinue = () => {
    router.push('/test-and-refine-with-alice')
  }

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

          <ProcessSteps steps={processSteps} />

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

