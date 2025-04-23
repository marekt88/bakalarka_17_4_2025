'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void
}

export function FileUploadArea({ onFileUpload }: FileUploadAreaProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.txt')
    )
    
    // Show error if invalid files were dropped
    if (validFiles.length < acceptedFiles.length) {
      setErrorMessage('Only PDF and TXT files are supported. Some files were skipped.')
      setTimeout(() => setErrorMessage(null), 3000) // Clear error after 3 seconds
    } else if (acceptedFiles.length > 0 && validFiles.length === 0) {
      setErrorMessage('Only PDF and TXT files are supported.')
      setTimeout(() => setErrorMessage(null), 3000) // Clear error after 3 seconds
    }
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles)
      setErrorMessage(null)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    } 
  })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center cursor-pointer hover:border-white/20"
      >
        <input {...getInputProps()} accept=".pdf,.txt" />
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-white/50" />
          <Button className="bg-purple-600 hover:bg-purple-700">
            UPLOAD FILE
          </Button>
          <p className="text-white/50 text-sm">
            OR DRAG AND DROP
          </p>
        </div>
      </div>
      
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}
      
      <p className="text-white/50 text-sm mt-2 text-center">
        Only PDF and TXT files are supported. Please upload documents in .pdf or .txt format.
      </p>
    </div>
  )
}

