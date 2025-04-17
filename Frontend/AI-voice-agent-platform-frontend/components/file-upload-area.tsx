'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void
}

export function FileUploadArea({ onFileUpload }: FileUploadAreaProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles)
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center cursor-pointer hover:border-white/20"
    >
      <input {...getInputProps()} />
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
  )
}

