import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import util from 'util'

const execPromise = util.promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Define backend directory relative to project root
    const rootDir = process.cwd()
    const backendDir = path.join(rootDir, '..', '..', 'Backend')
    
    console.log(`Running knowledge indexer in: ${backendDir}`)
    
    // Check which Python environment to use - first try Python directly
    let pythonCmd = 'python'
    
    // Run the knowledge_indexer.py script to process the uploaded files
    const fullCommand = `cd "${backendDir}" && ${pythonCmd} knowledge_indexer.py`
    console.log(`Executing command: ${fullCommand}`)
    
    try {
      const { stdout, stderr } = await execPromise(fullCommand)
      console.log('Knowledge indexer output:', stdout)
      
      if (stderr) {
        console.warn('Knowledge indexer warnings:', stderr)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Knowledge files processed successfully and RAG database updated'
      })
    } catch (execError) {
      console.error('Error executing Python script:', execError)
      
      // Try with python3 if python fails
      if (pythonCmd === 'python') {
        pythonCmd = 'python3'
        const altCommand = `cd "${backendDir}" && ${pythonCmd} knowledge_indexer.py`
        
        try {
          const { stdout, stderr } = await execPromise(altCommand)
          console.log('Knowledge indexer output (python3):', stdout)
          
          if (stderr) {
            console.warn('Knowledge indexer warnings (python3):', stderr)
          }
          
          return NextResponse.json({
            success: true,
            message: 'Knowledge files processed successfully and RAG database updated'
          })
        } catch (altExecError) {
          throw new Error(`Failed to run with both python and python3: ${altExecError}`)
        }
      } else {
        throw execError
      }
    }
  } catch (error) {
    console.error('Error processing knowledge files:', error)
    return NextResponse.json(
      { 
        error: 'Error processing knowledge files', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}