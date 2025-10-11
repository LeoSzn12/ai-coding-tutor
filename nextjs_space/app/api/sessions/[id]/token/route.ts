
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createLiveKitToken } from '@/lib/livekit';
import { prisma } from '@/lib/db';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getAuthSession();
    
    const tutorSession = await prisma.tutorSession.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!tutorSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check access permissions
    if (tutorSession.userId && (!session?.user || tutorSession.userId !== (session.user as any).id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!tutorSession.roomName) {
      return NextResponse.json({ error: 'Room not configured' }, { status: 400 });
    }

    const identity = session?.user?.email || `anonymous-${Date.now()}`;
    const token = await createLiveKitToken(tutorSession.roomName, identity);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error creating LiveKit token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
