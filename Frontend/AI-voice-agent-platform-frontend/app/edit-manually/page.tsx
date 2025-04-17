'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleButtons } from '@/components/toggle-buttons'
import { SettingsSlider } from '@/components/settings-slider'
import { SettingsToggle } from '@/components/settings-toggle'
import { Grid, Save, Mic, FileText, Zap } from 'lucide-react'
import { TestMicrophoneButton } from '@/components/test-microphone-button'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'

// Sample function to fetch assistant configuration
const fetchAssistantConfig = async (id: string) => {
  // In a real application, this would be an API call
  return {
    name: 'Sample Assistant',
    prompt: 'This is a sample prompt for the assistant.',
    temperature: 0.7,
    waitSeconds: 0.5,
    onPunctuationSeconds: 0.2,
    onNoPunctuationSeconds: 1.0,
    smartEndpointing: true,
    detectEmotion: false,
  }
}

export default function EditManuallyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('edit')
  const [isRecording, setIsRecording] = useState(false)
  
  // Form state
  const [assistantName, setAssistantName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [temperature, setTemperature] = useState([0.7])
  const [waitSeconds, setWaitSeconds] = useState([0.4])
  const [onPunctuationSeconds, setOnPunctuationSeconds] = useState([0.1])
  const [onNoPunctuationSeconds, setOnNoPunctuationSeconds] = useState([1.5])
  const [smartEndpointing, setSmartEndpointing] = useState(true)
  const [detectEmotion, setDetectEmotion] = useState(true)

  useEffect(() => {
    const assistantId = searchParams?.get('id')
    if (assistantId) {
      fetchAssistantConfig(assistantId).then((config) => {
        setAssistantName(config.name)
        setPrompt(config.prompt)
        setTemperature([config.temperature])
        setWaitSeconds([config.waitSeconds])
        setOnPunctuationSeconds([config.onPunctuationSeconds])
        setOnNoPunctuationSeconds([config.onNoPunctuationSeconds])
        setSmartEndpointing(config.smartEndpointing)
        setDetectEmotion(config.detectEmotion)
      })
    }
  }, [searchParams])

  const handleOptionToggle = (option: 'test' | 'edit') => {
    if (option === 'test') {
      router.push('/test-and-refine-with-alice')
    }
    setActiveOption(option)
  }

  const handleMicrophoneClick = async () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
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
          <div className="flex items-center gap-4">
            <Link
              href="/assistants"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <Grid className="w-4 h-4" />
              Back to Assistants
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
            <h1 className="text-3xl font-bold">Edit Assistant: {assistantName}</h1>
          </div>

          <ToggleButtons activeOption={activeOption} onToggle={handleOptionToggle} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prompt Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-white/70">PROMPT</h2>
                <Textarea
                  className="min-h-[300px] bg-black/20 border-white/10 resize-none"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button className="bg-green-500 hover:bg-green-600">
                  Save
                </Button>
              </div>

              {/* Timing Settings */}
              <div className="space-y-4 bg-black/20 p-4 rounded-lg">
                <SettingsSlider
                  label="Wait seconds"
                  tooltip="This is how long assistant waits before speaking."
                  min={0}
                  max={2}
                  value={waitSeconds}
                  onChange={setWaitSeconds}
                  unit=" (sec)"
                />
                
                <SettingsToggle
                  label="Smart Endpointing"
                  tooltip="Enable for more accurate speech endpoint detection."
                  checked={smartEndpointing}
                  onCheckedChange={setSmartEndpointing}
                />

                <SettingsSlider
                  label="On Punctuation Seconds"
                  tooltip="Minimum seconds to wait after transcription ending with punctuation."
                  min={0}
                  max={3}
                  value={onPunctuationSeconds}
                  onChange={setOnPunctuationSeconds}
                  unit=" (sec)"
                />

                <SettingsSlider
                  label="On No Punctuation Seconds"
                  tooltip="Minimum seconds to wait after transcription ending without punctuation."
                  min={0}
                  max={3}
                  value={onNoPunctuationSeconds}
                  onChange={setOnNoPunctuationSeconds}
                  unit=" (sec)"
                />
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Provider</label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">openai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Model</label>
                  <Select defaultValue="gpt-4o-mini">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Knowledge Base</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Files" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file1">File 1</SelectItem>
                      <SelectItem value="file2">File 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <SettingsSlider
                  label="Temperature"
                  tooltip="Controls randomness in the output"
                  min={0}
                  max={2}
                  value={temperature}
                  onChange={setTemperature}
                />

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Max Tokens</label>
                  <input
                    type="number"
                    defaultValue={250}
                    className="w-full bg-black/20 border border-white/10 rounded-md p-2"
                  />
                </div>

                <SettingsToggle
                  label="Detect Emotion"
                  checked={detectEmotion}
                  onCheckedChange={setDetectEmotion}
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <TestMicrophoneButton
                  isRecording={isRecording}
                  onClick={handleMicrophoneClick}
                />
                <span className="text-sm text-white/70">TEST HERE</span>
              </div>
            </div>
          </div>
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

