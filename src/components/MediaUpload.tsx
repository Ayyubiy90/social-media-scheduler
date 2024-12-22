import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Film, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      
      // Create preview URL and determine file type
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setFileType(file.type.startsWith('image/') ? 'image' : 'video');
    }
  }, [onFileSelect]);

  const clearMedia = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileType(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov']
    },
    multiple: false
  });

  return (
    <div className="w-full">
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
          cursor-pointer group
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
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
                MP4, MOV
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;
