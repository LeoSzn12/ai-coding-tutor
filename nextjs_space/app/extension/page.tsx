
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download,
  Chrome,
  Code,
  ArrowLeft,
  Settings,
  Zap,
  FileText,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ExtensionPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    // Create a blob with the extension files and download
    const manifestContent = JSON.stringify({
      "manifest_version": 3,
      "name": "AI Coding Tutor - Replit Integration",
      "version": "1.0.0",
      "description": "Seamlessly integrate with your Replit coding sessions for AI tutoring",
      "permissions": ["activeTab", "tabs", "storage"],
      "content_scripts": [
        {
          "matches": ["*://replit.com/*"],
          "js": ["content.js"]
        }
      ],
      "background": {
        "service_worker": "background.js"
      },
      "action": {
        "default_popup": "popup.html",
        "default_title": "AI Coding Tutor"
      },
      "icons": {
        "16": "icon16.png",
        "48": "icon48.png", 
        "128": "icon128.png"
      }
    }, null, 2);

    const contentScript = `
// AI Coding Tutor - Replit Content Script
console.log('AI Coding Tutor extension loaded on Replit');

// Function to extract code from Replit editor
function extractCode() {
  // Find Monaco editor instances
  const editors = document.querySelectorAll('.monaco-editor');
  const code = [];
  
  editors.forEach(editor => {
    const lines = editor.querySelectorAll('.view-line');
    const editorCode = Array.from(lines).map(line => line.textContent).join('\\n');
    if (editorCode.trim()) {
      code.push(editorCode);
    }
  });
  
  return code.join('\\n\\n');
}

// Function to extract console output
function extractConsole() {
  const consoleOutput = document.querySelector('.console-output');
  return consoleOutput ? consoleOutput.textContent : '';
}

// Function to get current file info
function getCurrentFile() {
  const fileTab = document.querySelector('.file-tree-item.selected');
  return fileTab ? fileTab.textContent.trim() : 'untitled';
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCodeContext') {
    sendResponse({
      code: extractCode(),
      console: extractConsole(),
      filename: getCurrentFile(),
      url: window.location.href
    });
  }
});

// Add visual indicator when extension is active
const indicator = document.createElement('div');
indicator.innerHTML = '🤖 AI Tutor Ready';
indicator.style.cssText = \`
  position: fixed;
  top: 10px;
  right: 10px;
  background: #059669;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
\`;
document.body.appendChild(indicator);

setTimeout(() => {
  indicator.remove();
}, 3000);
`;

    const backgroundScript = `
// AI Coding Tutor - Background Script
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('replit.com')) {
    // Open AI Tutor in new tab with context
    chrome.tabs.create({
      url: 'https://ai-coding-tutor.com/session/new?source=extension'
    });
  }
});
`;

    const popupHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 300px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #059669;
      margin-bottom: 4px;
    }
    .tagline {
      color: #666;
      font-size: 12px;
    }
    .button {
      display: block;
      width: 100%;
      padding: 12px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      margin-bottom: 12px;
    }
    .button:hover {
      background: #047857;
    }
    .status {
      padding: 8px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      font-size: 12px;
      color: #065f46;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🤖 AI Coding Tutor</div>
    <div class="tagline">Your best friend software engineer</div>
  </div>
  
  <a href="#" id="startSession" class="button">
    Start Coding Session
  </a>
  
  <div class="status" id="status">
    Ready to help with your Replit code!
  </div>

  <script src="popup.js"></script>
</body>
</html>
`;

    const popupScript = `
document.getElementById('startSession').addEventListener('click', (e) => {
  e.preventDefault();
  
  // Get current tab
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    
    if (currentTab.url.includes('replit.com')) {
      // Extract code context
      chrome.tabs.sendMessage(currentTab.id, {action: 'getCodeContext'}, (response) => {
        if (response) {
          // Open AI Tutor with context
          const params = new URLSearchParams({
            source: 'extension',
            code: response.code,
            filename: response.filename,
            console: response.console
          });
          
          chrome.tabs.create({
            url: \`https://localhost:3000/session/new?\${params.toString()}\`
          });
        }
      });
    } else {
      // Not on Replit
      document.getElementById('status').innerHTML = 'Please navigate to Replit.com first';
      document.getElementById('status').style.background = '#fef2f2';
      document.getElementById('status').style.borderColor = '#fecaca';
      document.getElementById('status').style.color = '#991b1b';
    }
  });
});
`;

    // Create ZIP-like download
    const files = [
      { name: 'manifest.json', content: manifestContent },
      { name: 'content.js', content: contentScript },
      { name: 'background.js', content: backgroundScript },
      { name: 'popup.html', content: popupHTML },
      { name: 'popup.js', content: popupScript },
      { name: 'README.txt', content: `AI Coding tutor Chrome Extension

Installation Instructions:
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the folder containing these files
4. Navigate to replit.com and start coding
5. Click the extension icon to start an AI tutoring session

Features:
- Automatically detects code in Replit editor
- Captures console output and errors
- Seamlessly connects to AI Coding Tutor web app
- Works with all programming languages supported by Replit

Support: Visit our website for more information and support.
` }
    ];

    // Create and download each file
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-tutor-extension-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const features = [
    {
      icon: Code,
      title: "Auto Code Detection",
      description: "Automatically captures code from your Replit editor"
    },
    {
      icon: FileText,
      title: "Console Output",
      description: "Grabs error messages and console logs for analysis"
    },
    {
      icon: Zap,
      title: "One-Click Sessions",
      description: "Start AI tutoring sessions directly from Replit"
    },
    {
      icon: Settings,
      title: "Seamless Integration",
      description: "Works with all Replit projects and languages"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Download Extension Files",
      description: "Click the download button to get all required files"
    },
    {
      number: "2", 
      title: "Install in Chrome",
      description: "Go to chrome://extensions/, enable Developer mode, and load unpacked"
    },
    {
      number: "3",
      title: "Use with Replit",
      description: "Navigate to Replit.com and click the extension icon when you need help"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chrome Extension</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate AI Coding Tutor with your Replit workflow. 
              Get help without leaving your coding environment.
            </p>
          </div>
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Chrome className="h-8 w-8" />
                <span>AI Coding Tutor Extension</span>
              </CardTitle>
              <CardDescription className="text-green-100">
                Free Chrome extension for Replit integration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-2">
                  Version 1.0.0
                </Badge>
                <p className="text-green-100">
                  Works with all Replit projects and programming languages
                </p>
              </div>
              
              <Button 
                size="lg" 
                onClick={handleDownload}
                className="bg-white text-green-700 hover:bg-gray-100"
              >
                <Download className="h-5 w-5 mr-2" />
                {downloadStarted ? 'Files Downloaded!' : 'Download Extension'}
              </Button>
              
              {downloadStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-700 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Files downloaded! Follow the installation steps below.
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Extension Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Installation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Installation Guide</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.2 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  {step.number === "2" && (
                    <div className="mt-2">
                      <Badge variant="outline" className="mr-2">chrome://extensions/</Badge>
                      <Badge variant="outline">Enable Developer mode</Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <Separator className="my-8" />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2" />
              Need Help?
            </h3>
            <p className="text-amber-700 mb-4">
              Having trouble installing the extension? We're here to help!
            </p>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• Make sure you have Chrome browser (version 88 or later)</p>
              <p>• Developer mode must be enabled in chrome://extensions/</p>
              <p>• Contact support if you encounter any issues</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
