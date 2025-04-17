'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProgressSteps } from '@/components/progress-steps'
import { Button } from '@/components/ui/button'
import { Grid, Save } from 'lucide-react'
import { FileUploadArea } from '@/components/file-upload-area'
import { UploadedFilesTable } from '@/components/uploaded-files-table'
import { useRouter } from 'next/navigation'
import { useSaveChanges } from '@/hooks/use-save-changes'
import { SaveChangesPopup } from '@/components/save-changes-popup'; // Import the SaveChangesPopup component


const steps = [
  { number: 1, title: 'Choose a voice' },
  { number: 2, title: 'Load files', isActive: true },
  { number: 3, title: 'Answer questions' },
  { number: 4, title: 'Test and refine' },
]

const initialFiles = [
  { id: '#876364', name: 'File three', size: '25MB', status: 'generating' as const, type: 'PDF' },
  { id: '#876368', name: 'File two', size: '521', status: 'ready' as const, type: 'PDF' },
  { id: '#876412', name: 'File one', size: '62', status: 'ready' as const, type: 'PDF' },
]

export default function LoadFilesPage() {
  const router = useRouter()
  const [files, setFiles] = useState(initialFiles)
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()

  const handleFileUpload = (newFiles: File[]) => {
    const newUploadedFiles = newFiles.map((file, index) => ({
      id: `#${Math.random().toString(36).substr(2, 6)}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)}KB`,
      status: 'generating' as const,
      type: 'PDF'
    }))
    setFiles([...newUploadedFiles, ...files])
  }

  const handleEditFAQ = (id: string) => {
    console.log('Edit FAQ for file:', id)
  }

  const handleGenerateFAQ = (id: string) => {
    console.log('Generate FAQ for file:', id)
  }

  const handleContinue = () => {
    router.push('/answer-questions')
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

          {files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Uploaded files</h2>
              <UploadedFilesTable
                files={files}
                onEditFAQ={handleEditFAQ}
                onGenerateFAQ={handleGenerateFAQ}
              />
            </div>
          )}

          <FileUploadArea onFileUpload={handleFileUpload} />

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

