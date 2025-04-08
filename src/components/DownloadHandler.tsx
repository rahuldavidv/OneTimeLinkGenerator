import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFile, incrementDownloadCount, getDownloadUrl } from '../lib/storage';

export const DownloadHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleDownload = async () => {
      if (!token) {
        toast.error('Invalid download token');
        navigate('/');
        return;
      }

      try {
        console.log('Starting download process for token:', token);
        
        // Get file metadata
        const fileData = await getFile(token);
        
        if (!fileData) {
          console.error('No file data found for token:', token);
          toast.error('Invalid or expired download link');
          navigate('/');
          return;
        }

        console.log('File metadata retrieved:', fileData);

        // Get download URL
        const downloadUrl = await getDownloadUrl(token, fileData.fileName);
        
        if (!downloadUrl) {
          console.error('Failed to generate download URL for token:', token);
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
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success('File downloaded successfully!');
        navigate('/');
      } catch (error) {
        console.error('Error downloading file:', error);
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

  return null;
}; 