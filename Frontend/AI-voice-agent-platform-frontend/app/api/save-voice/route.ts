import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { voiceName } = data;
    
    if (!voiceName) {
      return NextResponse.json({ error: 'Voice name is required' }, { status: 400 });
    }

    // Path to the selected_voice.txt file
    const filePath = path.join(process.cwd(), '..', '..', 'Backend', 'assistant_setup', 'selected_voice.txt');

    // Write the voice name to the file
    fs.writeFileSync(filePath, voiceName, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving selected voice:', error);
    return NextResponse.json({ error: 'Failed to save selected voice' }, { status: 500 });
  }
}