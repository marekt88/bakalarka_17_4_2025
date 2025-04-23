'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProgressSteps } from '@/components/progress-steps'
import { Button } from '@/components/ui/button'
import { Grid, Save } from 'lucide-react'
import { FileUploadArea } from '@/components/file-upload-area'
import { UploadedFilesTable } from '@/components/uploaded-files-table'
import { useRouter } from 'next/navigation'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { SaveChangesPopup } from '@/components/save-changes-popup'

const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files', isActive: true },
  { number: 3, title: 'Answer questions' },
  { number: 4, title: 'Test and refine' },
]

// Interface for file objects
interface UploadedFile {
  id: string
  name: string
  size: string
  status: 'ready' | 'generating'
  type: string
  fileData?: File
}

export default function LoadFilesPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

  // Fetch existing files from the knowledgebase directory when the page loads
  useEffect(() => {
    async function fetchExistingFiles() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/get-knowledge-files')
        
        if (!response.ok) {
          console.error('Failed to fetch knowledge files')
          return
        }
        
        const data = await response.json()
        setFiles(data.files || [])
      } catch (error) {
        console.error('Error fetching knowledge files:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExistingFiles()
  }, [])

  const handleFileUpload = (newFiles: File[]) => {
    // Accept PDF and TXT files
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.txt')
    )
    
    if (validFiles.length === 0) return
    
    const newUploadedFiles = validFiles.map((file) => {
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TXT'
      return {
        id: `new-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)}KB`,
        status: 'ready' as const,
        type: fileType,
        fileData: file // Store the actual file object
      }
    })
    
    setFiles(prevFiles => {
      // Filter out any existing files with the same name to avoid duplicates
      const existingFileNames = new Set(prevFiles.map(f => f.name))
      const filteredNewFiles = newUploadedFiles.filter(f => !existingFileNames.has(f.name))
      return [...filteredNewFiles, ...prevFiles]
    })
  }

  const handleContinue = async () => {
    try {
      setIsProcessing(true)
      
      // Filter only files that have fileData (newly uploaded files)
      const newFiles = files.filter(file => file.fileData)
      
      if (newFiles.length > 0) {
        // Make API request to backend to save files
        const formData = new FormData()
        
        newFiles.forEach(file => {
          if (file.fileData) {
            formData.append('files', file.fileData)
          }
        })
        
        // Make API call to backend endpoint
        const response = await fetch('/api/upload-knowledge-files', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to upload files')
        }
      }
      
      // Request to process the uploaded files and update the RAG database
      const processResponse = await fetch('/api/process-knowledge-files', {
        method: 'POST',
      })
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json()
        console.warn('Files uploaded but not processed:', errorData.details)
        // Continue anyway since files were uploaded successfully
      }
      
      // Continue to next page
      router.push('/answer-questions')
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
      setIsProcessing(false)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-12 text-white/50">Loading files...</div>
    }

    return (
      <>
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Files</h2>
            <UploadedFilesTable
              files={files}
              onEditFAQ={() => {}} // Empty function to remove Edit FAQ functionality
              onGenerateFAQ={() => {}} // Empty function to remove Generate FAQ functionality
            />
          </div>
        )}

        <FileUploadArea onFileUpload={handleFileUpload} />

        <div className="flex justify-end">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : 'CONTINUE →'}
          </Button>
        </div>
      </>
    )
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
            href="/choose-voice"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <Grid className="w-4 h-4" />
            Back to voice selection
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
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Add context files</h1>
            <ul className="mt-4 space-y-2 text-white/70">
              <li>Add files with more relevant information</li>
              <li>These files will be used by the agent to respond to certain queries.</li>
              <li>FAQ documents will be automatically created from these files and you will be able to view them in files section.</li>
            </ul>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  )
}

