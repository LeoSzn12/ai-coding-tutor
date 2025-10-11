
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default test user for testing (john@doe.com / johndoe123)
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create sample tutor session for demo
  const sampleSession = await prisma.tutorSession.upsert({
    where: { id: 'demo-session-1' },
    update: {},
    create: {
      id: 'demo-session-1',
      userId: testUser.id,
      title: 'Debug React Hook Error',
      description: 'Getting useEffect infinite loop error',
      programmingLanguage: 'JavaScript',
      status: 'COMPLETED',
      isAnonymous: false,
    },
  });

  // Create sample messages for the session
  await prisma.message.createMany({
    data: [
      {
        sessionId: sampleSession.id,
        role: 'USER',
        content: 'Hey! I\'m getting this weird infinite loop with useEffect. Can you help?',
      },
      {
        sessionId: sampleSession.id,
        role: 'ASSISTANT',
        content: 'I\'d be happy to help with that useEffect loop! That\'s a super common issue. Can you share your useEffect code so I can see what\'s happening?',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created sample session and messages');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
