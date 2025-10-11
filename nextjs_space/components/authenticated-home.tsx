
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Clock, Code, FileText, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthenticatedHomeProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  // Mock data - in real app this would come from API
  const recentSessions = [
    {
      id: '1',
      title: 'React Hook Error Debug',
      language: 'JavaScript',
      status: 'completed',
      date: '2 hours ago',
      duration: '15 min'
    },
    {
      id: '2', 
      title: 'Python Flask Setup Issues',
      language: 'Python',
      status: 'active',
      date: 'Now',
      duration: '5 min'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Code className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Coding Tutor</h1>
              <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => signOut()} variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick Start */}
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">Start New Session</CardTitle>
                <CardDescription className="text-blue-100">
                  Get help with your coding challenges right now
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button size="lg" variant="secondary" className="w-full" asChild>
                    <Link href="/session/new">
                      <Video className="h-5 w-5 mr-2" />
                      Video + Screen Share Session
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20" asChild>
                    <Link href="/session/quick">
                      <Plus className="h-5 w-5 mr-2" />
                      Quick Code Analysis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  Your coding sessions and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Code className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{session.language}</span>
                            <span>•</span>
                            <Clock className="h-4 w-4" />
                            <span>{session.duration}</span>
                            <span>•</span>
                            <span>{session.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Use <code className="bg-gray-100 px-2 py-1 rounded text-xs">console.log()</code> to debug 
                  your JavaScript variables before asking for help. It helps me understand your code flow better!
                </p>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sessions Completed</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Errors Resolved</span>
                  <Badge variant="secondary">34</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Languages Learned</span>
                  <Badge variant="secondary">2</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chrome Extension */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Chrome Extension</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">
                  Install our Chrome extension for seamless Replit integration
                </p>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/extension">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Extension
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
