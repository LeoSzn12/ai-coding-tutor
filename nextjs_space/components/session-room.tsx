
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  MessageSquare,
  Code,
  FileText,
  Send,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat-interface';
import { CodeAnalyzer } from '@/components/code-analyzer';
import { SessionArtifacts } from '@/components/session-artifacts';
import { LiveKitRoom } from '@/components/livekit-room';

interface SessionRoomProps {
  session: {
    id: string;
    title: string | null;
    description?: string | null;
    programmingLanguage?: string | null;
    roomName?: string | null;
    status: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: Date;
    }>;
    codeChanges: Array<{
      id: string;
      filePath: string;
      description?: string | null;
      isApplied: boolean;
      createdAt: Date;
    }>;
    checkpoints: Array<{
      id: string;
      name: string;
      description?: string | null;
      createdAt: Date;
    }>;
  };
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export function SessionRoom({ session, user }: SessionRoomProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'artifacts'>('chat');
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    // Get LiveKit token for this session
    const getToken = async () => {
      try {
        console.log('[SessionRoom] Fetching token for session:', session.id);
        const response = await fetch(`/api/sessions/${session.id}/token`);
        
        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error || `Failed to get token (${response.status})`;
          console.error('[SessionRoom] Token fetch failed:', errorMsg, errorData);
          setTokenError(errorMsg);
          return;
        }
        
        const data = await response.json();
        console.log('[SessionRoom] Token received successfully');
        setToken(data.token);
      } catch (error: any) {
        console.error('[SessionRoom] Error getting token:', error);
        setTokenError(error?.message || 'Network error while fetching token');
      }
    };

    getToken();
  }, [session.id]);

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, count: session.messages.length },
    { id: 'code', label: 'Code Analysis', icon: Code, count: null },
    { id: 'artifacts', label: 'Session History', icon: FileText, count: session.codeChanges.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.title || 'Coding Session'}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                {session.programmingLanguage && (
                  <Badge variant="secondary">{session.programmingLanguage}</Badge>
                )}
                <span>Session ID: {session.id}</span>
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Video Call Section */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span>Video Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {tokenError ? (
                  <div className="flex-1 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                    <div className="text-center p-8 max-w-md">
                      <div className="text-red-600 text-5xl mb-4">⚠️</div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Video Session Error
                      </h3>
                      <p className="text-red-700 mb-4">{tokenError}</p>
                      <div className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">
                        <strong>Debug info:</strong> Check browser console for details
                      </div>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Reload Page
                      </Button>
                    </div>
                  </div>
                ) : session.roomName && token ? (
                  <LiveKitRoom
                    roomName={session.roomName}
                    token={token}
                    onConnected={() => setIsConnected(true)}
                    onDisconnected={() => setIsConnected(false)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Connecting to video session...</p>
                      <p className="text-xs text-gray-400 mt-2">Getting LiveKit token...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Tabs */}
          <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex-1"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.count !== null && (
                    <Badge variant="secondary" className="ml-2 h-5 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <Card className="flex-1 flex flex-col">
              {activeTab === 'chat' && (
                <ChatInterface sessionId={session.id} initialMessages={session.messages} />
              )}
              {activeTab === 'code' && (
                <CodeAnalyzer sessionId={session.id} programmingLanguage={session.programmingLanguage} />
              )}
              {activeTab === 'artifacts' && (
                <SessionArtifacts 
                  messages={session.messages}
                  codeChanges={session.codeChanges}
                  checkpoints={session.checkpoints}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
