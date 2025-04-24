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
import { Grid, Save, Mic, FileText, Zap, ChevronDown, Play } from 'lucide-react'
import { TestMicrophoneButton } from '@/components/test-microphone-button'
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { UnifiedVoiceAgent } from '@/components/UnifiedVoiceAgent'

// Sample function to fetch assistant configuration
const fetchAssistantConfig = async (id: string) => {
  try {
    // Fetch the prompt content from the file
    const promptResponse = await fetch('/api/get-prompt-content');
    const promptData = await promptResponse.json();
    
    // Fetch the first message content from the file
    const firstMessageResponse = await fetch('/api/get-first-message');
    const firstMessageData = await firstMessageResponse.json();
    
    return {
      name: 'Voice Agent',
      prompt: promptData.content || 'This is a sample prompt for the assistant.',
      firstMessage: firstMessageData.content || '',
      waitSeconds: 0.5,
      onPunctuationSeconds: 0.2,
      onNoPunctuationSeconds: 1.0,
      smartEndpointing: true,
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      name: 'Sample Assistant',
      prompt: 'This is a sample prompt for the assistant.',
      firstMessage: '',
      waitSeconds: 0.5,
      onPunctuationSeconds: 0.2,
      onNoPunctuationSeconds: 1.0,
      smartEndpointing: true,
    }
  }
}

// Function to save prompt and first message back to files
const savePromptAndFirstMessage = async (prompt: string, firstMessage: string) => {
  try {
    // Save the prompt content
    const promptSaveResponse = await fetch('/api/save-prompt-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: prompt }),
    });
    
    // Save the first message content
    const firstMessageSaveResponse = await fetch('/api/save-first-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: firstMessage }),
    });
    
    return promptSaveResponse.ok && firstMessageSaveResponse.ok;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

export default function EditManuallyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()
  const [activeOption, setActiveOption] = useState<'test' | 'edit'>('edit')
  const [isRecording, setIsRecording] = useState(false)
  const [showTestSection, setShowTestSection] = useState(false)
  
  // Form state
  const [assistantName, setAssistantName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const assistantId = searchParams?.get('id')
    // Load data regardless of whether we have an ID or not
    fetchAssistantConfig(assistantId || '').then((config) => {
      setAssistantName(config.name)
      setPrompt(config.prompt)
      setFirstMessage(config.firstMessage || '')
    }).catch(error => {
      console.error('Error loading configuration:', error);
    })
  }, [searchParams])

  const handleOptionToggle = (option: 'test' | 'edit') => {
    if (option === 'test') {
      router.push('/test-and-refine-overview')
    }
    setActiveOption(option)
  }

  // Custom save function to save both prompt and first message
  const handleSavePromptAndMessage = async () => {
    try {
      setSaveStatus('saving');
      const success = await savePromptAndFirstMessage(prompt, firstMessage);
      if (success) {
        setSaveStatus('success');
        // Reset status after a delay
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveStatus('error');
    }
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
            className={`gap-2 ${
              saveStatus === 'success'
                ? 'text-black border-green-600 bg-green-600/50 hover:bg-green-600/50 hover:text-black'
                : saveStatus === 'error'
                ? 'text-white border-red-500 bg-red-500/50 hover:bg-red-500/50'
                : 'text-black border-green-500 bg-green-500/50 hover:bg-green-600/50 hover:text-black'
            }`}
            onClick={handleSavePromptAndMessage}
            disabled={saveStatus === 'saving'}
          >
            <Save className="w-4 h-4" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save changes'}
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
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-white/70">PROMPT</h2>
                <Textarea
                  className="min-h-[300px] bg-black/20 border-white/10 resize-none"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-medium text-white/70">FIRST MESSAGE</h2>
                <Textarea
                  className="min-h-[100px] bg-black/20 border-white/10 resize-none"
                  placeholder="Enter the first message the assistant will say..."
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <Button 
                    className={`${
                      saveStatus === 'success' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : saveStatus === 'error'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    onClick={handleSavePromptAndMessage}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                  </Button>
                  {saveStatus === 'success' && (
                    <span className="text-green-500">Changes saved successfully!</span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-red-500">Error saving changes. Please try again.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Provider</label>
                  <Select defaultValue="openai">
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="openai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">openai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Model</label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="gpt-4o" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                      <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                      <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                      <SelectItem value="gpt-4">gpt-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                      <SelectItem value="o1">o1</SelectItem>
                      <SelectItem value="o3">o3</SelectItem>
                      <SelectItem value="o3-mini">o3-mini</SelectItem>
                      <SelectItem value="o4-mini">o4-mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Agent Toggle Button */}
          <div className="w-full flex justify-start mt-8">
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={() => setShowTestSection(!showTestSection)}
            >
              <Play className="w-4 h-4" />
              {showTestSection ? 'Hide Test Interface' : 'Test Your Agent'}
            </Button>
          </div>

          {/* Test Agent Section */}
          {showTestSection && (
            <div className="mt-8 p-6 border border-white/10 rounded-lg bg-white/5 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4">Test Your Generated Agent</h2>
              <p className="text-white/70 mb-6">
                Talk to your voice agent with the current prompt and settings to test how it will respond.
                Make sure to save your changes before testing to use the latest versions of your prompt and first message.
              </p>
              
              <UnifiedVoiceAgent
                assistantName="YOUR AGENT"
                assistantType="generated_assistant"
                className="max-w-md mx-auto"
              />
            </div>
          )}
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

