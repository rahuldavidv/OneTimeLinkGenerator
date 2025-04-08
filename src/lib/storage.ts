import { supabase } from './supabase';
import type { FileUploadConfig } from '../types';

const BUCKET_NAME = 'secure-files';

interface StoredFile {
  token: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  config: FileUploadConfig;
  createdAt: string;
  downloadCount: number;
}

interface DatabaseFile {
  token: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  config: FileUploadConfig;
  created_at: string;
  download_count: number;
}

function mapDatabaseFileToStoredFile(dbFile: DatabaseFile): StoredFile {
  return {
    token: dbFile.token,
    fileName: dbFile.file_name,
    fileSize: dbFile.file_size,
    mimeType: dbFile.mime_type,
    config: dbFile.config,
    createdAt: dbFile.created_at,
    downloadCount: dbFile.download_count
  };
}

export async function storeFile(token: string, file: File, config: FileUploadConfig): Promise<void> {
  console.log('Starting file upload to Supabase:', {
    token,
    fileName: file.name,
    fileSize: file.size,
    bucketName: BUCKET_NAME
  });

  try {
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${token}/${file.name}`, file);

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData);

    // Store file metadata in Supabase Database
    const { error: dbError } = await supabase
      .from('files')
      .insert({
        token,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: uploadData.path,
        config: config,
        created_at: new Date().toISOString(),
        download_count: 0
      });

    if (dbError) {
      console.error('Error storing file metadata in Supabase Database:', dbError);
      // Clean up the uploaded file if metadata storage fails
      await supabase.storage.from(BUCKET_NAME).remove([`${token}/${file.name}`]);
      throw dbError;
    }

    console.log('File metadata stored successfully');
  } catch (error) {
    console.error('Error in storeFile:', error);
    throw error;
  }
}

export async function getFile(token: string): Promise<StoredFile | null> {
  console.log('Fetching file metadata for token:', token);

  try {
    // Get file metadata from database
    const { data: files, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('token', token)
      .single();

    if (dbError) {
      console.error('Error fetching file metadata from database:', {
        error: dbError,
        message: dbError.message,
        details: dbError.details
      });
      throw dbError;
    }

    if (!files) {
      console.log('No file found for token:', token);
      return null;
    }

    console.log('File metadata retrieved successfully:', {
      fileName: files.file_name,
      downloadCount: files.download_count,
      createdAt: files.created_at
    });

    // Check if file has expired
    const createdAt = new Date(files.created_at);
    const expirationTime = files.config.expirationTime * 60 * 1000; // Convert minutes to milliseconds
    if (Date.now() - createdAt.getTime() > expirationTime) {
      console.log('File has expired:', {
        token,
        createdAt: files.created_at,
        expirationTime: files.config.expirationTime
      });
      // Delete expired file and metadata
      await supabase.storage.from(BUCKET_NAME).remove([`${token}/${files.file_name}`]);
      await supabase.from('files').delete().eq('token', token);
      return null;
    }

    return {
      token: files.token,
      fileName: files.file_name,
      fileSize: files.file_size,
      mimeType: files.mime_type,
      config: files.config,
      createdAt: files.created_at,
      downloadCount: files.download_count
    };
  } catch (error) {
    console.error('Error in getFile:', error);
    return null;
  }
}

export async function incrementDownloadCount(token: string): Promise<void> {
  try {
    console.log('Incrementing download count for token:', token);
    
    // First get the current count
    const { data: currentData, error: fetchError } = await supabase
      .from('files')
      .select('download_count')
      .eq('token', token)
      .single();

    if (fetchError) {
      console.error('Error fetching current download count:', {
        error: fetchError,
        message: fetchError.message,
        details: fetchError.details
      });
      throw fetchError;
    }

    console.log('Current download count:', currentData?.download_count);

    // Then increment it
    const { error: updateError } = await supabase
      .from('files')
      .update({ download_count: (currentData?.download_count || 0) + 1 })
      .eq('token', token);

    if (updateError) {
      console.error('Error incrementing download count:', {
        error: updateError,
        message: updateError.message,
        details: updateError.details
      });
      throw updateError;
    }

    console.log('Download count incremented successfully');
  } catch (error) {
    console.error('Error in incrementDownloadCount:', error);
    throw error;
  }
}

export async function getDownloadUrl(token: string, fileName: string): Promise<string | null> {
  console.log('Generating download URL for:', { token, fileName });

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`${token}/${fileName}`, 3600); // URL expires in 1 hour

    if (error) {
      console.error('Error generating download URL:', error);
      return null;
    }

    if (!data?.signedUrl) {
      console.error('No signed URL generated');
      return null;
    }

    console.log('Download URL generated successfully');
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getDownloadUrl:', error);
    return null;
  }
}

export async function deleteFile(token: string): Promise<void> {
  console.log('Starting file deletion process for token:', token);

  try {
    // Get file metadata first
    const fileMetadata = await getFile(token);
    
    if (!fileMetadata) {
      console.log('No file found to delete for token:', token);
      return;
    }

    console.log('Found file to delete:', {
      fileName: fileMetadata.fileName,
      token: fileMetadata.token
    });

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${token}/${fileMetadata.fileName}`]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      throw storageError;
    }

    console.log('Successfully deleted file from storage');

    // Delete metadata from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('token', token);

    if (dbError) {
      console.error('Error deleting file metadata from database:', dbError);
      throw dbError;
    }

    console.log('Successfully deleted file metadata from database');
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
} 