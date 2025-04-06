import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FileUploader } from './components/FileUploader';
import { ConfigurationForm } from './components/ConfigurationForm';
import { DownloadHandler } from './components/DownloadHandler';
import { Shield } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import type { FileUploadConfig, UploadedFile } from './types';

// In-memory storage for demo purposes
// In a real application, this would be a database
export const fileStorage = new Map<string, { file: File; config: FileUploadConfig }>();

// Base URL for the application
// In development, this will be localhost
// In production, this will be the Vercel deployment URL
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5174';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<FileUploadConfig>({
    expirationTime: 60, // 1 hour default
    maxDownloads: 1,
    maxFileSize: 100 * 1024 * 1024, // 100MB
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setGeneratedLink(null); // Reset link when new file is selected
  };

  const handleConfigChange = (newConfig: FileUploadConfig) => {
    setConfig(newConfig);
  };

  const handleGenerateLink = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      // Generate a unique token
      const token = Math.random().toString(36).substring(2);
      
      // Store the file and config
      fileStorage.set(token, { file: selectedFile, config });
      
      // Generate the download link using the base URL
      const downloadLink = `${BASE_URL}/download/${token}`;
      setGeneratedLink(downloadLink);
      
      toast.success('Secure download link generated successfully!');
    } catch (error) {
      toast.error('Failed to generate secure download link');
      console.error('Error generating link:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                  Secure Download Link Generator
                </Link>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Left Column - File Upload */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
                      <FileUploader
                        onFileSelect={handleFileSelect}
                        maxSize={config.maxFileSize}
                      />
                      {selectedFile && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            Selected file: <span className="font-medium">{selectedFile.name}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Configuration */}
                  <div className="space-y-6">
                    <ConfigurationForm
                      config={config}
                      onChange={handleConfigChange}
                    />
                    
                    <button
                      onClick={handleGenerateLink}
                      className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedFile}
                    >
                      Generate Secure Download Link
                    </button>

                    {generatedLink && (
                      <div className="mt-4 p-4 bg-green-50 rounded-md">
                        <p className="text-sm font-medium text-green-800">Generated Link:</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="flex-1 text-sm text-gray-600 bg-white p-2 rounded border border-gray-300"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedLink);
                              toast.success('Link copied to clipboard!');
                            }}
                            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </main>
            }
          />
          <Route
            path="/download/:token"
            element={<DownloadHandler token={fileStorage.get('token')?.file ? 'token' : ''} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;