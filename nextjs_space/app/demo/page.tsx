
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Video, ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    programmingLanguage: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create anonymous session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          anonymous: true,
        }),
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/session/${session.id}`);
      }
    } catch (error) {
      console.error('Error creating demo session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Try Anonymous Session</h1>
            <p className="text-gray-600 mt-2">
              Test our AI coding tutor without creating an account. Your session won't be saved.
            </p>
          </div>

          {/* Demo Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">Demo Session</h3>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• This is an anonymous session - no signup required</li>
              <li>• Session data won't be saved after you close it</li>
              <li>• Full video, screen sharing, and AI features available</li>
              <li>• Create an account to save your progress and history</li>
            </ul>
          </div>

          {/* Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-blue-600" />
                <span>Demo Session Setup</span>
              </CardTitle>
              <CardDescription>
                Tell us about your coding challenge to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">What are you working on?</Label>
                  <Input
                    id="title"
                    placeholder="e.g., React Hook Error, Python API Setup, JavaScript Function Bug"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programmingLanguage">Programming Language</Label>
                  <Select onValueChange={(value) => handleChange('programmingLanguage', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your programming language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="nodejs">Node.js</SelectItem>
                      <SelectItem value="html-css">HTML/CSS</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Describe your problem (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell me more about the error or challenge you're facing..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Demo Features Include:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Real-time video call and screen sharing</li>
                    <li>• AI code analysis and error detection</li>
                    <li>• File upload and code review</li>
                    <li>• Friendly tutoring in plain English</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting Demo...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Start Demo Session
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Want to save your progress?
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/auth/signup">Create Free Account</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
