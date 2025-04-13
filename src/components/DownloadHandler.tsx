import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFile, incrementDownloadCount, getDownloadUrl } from '../lib/storage';

export const DownloadHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleDownload = async () => {
      if (!token) {
        setError('Invalid download token');
        toast.error('Invalid download token');
        navigate('/');
        return;
      }

      try {
        console.log('Starting download process for token:', token);
        
        // Get file metadata
        const fileData = await getFile(token);
        
        if (!fileData) {
          setError('Invalid or expired download link');
          toast.error('Invalid or expired download link');
          navigate('/');
          return;
        }

        console.log('File metadata retrieved:', fileData);

        // Check if download limit has been reached
        if (fileData.downloadCount >= fileData.config.maxDownloads) {
          setError('Download limit reached');
          toast.error('Download limit reached');
          navigate('/');
          return;
        }

        // Get download URL
        const downloadUrl = await getDownloadUrl(token, fileData.fileName);
        
        if (!downloadUrl) {
          setError('Failed to generate download URL');
          toast.error('Failed to generate download URL');
          navigate('/');
          return;
        }

        console.log('Download URL generated:', downloadUrl);

        // Increment download count
        try {
          await incrementDownloadCount(token);
          console.log('Download count incremented for token:', token);
        } catch (error) {
          console.error('Error incrementing download count:', error);
          // Continue with download even if count update fails
        }

        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the blob URL
        if (downloadUrl.startsWith('blob:')) {
          URL.revokeObjectURL(downloadUrl);
        }

        toast.success('File downloaded successfully!');
        
        // Add a small delay before navigating away to ensure the download starts
        setTimeout(() => {
          navigate('/');
        }, 1000);

      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Failed to download file. Please try again.');
        toast.error('Failed to download file. Please try again.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    handleDownload();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your download...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error</div>
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

  return null;
}; 