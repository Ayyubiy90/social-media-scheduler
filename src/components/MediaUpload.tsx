import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Film, X, Loader2, Info } from 'lucide-react';
import { 
  validateMediaFile, 
  compressImage, 
  fileToBase64, 
  ALLOWED_IMAGE_TYPES, 
  ALLOWED_VIDEO_TYPES,
  PLATFORM_LIMITS,
  MediaValidationResult
} from '../utils/mediaUtils';

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedPlatforms: string[];
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onFileSelect, selectedPlatforms }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setTips([]);
    
    try {
      // Validate for each selected platform
      const allTips: string[] = [];
      for (const platform of selectedPlatforms) {
        const validation: MediaValidationResult = validateMediaFile(file, platform);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid file');
          if (validation.tips) {
            setTips(validation.tips);
          }
          onFileSelect(null);
          return;
        }
        // Collect tips from all platforms
        if (validation.tips) {
          allTips.push(...validation.tips);
        }
      }
      setTips([...new Set(allTips)]); // Remove duplicates

      let processedFile = file;
      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        // If multiple platforms selected, use the most restrictive settings
        const platform = selectedPlatforms[0]; // Use first platform's settings for compression
        processedFile = await compressImage(file, platform);
        setFileType('image');
      } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setFileType('video');
      }

      const previewUrl = await fileToBase64(processedFile);
      setPreview(previewUrl);
      onFileSelect(processedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setPreview(null);
      onFileSelect(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await processFile(acceptedFiles[0]);
    }
  }, [selectedPlatforms]);

  const clearMedia = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileType(null);
    setError(null);
    setTips([]);
    onFileSelect(null);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov']
    },
    multiple: false,
    disabled: isProcessing
  });

  const renderPlatformLimits = () => {
    if (selectedPlatforms.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
        {selectedPlatforms.map(platform => {
          const limits = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];
          if (!limits) return null;

          return (
            <div key={platform} className="flex flex-col gap-1">
              <span className="font-medium capitalize">{platform} Limits:</span>
              <span>
                Images: {typeof limits.image === 'number' 
                  ? `${Math.round(limits.image / (1024 * 1024))}MB` 
                  : `JPEG: ${Math.round(limits.image.jpeg / (1024 * 1024))}MB, PNG: ${Math.round(limits.image.png / (1024 * 1024))}MB`}
              </span>
              <span>Videos: {Math.round(limits.video / (1024 * 1024))}MB</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}

      {tips.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium mb-2">
            <Info className="w-4 h-4" />
            <span>Tips for best results:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-300 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }
          ${preview ? 'h-[300px]' : 'h-[200px]'}
          ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
          group
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Processing media...</span>
          </div>
        ) : preview ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {fileType === 'image' ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <video 
                src={preview}
                className="max-h-full max-w-full rounded-lg"
                controls
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={clearMedia}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <p className="text-white text-sm">
                  Click to replace or remove
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="mb-4">
              <div className={`
                p-4 rounded-full 
                ${isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}
                dark:bg-gray-800 dark:text-gray-400
              `}>
                <Upload className="w-8 h-8" />
              </div>
            </div>
            <p className={`text-lg font-medium ${
              isDragActive ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {isDragActive ? 'Drop your file here' : 'Drag & drop your media here'}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              or click to select a file
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                JPG, PNG, GIF
              </div>
              <div className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                MP4
              </div>
            </div>
            {renderPlatformLimits()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;
