import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }
    
    // Path to the prompt file
    const promptFilePath = path.join(process.cwd(), '..', '..', 'Backend', 'generated_prompts', 'current_voice_agent_prompt.md');
    
    // Write the content to the file
    fs.writeFileSync(promptFilePath, content);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving prompt file:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt file' },
      { status: 500 }
    );
  }
}