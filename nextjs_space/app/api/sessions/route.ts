
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const { title, description, programmingLanguage } = await request.json();

    if (!title || !programmingLanguage) {
      return NextResponse.json({ error: 'Title and programming language are required' }, { status: 400 });
    }

    // Create room name
    const roomName = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create tutor session
    const tutorSession = await prisma.tutorSession.create({
      data: {
        title,
        description: description || null,
        programmingLanguage,
        roomName,
        userId: (session?.user as any)?.id || null,
        isAnonymous: !session?.user,
      },
    });

    // Create LiveKit token
    const identity = session?.user?.email || `anonymous-${Date.now()}`;
    const token = await createLiveKitToken(roomName, identity);

    return NextResponse.json({
      id: tutorSession.id,
      roomName,
      token,
      title: tutorSession.title,
      programmingLanguage: tutorSession.programmingLanguage,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.tutorSession.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
            codeChanges: true,
          },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
