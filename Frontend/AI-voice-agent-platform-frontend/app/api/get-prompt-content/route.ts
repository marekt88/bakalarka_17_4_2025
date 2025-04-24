import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the prompt file
    const promptFilePath = path.join(process.cwd(), '..', '..', 'Backend', 'generated_prompts', 'current_voice_agent_prompt.md');
    
    // Read the file content
    const content = fs.readFileSync(promptFilePath, 'utf-8');
    
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error reading prompt file:', error);
    return NextResponse.json(
      { error: 'Failed to read prompt file' },
      { status: 500 }
    );
  }
}