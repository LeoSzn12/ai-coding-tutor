
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

interface Props {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await getAuthSession();
    const formData = await request.formData();

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

    const code = formData.get('code') as string;
    const language = formData.get('language') as string;
    
    // Handle uploaded files
    const files: Array<{ name: string; content: string }> = [];
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith('file') && value instanceof File) {
        try {
          let content = '';
          
          if (value.type.includes('text') || value.name.match(/\.(js|ts|py|html|css|json|txt)$/i)) {
            // Read text files directly
            content = await value.text();
          } else {
            // For other files, upload to S3 and reference
            const buffer = Buffer.from(await value.arrayBuffer());
            const cloudPath = await uploadFile(buffer, value.name);
            content = `[File uploaded to cloud: ${cloudPath}]`;
          }
          
          files.push({
            name: value.name,
            content,
          });
        } catch (error) {
          console.error('Error processing file:', value.name, error);
          files.push({
            name: value.name,
            content: '[Error reading file]',
          });
        }
      }
    }

    // Prepare content for AI analysis
    let analysisContent = '';
    
    if (code?.trim()) {
      analysisContent += `Code to analyze (${language}):\n\n${code}\n\n`;
    }
    
    if (files.length > 0) {
      analysisContent += `Files uploaded:\n\n`;
      files.forEach(file => {
        analysisContent += `=== ${file.name} ===\n${file.content}\n\n`;
      });
    }

    if (!analysisContent.trim()) {
      return NextResponse.json({ error: 'No code or files provided for analysis' }, { status: 400 });
    }

    // AI Analysis prompt
    const systemPrompt = {
      role: 'system',
      content: `You are an expert code analyzer and tutor. Analyze the provided code and files for:

1. Syntax errors and bugs
2. Logic issues and potential runtime errors  
3. Performance concerns
4. Security vulnerabilities
5. Code style and best practices
6. Suggestions for improvement

Provide analysis in a friendly, educational manner. Focus on helping the developer learn and improve.

Programming Language Context: ${language}
Session Context: ${tutorSession.title}

Return your analysis as a JSON object with this structure:
{
  "summary": "Brief overall assessment",
  "issues": [
    {
      "type": "error|warning|suggestion", 
      "description": "Clear explanation of the issue",
      "line": 123,
      "severity": "high|medium|low"
    }
  ],
  "suggestions": [
    {
      "description": "Specific improvement suggestion",
      "priority": "high|medium|low"
    }
  ],
  "learningTips": [
    "Educational tip or best practice"
  ]
}

Respond with raw JSON only.`,
    };

    // Call AI for analysis
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          systemPrompt,
          {
            role: 'user',
            content: analysisContent,
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // Save code change record if analysis was successful
    if (code?.trim() || files.length > 0) {
      await prisma.codeChange.create({
        data: {
          sessionId: params.id,
          filePath: files.length > 0 ? files.map(f => f.name).join(', ') : 'Inline Code',
          description: `Code analysis: ${analysisResult.summary?.substring(0, 100) || 'Analysis completed'}`,
          beforeCode: code || null,
          diff: JSON.stringify(analysisResult),
          isApplied: false,
        },
      });
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Error in code analysis:', error);
    return NextResponse.json({ 
      error: 'Analysis failed', 
      issues: [{ 
        type: 'error', 
        description: 'Failed to analyze code. Please try again.', 
        severity: 'high' 
      }] 
    }, { status: 500 });
  }
}
