import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  getMetadata,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from '../firebase/firebase';

export interface UploadResult {
  url: string;
  path: string;
  metadata: {
    size: number;
    contentType: string;
    timeCreated: string;
  };
}

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  timeCreated: string;
  path: string;
}

class StorageService {
  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    file: File, 
    path: string, 
    options?: {
      metadata?: Record<string, string>;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    try {
      // Create a reference to the file location
      const storageRef = ref(storage, path);
      
      // Create metadata
      const metadata = {
        contentType: file.type,
        customMetadata: options?.metadata || {}
      };

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get file metadata
      const fileMetadata = await getMetadata(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        metadata: {
          size: fileMetadata.size,
          contentType: fileMetadata.contentType,
          timeCreated: fileMetadata.timeCreated
        }
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload a profile picture with automatic path generation
   */
  async uploadProfilePicture(
    file: File, 
    userId: string,
    options?: {
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `profile_${timestamp}.${fileExtension}`;
    const path = `profile-pictures/${userId}/${fileName}`;
    
    return this.uploadFile(file, path, {
      metadata: {
        userId,
        type: 'profile-picture',
        originalName: file.name
      },
      onProgress: options?.onProgress
    });
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string): Promise<StorageFile[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files: StorageFile[] = [];
      
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          
          files.push({
            name: itemRef.name,
            url,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            path: itemRef.fullPath
          });
        } catch (error) {
          console.warn(`Failed to get metadata for ${itemRef.name}:`, error);
        }
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage usage for a user
   */
  async getUserStorageUsage(userId: string): Promise<{ bytesUsed: number; fileCount: number }> {
    try {
      const userFiles = await this.listFiles(`profile-pictures/${userId}`);
      
      const bytesUsed = userFiles.reduce((total, file) => total + file.size, 0);
      const fileCount = userFiles.length;
      
      return { bytesUsed, fileCount };
    } catch (error) {
      console.error('Error getting user storage usage:', error);
      return { bytesUsed: 0, fileCount: 0 };
    }
  }

  /**
   * Clean up old profile pictures (keep only the latest 3)
   */
  async cleanupOldProfilePictures(userId: string): Promise<void> {
    try {
      const userFiles = await this.listFiles(`profile-pictures/${userId}`);
      
      // Sort by creation time (newest first)
      const sortedFiles = userFiles.sort((a, b) => 
        new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
      );
      
      // Keep only the latest 3 files
      const filesToDelete = sortedFiles.slice(3);
      
      for (const file of filesToDelete) {
        try {
          await this.deleteFile(file.path);
        } catch (error) {
          console.warn(`Failed to delete old profile picture ${file.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old profile pictures:', error);
    }
  }
}

export const storageService = new StorageService();
export default storageService;