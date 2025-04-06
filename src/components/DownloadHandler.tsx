import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Import the fileStorage from App.tsx
import { fileStorage } from '../App';

export const DownloadHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleDownload = async () => {
      if (!token) {
        setError('Invalid download token');
        return;
      }

      try {
        setIsDownloading(true);
        
        // Get the stored file data
        const storedData = fileStorage.get(token);
        if (!storedData) {
          setError('File not found or link has expired');
          return;
        }

        const { file, config } = storedData;

        // Check if the download limit has been reached
        if (config.maxDownloads <= 0) {
          setError('Maximum download limit reached');
          return;
        }

        // Update the download count
        config.maxDownloads--;

        // Create a blob from the file
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Download started!');
        
        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        setError('Failed to download file');
        toast.error('Failed to download file');
        console.error('Download error:', err);
      } finally {
        setIsDownloading(false);
      }
    };

    handleDownload();
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isDownloading ? 'Preparing download...' : 'Download complete!'}
        </h2>
        {isDownloading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}; 