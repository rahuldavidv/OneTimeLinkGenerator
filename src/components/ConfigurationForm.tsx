import React from 'react';
import { Clock, Shield, Download } from 'lucide-react';
import type { FileUploadConfig } from '../types';

interface ConfigurationFormProps {
  config: FileUploadConfig;
  onChange: (config: FileUploadConfig) => void;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ config, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...config,
      [name]: name === 'ipRestriction' ? value : Number(value),
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Expiration Time (minutes)
            </label>
            <input
              type="number"
              name="expirationTime"
              value={config.expirationTime}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Download className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Maximum Downloads
            </label>
            <input
              type="number"
              name="maxDownloads"
              value={config.maxDownloads}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Shield className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              IP Restriction (optional)
            </label>
            <input
              type="text"
              name="ipRestriction"
              value={config.ipRestriction || ''}
              onChange={handleChange}
              placeholder="e.g., 192.168.1.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};