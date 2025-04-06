import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, maxSize = 100 * 1024 * 1024 }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > maxSize) {
        toast.error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return;
      }
      onFileSelect(file);
      toast.success('File selected successfully!');
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-gray-600">
        <Upload className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
        </p>
        <p className="text-sm text-gray-500">or click to select</p>
        <p className="text-xs text-gray-400 mt-2">Maximum file size: {maxSize / (1024 * 1024)}MB</p>
      </div>
    </div>
  );
};