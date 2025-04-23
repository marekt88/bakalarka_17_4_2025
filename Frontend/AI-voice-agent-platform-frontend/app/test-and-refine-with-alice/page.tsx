'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ToggleButtons } from '@/components/toggle-buttons'
import { Button } from '@/components/ui/button'
import { Grid, Save, Mic, FileText, Zap, X as CloseIcon, RefreshCcw } from 'lucide-react'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { VoiceAgentInterface } from '@/components/VoiceAgentInterface'
import { UnifiedVoiceAgent } from '@/components/UnifiedVoiceAgent'
import { AgentState } from "@livekit/components-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function TestAndRefineWithAlicePage() {
  const router = useRouter()
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('test')
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()
  const [agentState, setAgentState] = useState<AgentState>("disconnected")
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false)
  const [aliceConnectionEnded, setAliceConnectionEnded] = useState(false)
  const [showIterateDialog, setShowIterateDialog] = useState(false)
  const [iterationCount, setIterationCount] = useState(0)

  const handleOptionToggle = (option: 'test' | 'edit') => {
    if (option === 'edit') {
      router.push('/edit-manually')
    }
    setActiveOption(option)
  }

  // Handle Alice conversation end to trigger processing state
  const handleAliceDisconnect = useCallback(async () => {
    setAliceConnectionEnded(true)
    setIsProcessingFeedback(true)
    
    try {
      // Simulate API call to process feedback and update agent (in a real app this would call an API endpoint)
      await new Promise(resolve => setTimeout(resolve, 5000)) // Simulate 5 seconds of processing time
      
      // In a real implementation, we would make an API call to update the agent prompt
      // const response = await fetch('/api/process-feedback', { method: 'POST' })
      // if (!response.ok) throw new Error('Failed to process feedback')
      
      // After successful update, show iteration dialog instead of just removing processing state
      setIsProcessingFeedback(false)
      setShowIterateDialog(true)
      setIterationCount(prev => prev + 1)
    } catch (error) {
      console.error('Error processing feedback:', error)
      // Show error notification if needed
      setIsProcessingFeedback(false)
    }
  }, [])

  // Effect to detect when Alice agent disconnects
  useEffect(() => {
    if (agentState === "disconnected" && !aliceConnectionEnded) {
      // This means the Alice agent was connected and is now disconnected
      const lastConnected = localStorage.getItem('alice_last_connected')
      const currentTime = new Date().getTime()
      
      if (lastConnected && (currentTime - parseInt(lastConnected)) < 5000) {
        handleAliceDisconnect()
      }
    } else if (agentState !== "disconnected") {
      // Update the last connected time whenever Alice is connected
      localStorage.setItem('alice_last_connected', new Date().getTime().toString())
      setAliceConnectionEnded(false)
    }
  }, [agentState, handleAliceDisconnect, aliceConnectionEnded])

  // Handle continuing to iterate
  const handleContinueIteration = () => {
    setShowIterateDialog(false)
    // Any additional setup needed for the next iteration
  }

  // Handle finishing the iteration process
  const handleFinishIteration = () => {
    setShowIterateDialog(false)
    // Optionally redirect to deployment or another page
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
            disabled={isSaving || isProcessingFeedback}
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
            {iterationCount > 0 && (
              <p className="text-white/70 mt-1">Iteration count: {iterationCount}</p>
            )}
          </div>

          <ToggleButtons activeOption={activeOption} onToggle={handleOptionToggle} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Alice Agent (Improvement Agent) */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Talk with ALICE</h2>
              <p className="text-white/70 mb-4">
                Get help and feedback from Alice to improve your agent.
              </p>
              <VoiceAgentInterface 
                assistantName="ALICE" 
                autoConnect={false}
                className="w-full"
              />
            </div>
            
            {/* Generated Agent */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Your Generated Agent</h2>
              <p className="text-white/70 mb-4">
                Test how your voice agent will interact with users.
              </p>
              <UnifiedVoiceAgent
                assistantName="Voice Agent" 
                assistantType="generated"
                className="w-full"
                isProcessingFeedback={isProcessingFeedback}
              />
            </div>
          </div>
        </div>
      </main>

      {/* "Continue to iterate?" Dialog */}
      <Dialog open={showIterateDialog} onOpenChange={setShowIterateDialog}>
        <DialogContent className="bg-[#1B1C1F] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Continue to iterate?</DialogTitle>
            <DialogDescription className="text-white/70">
              Your agent has been updated with the feedback. Would you like to continue refining your agent with ALICE?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-800/40 rounded-md">
            <p className="text-sm text-white/80">
              <span className="font-medium">Iteration {iterationCount} complete.</span> The more you iterate with ALICE, the better your agent will become.
            </p>
          </div>
          <DialogFooter className="flex flex-row space-x-4 sm:justify-between mt-6">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={handleFinishIteration}
            >
              Finish
            </Button>
            <Button 
              className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={handleContinueIteration}
            >
              <RefreshCcw className="w-4 h-4" />
              Continue to iterate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Button */}
      <div className="fixed bottom-8 right-8">
        <Button 
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-8"
          onClick={() => router.push('/deployment-success')}
          disabled={isProcessingFeedback}
        >
          <Zap className="w-4 h-4" />
          DEPLOY
        </Button>
      </div>
    </div>
  )
}
