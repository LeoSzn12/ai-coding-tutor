
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLiveKitToken } from '@/lib/livekit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    
    // Get the tutor session
    const tutorSession = await prisma.tutorSession.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!tutorSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this session
    if (tutorSession.userId && (!session?.user || tutorSession.userId !== (session.user as any).id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Generate LiveKit token
    const identity = session?.user?.email || `guest-${Date.now()}`;
    const roomName = tutorSession.roomName || tutorSession.id;
    
    const token = await createLiveKitToken(roomName, identity);

    return NextResponse.json({ token, roomName });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
