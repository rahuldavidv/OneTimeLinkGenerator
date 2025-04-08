export interface FileUploadConfig {
  expirationTime: number; // in minutes
  maxDownloads: number;
  maxFileSize: number; // in bytes
}

export interface UploadedFile {
  file: File;
  config: FileUploadConfig;
  createdAt: Date;
  downloadCount: number;
}