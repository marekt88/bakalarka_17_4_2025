import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(request: NextRequest) {
  try {
    // Define backend directory relative to project root
    const rootDir = process.cwd()
    const backendDir = path.join(rootDir, '..', '..', 'Backend')
    const knowledgebasePath = path.join(backendDir, 'knowledgebase')
    
    console.log(`Fetching files from: ${knowledgebasePath}`)

    // Check if directory exists
    try {
      await fs.access(knowledgebasePath)
    } catch (error) {
      // Directory doesn't exist or isn't accessible
      return NextResponse.json({ 
        files: [] 
      })
    }

    // Get all files from the directory
    const files = await fs.readdir(knowledgebasePath)
    
    // Get detailed file information
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        try {
          const filePath = path.join(knowledgebasePath, fileName)
          const stats = await fs.stat(filePath)

          // Determine file type based on extension
          const fileType = fileName.toLowerCase().endsWith('.pdf') 
            ? 'PDF' 
            : fileName.toLowerCase().endsWith('.txt') 
              ? 'TXT' 
              : 'UNKNOWN'

          return {
            id: `${stats.ctimeMs}`, // Use creation time as unique ID
            name: fileName,
            size: `${Math.round(stats.size / 1024)}KB`, // Convert bytes to KB
            status: 'ready' as const,
            type: fileType,
            lastModified: stats.mtime.toISOString()
          }
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error)
          return null
        }
      })
    )

    // Filter out any null entries from files we couldn't process
    const validFiles = fileDetails.filter(file => file !== null)

    return NextResponse.json({ 
      files: validFiles 
    })
    
  } catch (error) {
    console.error('Error fetching knowledge files:', error)
    return NextResponse.json(
      { error: 'Error fetching knowledge files', details: (error as Error).message },
      { status: 500 }
    )
  }
}