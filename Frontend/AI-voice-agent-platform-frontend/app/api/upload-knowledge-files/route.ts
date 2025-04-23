import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'
import { writeFile, mkdir } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    // Get form data with files
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Accept both PDF and TXT files
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.pdf') || 
      file.name.toLowerCase().endsWith('.txt')
    )
    
    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files provided. Only PDF and TXT files are supported.' },
        { status: 400 }
      )
    }

    // Define backend directory relative to project root
    // Important: This assumes the API route is running from the Frontend/AI-voice-agent-platform-frontend directory
    const rootDir = process.cwd()
    // Navigate up from Frontend/AI-voice-agent-platform-frontend to get to project root, then to Backend
    const backendDir = path.join(rootDir, '..', '..', 'Backend')
    // Define the correct knowledgebase directory path
    const knowledgebasePath = path.join(backendDir, 'knowledgebase')
    
    console.log(`Attempting to save files to: ${knowledgebasePath}`)

    // Create knowledgebase directory if it doesn't exist
    try {
      await fsPromises.access(knowledgebasePath)
    } catch (error) {
      await mkdir(knowledgebasePath, { recursive: true })
    }

    // Process and save each file
    const savedFiles = await Promise.all(
      validFiles.map(async (file) => {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const filePath = path.join(knowledgebasePath, file.name)
        
        await writeFile(filePath, fileBuffer)
        
        return {
          name: file.name,
          path: filePath,
          type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TXT'
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      message: `${savedFiles.length} files successfully uploaded to knowledgebase`,
      files: savedFiles.map(file => `${file.name} (${file.type})`)
    })
    
  } catch (error) {
    console.error('Error processing file upload:', error)
    return NextResponse.json(
      { error: 'Error processing file upload', details: (error as Error).message },
      { status: 500 }
    )
  }
}