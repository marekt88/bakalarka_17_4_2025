import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { NextResponse } from "next/server";

// Environment variables should be defined in `.env.local`
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;

// Don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET(request: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Get the URL to parse search params
    const url = new URL(request.url);
    
    // Generate participant token with a prefix based on the assistant type
    const participantIdentity = `user_${Math.floor(Math.random() * 10_000)}`;
    const assistantName = url.searchParams.get('assistant') || 'default';
    const assistantPurpose = url.searchParams.get('type') || 'landing'; // Get purpose (landing/onboarding)
    const roomName = `${assistantName}_${assistantPurpose}_room_${Math.floor(Math.random() * 10_000)}`;
    const participantToken = await createParticipantToken(
      { identity: participantIdentity },
      roomName
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantIdentity,
    };
    
    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    
    // Notify the backend about the assistant type if needed
    // This would be implemented in a real-world scenario
    // await notifyBackendAboutAssistant(assistantType, roomName);
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("An unknown error occurred", { status: 500 });
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

/**
 * This function would notify the backend about the assistant type
 * In a real-world scenario, this would make an API call to the backend
 */
async function notifyBackendAboutAssistant(assistantType: string, roomName: string) {
  try {
    // The URL of your backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/assistant/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantType,
        roomName,
        // Additional parameters can be added here as needed
        personality: assistantType === 'alice' ? 'teaching' : 'professional',
        voice: assistantType === 'alice' ? 'nova' : 'alloy',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to notify backend about assistant:', error);
    // We don't throw here to avoid breaking the connection details generation
    // The frontend will still try to connect, but the backend might not be ready
  }
}
