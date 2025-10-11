
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Props {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await getAuthSession();
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

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

    // Save user message
    await prisma.message.create({
      data: {
        sessionId: params.id,
        role: 'USER',
        content: message,
      },
    });

    // Get recent messages for context
    const recentMessages = await prisma.message.findMany({
      where: {
        sessionId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Prepare messages for AI
    const aiMessages = recentMessages.reverse().map(msg => ({
      role: msg.role.toLowerCase() === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Add system prompt for AI tutor personality
    const systemPrompt = {
      role: 'system',
      content: `You are a friendly, encouraging AI coding tutor. Your goal is to help developers get unstuck from their coding challenges in a warm, supportive way. 

Key personality traits:
- Act like their "best friend software engineer" - warm, patient, and encouraging
- Explain things in plain English without jargon
- Always be positive and supportive, especially when users are frustrated
- Focus on teaching and explaining, not just giving answers
- Ask clarifying questions when needed
- Celebrate small wins and progress

Programming context:
- Current session language: ${tutorSession.programmingLanguage || 'Unknown'}
- Session topic: ${tutorSession.title}
- Description: ${tutorSession.description || 'No description provided'}

When helping with code:
1. First acknowledge their problem with empathy
2. Explain what's happening in simple terms
3. Provide clear, step-by-step solutions
4. Offer to explain any concepts they might not understand
5. Suggest best practices and preventive measures

Always end responses by asking if they need clarification or have follow-up questions.`,
    };

    // Stream response from AI
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [systemPrompt, ...aiMessages],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    // Create streaming response
    let fullResponse = '';
    let messageId = `msg-${Date.now()}`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        // Send message start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'message_start',
          id: messageId
        })}\n\n`));

        try {
          while (true) {
            const { done, value } = await reader?.read() ?? { done: true, value: undefined };
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save assistant message to database
                  await prisma.message.create({
                    data: {
                      id: messageId,
                      sessionId: params.id,
                      role: 'ASSISTANT',
                      content: fullResponse,
                    },
                  });
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'content_delta',
                      delta: content
                    })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
