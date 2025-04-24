import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the first message file
    const firstMessageFilePath = path.join(process.cwd(), '..', '..', 'Backend', 'generated_prompts', 'first_message.txt');
    
    // Read the file content
    const content = fs.readFileSync(firstMessageFilePath, 'utf-8');
    
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error reading first message file:', error);
    return NextResponse.json(
      { error: 'Failed to read first message file' },
      { status: 500 }
    );
  }
}