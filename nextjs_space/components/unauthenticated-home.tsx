
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Video, Brain, Zap, Users, Shield } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function UnauthenticatedHome() {
  const features = [
    {
      icon: Video,
      title: "Real-time Video Calls",
      description: "Face-to-face coding sessions with screen sharing"
    },
    {
      icon: Brain,
      title: "AI Code Analysis",
      description: "Smart error detection and plain English explanations"
    },
    {
      icon: Zap,
      title: "One-click Fixes",
      description: "Apply suggested code changes instantly"
    },
    {
      icon: Users,
      title: "Beginner Friendly",
      description: "No jargon, just friendly guidance"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Coding Tutor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button onClick={() => signIn('google')} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your <span className="text-blue-600">Best Friend</span> Software Engineer
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get unstuck with your code using AI-powered tutoring sessions. 
            Real-time video calls, screen sharing, and personalized guidance in plain English.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" onClick={() => signIn()} className="bg-green-600 hover:bg-green-700">
              <Video className="h-5 w-5 mr-2" />
              Start Coding Session
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Try Anonymous Session</Link>
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-center text-white"
        >
          <h3 className="text-3xl font-bold mb-4">Ready to break out of error loops?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers getting unstuck with friendly AI guidance
          </p>
          <Button size="lg" variant="secondary" onClick={() => signIn()}>
            Get Started Free
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
