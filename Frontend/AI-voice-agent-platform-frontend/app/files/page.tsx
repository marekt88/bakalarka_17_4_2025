'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Grid } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FileUploadArea } from '@/components/file-upload-area'
import { UploadedFilesTable } from '@/components/uploaded-files-table'

const initialFiles = [
  { id: '#876364', name: 'File three', size: '25MB', status: 'ready' as const, type: 'PDF' },
  { id: '#876368', name: 'File two', size: '521KB', status: 'ready' as const, type: 'PDF' },
  { id: '#876412', name: 'File one', size: '62KB', status: 'ready' as const, type: 'PDF' },
]

export default function FilesPage() {
  const [files, setFiles] = useState(initialFiles)

  const handleFileUpload = (newFiles: File[]) => {
    const newUploadedFiles = newFiles.map((file) => ({
      id: `#${Math.random().toString(36).substr(2, 6)}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      status: 'generating' as const,
      type: 'PDF'
    }))
    setFiles([...newUploadedFiles, ...files])
  }

  const handleEditFAQ = (id: string) => {
    console.log('Edit FAQ for file:', id)
  }

  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <Grid className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Add knowledgebase files</h1>
          <p className="mt-2 text-white/70">
            These files will be used by the agents to respond to certain queries.
          </p>
        </div>

        <div className="space-y-8">
          {files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Uploaded files</h2>
              <div className="max-h-[400px] overflow-y-auto">
                <UploadedFilesTable
                  files={files}
                  onEditFAQ={handleEditFAQ}
                  onGenerateFAQ={() => {}}
                />
              </div>
            </div>
          )}

          <FileUploadArea onFileUpload={handleFileUpload} />
        </div>
      </main>
    </div>
  )
}

