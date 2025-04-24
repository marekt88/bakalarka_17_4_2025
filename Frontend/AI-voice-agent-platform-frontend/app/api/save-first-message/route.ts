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
    
    // Path to the first message file
    const firstMessageFilePath = path.join(process.cwd(), '..', '..', 'Backend', 'generated_prompts', 'first_message.txt');
    
    // Write the content to the file
    fs.writeFileSync(firstMessageFilePath, content);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving first message file:', error);
    return NextResponse.json(
      { error: 'Failed to save first message file' },
      { status: 500 }
    );
  }
}