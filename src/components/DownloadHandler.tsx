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

        // Check if file has expired
        const createdAt = new Date(fileData.createdAt);
        const expirationTime = fileData.config.expirationTime * 60 * 1000; // Convert minutes to milliseconds
        const isExpired = Date.now() - createdAt.getTime() > expirationTime;

        if (isExpired) {
          setError('Download link has expired');
          toast.error('Download link has expired');
          navigate('/');
          return;
        }

        // Check if max downloads reached
        if (fileData.downloadCount >= fileData.config.maxDownloads) {
          setError('Maximum downloads reached');
          toast.error('Maximum downloads reached');
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

        // Trigger download
        window.location.href = downloadUrl;
        
        // Navigate back to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Failed to download file');
        toast.error('Failed to download file');
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
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}; 