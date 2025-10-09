import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import ProfilePicture from './ProfilePicture';
import { storageService } from '../../services/storageService';

interface ProfilePictureUploadProps {
  currentPhotoURL?: string;
  onPhotoChange: (photoURL: string | null) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  userId?: string; // Required for Firebase Storage upload
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPhotoURL,
  onPhotoChange,
  size = 'lg',
  className = '',
  disabled = false,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    // Check if userId is provided for Firebase Storage
    if (!userId) {
      alert('User ID is required for profile picture upload');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL for immediate display
      const preview = URL.createObjectURL(file);
      setPreviewURL(preview);

      // Upload to Firebase Storage
      const uploadResult = await storageService.uploadProfilePicture(file, userId, {
        onProgress: (progress) => {
          // You could add a progress bar here if needed
          console.log(`Upload progress: ${progress}%`);
        }
      });

      // Clean up old profile pictures (keep only latest 3)
      await storageService.cleanupOldProfilePictures(userId);

      // Use the Firebase Storage URL
      onPhotoChange(uploadResult.url);
      
      // Clean up preview URL since we now have the real URL
      URL.revokeObjectURL(preview);
      setPreviewURL(null);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPreviewURL(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewURL(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayPhotoURL = previewURL || currentPhotoURL;

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`relative cursor-pointer group ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={handleClick}
      >
        <ProfilePicture 
          src={displayPhotoURL}
          alt="Profile"
          size={size}
          className="transition-all duration-200 group-hover:opacity-80"
        />
        
        {/* Upload overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        )}

        {/* Remove button */}
        {displayPhotoURL && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePhoto();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Remove photo"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload instructions */}
      {!displayPhotoURL && !disabled && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Click to upload photo
          </p>
          <p className="text-xs text-gray-400">
            Max 5MB, JPG/PNG
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
