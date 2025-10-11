
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLiveKitToken } from '@/lib/livekit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[LiveKit Token] Request for session:', params.id);
    
    const session = await getAuthSession();
    console.log('[LiveKit Token] Auth session:', session?.user?.email || 'No user');
    
    // Get the tutor session
    const tutorSession = await prisma.tutorSession.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!tutorSession) {
      console.error('[LiveKit Token] Session not found:', params.id);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[LiveKit Token] Session found:', {
      id: tutorSession.id,
      roomName: tutorSession.roomName,
      userId: tutorSession.userId
    });

    // Check if user has access to this session
    if (tutorSession.userId && (!session?.user || tutorSession.userId !== (session.user as any).id)) {
      console.error('[LiveKit Token] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Generate LiveKit token
    const identity = session?.user?.email || `guest-${Date.now()}`;
    const roomName = tutorSession.roomName || tutorSession.id;
    
    console.log('[LiveKit Token] Generating token for:', { identity, roomName });
    
    const token = await createLiveKitToken(roomName, identity);
    
    console.log('[LiveKit Token] Token generated successfully');

    return NextResponse.json({ token, roomName });
  } catch (error: any) {
    console.error('[LiveKit Token] Error generating token:', {
      message: error?.message,
      stack: error?.stack,
      error
    });
    return NextResponse.json(
      { error: error?.message || 'Failed to generate token', details: error?.toString() },
      { status: 500 }
    );
  }
}
