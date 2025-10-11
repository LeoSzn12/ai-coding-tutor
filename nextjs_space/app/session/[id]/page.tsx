
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { SessionRoom } from '@/components/session-room';

interface SessionPageProps {
  params: {
    id: string;
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const session = await getAuthSession();
  
  const tutorSession = await prisma.tutorSession.findUnique({
    where: {
      id: params.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      codeChanges: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      checkpoints: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!tutorSession) {
    notFound();
  }

  // Check if user has access to this session
  if (tutorSession.userId && (!session?.user || tutorSession.userId !== (session.user as any).id)) {
    notFound();
  }

  return (
    <SessionRoom 
      session={tutorSession as any}
      user={session?.user as any}
    />
  );
}
