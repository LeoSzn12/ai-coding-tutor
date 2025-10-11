
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Code, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface CodeAnalyzerProps {
  sessionId: string;
  programmingLanguage?: string | null;
}

export function CodeAnalyzer({ sessionId, programmingLanguage }: CodeAnalyzerProps) {
  const [codeInput, setCodeInput] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.js', '.ts', '.py', '.html', '.css', '.json'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/x-python': ['.py'],
      'text/html': ['.html'],
      'text/css': ['.css'],
      'application/json': ['.json'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const analyzeCode = async () => {
    if (!codeInput.trim() && uploadedFiles.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('code', codeInput);
      formData.append('language', programmingLanguage || 'unknown');
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = '';

        while (true) {
          const { done, value } = await reader?.read() ?? { done: true, value: undefined };
          if (done) break;

          const chunk = decoder.decode(value);
          result += chunk;
        }

        try {
          const analysisResult = JSON.parse(result);
          setAnalysis(analysisResult);
        } catch {
          setAnalysis({ error: 'Failed to parse analysis result' });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis({ error: 'Failed to analyze code' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-purple-600" />
          <span>Code Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <Label>Upload Code Files</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-1">Drag & drop code files here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: .js, .ts, .py, .html, .css, .json, .txt (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({uploadedFiles.length})</Label>
              <AnimatePresence>
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      ×
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="codeInput">Paste Code Here</Label>
          <Textarea
            id="codeInput"
            placeholder="Paste your code here for analysis..."
            className="min-h-[150px] font-mono text-sm"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzeCode}
          disabled={isAnalyzing || (!codeInput.trim() && uploadedFiles.length === 0)}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Code...
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-2" />
              Analyze Code
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <Label>Analysis Results</Label>
            
            {analysis.error ? (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{analysis.error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {analysis.issues?.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Issues Found ({analysis.issues.length})
                    </h4>
                    <ul className="space-y-2">
                      {analysis.issues.map((issue: any, index: number) => (
                        <li key={index} className="text-sm text-yellow-700">
                          • {issue.description}
                          {issue.line && <span className="ml-1 text-yellow-600">(Line {issue.line})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggestions?.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Suggestions ({analysis.suggestions.length})
                    </h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion: any, index: number) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {suggestion.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.summary && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                    <p className="text-sm text-gray-700">{analysis.summary}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </>
  );
}
