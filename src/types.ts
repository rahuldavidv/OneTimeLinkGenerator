export interface FileUploadConfig {
  expirationTime: number; // in minutes
  maxDownloads: number;
  ipRestriction?: string;
  maxFileSize: number; // in bytes
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  downloadUrl: string;
  config: FileUploadConfig;
}