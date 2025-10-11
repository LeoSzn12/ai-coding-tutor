
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Video, ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Platform to language mapping for auto-detection
const platformLanguageMap: Record<string, string> = {
  'replit': 'javascript',
  'cursor': 'javascript',
  'windsurf': 'javascript',
  'vscode': 'javascript',
  'claude': 'any',
  'terminal': 'any',
  'browser': 'javascript',
};

export default function NewSessionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    programmingLanguage: 'javascript', // Default for non-technical users
    platform: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Auto-detect language based on platform selection
  useEffect(() => {
    if (formData.platform && platformLanguageMap[formData.platform]) {
      const suggestedLanguage = platformLanguageMap[formData.platform];
      if (suggestedLanguage !== 'any') {
        handleChange('programmingLanguage', suggestedLanguage);
      }
    }
  }, [formData.platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/session/${session.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">Start New Session</h1>
            <p className="text-gray-600 mt-2">
              Let's get you unstuck with your code! Tell me about what you're working on.
            </p>
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
                    placeholder="e.g., Building a website, Making a game, Creating an app"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Where are you coding? 💻</Label>
                  <Select onValueChange={(value) => handleChange('platform', value)} value={formData.platform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your coding platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replit">Replit</SelectItem>
                      <SelectItem value="cursor">Cursor</SelectItem>
                      <SelectItem value="windsurf">Windsurf</SelectItem>
                      <SelectItem value="claude">Claude.ai</SelectItem>
                      <SelectItem value="vscode">VS Code</SelectItem>
                      <SelectItem value="terminal">Terminal / Command Line</SelectItem>
                      <SelectItem value="browser">Browser Console</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    This helps us understand your coding environment better
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="programmingLanguage">Programming Language</Label>
                    <button
                      type="button"
                      onClick={() => setShowLanguageHelp(!showLanguageHelp)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Info className="h-3 w-3" />
                      Not sure?
                    </button>
                  </div>
                  <Select 
                    onValueChange={(value) => handleChange('programmingLanguage', value)} 
                    value={formData.programmingLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="JavaScript (Most common)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript (Most common)</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="html-css">HTML/CSS</SelectItem>
                      <SelectItem value="nodejs">Node.js</SelectItem>
                      <SelectItem value="other">Not sure / Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {showLanguageHelp && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-blue-700">
                      <p className="font-medium mb-1">Quick Guide:</p>
                      <ul className="space-y-0.5">
                        <li>• Building websites? → <span className="font-medium">JavaScript</span></li>
                        <li>• Using Replit for a web project? → <span className="font-medium">JavaScript</span></li>
                        <li>• Data analysis or AI? → <span className="font-medium">Python</span></li>
                        <li>• Styling a webpage? → <span className="font-medium">HTML/CSS</span></li>
                        <li>• Not sure? Choose <span className="font-medium">JavaScript</span> (we'll figure it out together!)</li>
                      </ul>
                    </div>
                  )}
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
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Start Demo Session
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
