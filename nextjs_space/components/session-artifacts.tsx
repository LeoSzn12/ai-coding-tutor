
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  MessageSquare, 
  Code, 
  Bookmark, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface CodeChange {
  id: string;
  filePath: string;
  description?: string | null;
  isApplied: boolean;
  createdAt: Date;
}

interface Checkpoint {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
}

interface SessionArtifactsProps {
  messages: Message[];
  codeChanges: CodeChange[];
  checkpoints: Checkpoint[];
}

type TabType = 'transcript' | 'changes' | 'checkpoints';

export function SessionArtifacts({ messages, codeChanges, checkpoints }: SessionArtifactsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transcript');

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: MessageSquare, count: messages?.length || 0 },
    { id: 'changes', label: 'Code Changes', icon: Code, count: codeChanges?.length || 0 },
    { id: 'checkpoints', label: 'Checkpoints', icon: Bookmark, count: checkpoints?.length || 0 },
  ];

  const downloadTranscript = () => {
    const transcript = messages?.map(msg => 
      `[${new Date(msg.createdAt).toLocaleTimeString()}] ${msg.role}: ${msg.content}`
    ).join('\n\n') || '';
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>Session History</span>
          </div>
          <Button variant="ghost" size="sm" onClick={downloadTranscript}>
            <Download className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Tab Navigation */}
        <div className="px-4 pb-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as TabType)}
                className="flex-1"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tab Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start chatting to see the transcript here</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start space-x-3 ${
                        message.role === 'USER' ? 'justify-start' : 'justify-start'
                      }`}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        message.role === 'USER' 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                      }`}>
                        {message.role === 'USER' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-medium text-sm ${
                            message.role === 'USER' ? 'text-blue-700' : 'text-green-700'
                          }`}>
                            {message.role === 'USER' ? 'You' : 'AI Tutor'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'changes' && (
              <div className="space-y-3">
                {!codeChanges || codeChanges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No code changes yet</p>
                    <p className="text-sm">Code modifications will appear here</p>
                  </div>
                ) : (
                  codeChanges.map((change, index) => (
                    <motion.div
                      key={change.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-sm">{change.filePath}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {change.isApplied ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Applied
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      {change.description && (
                        <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(change.createdAt).toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'checkpoints' && (
              <div className="space-y-3">
                {!checkpoints || checkpoints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No checkpoints yet</p>
                    <p className="text-sm">Session milestones will appear here</p>
                  </div>
                ) : (
                  checkpoints.map((checkpoint, index) => (
                    <motion.div
                      key={checkpoint.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Bookmark className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{checkpoint.name}</span>
                      </div>
                      {checkpoint.description && (
                        <p className="text-sm text-gray-600 mb-2">{checkpoint.description}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(checkpoint.createdAt).toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
