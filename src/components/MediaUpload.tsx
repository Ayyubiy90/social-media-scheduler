import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Image as ImageIcon,
  Film,
  X,
  Loader2,
  Info,
} from "lucide-react";
import {
  validateMediaFile,
  compressImage,
  fileToBase64,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  PLATFORM_LIMITS,
} from "../utils/mediaUtils";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface MediaUploadProps {
  onFileSelect: (files: File[] | null) => void;
  selectedPlatforms: string[];
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileSelect,
  selectedPlatforms,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setTips([]);

    try {
      // Check platform-specific file count limits
      for (const platform of selectedPlatforms) {
        if (platform === "twitter" && files.length > 4) {
          setError("Twitter allows a maximum of 4 images per post");
          return;
        }
      }

      const processedFiles: MediaFile[] = [];
      const allTips: string[] = [];
      let hasError = false;

      // Process each file
      for (const file of files) {
        // Validate file for each selected platform
        for (const platform of selectedPlatforms) {
          const validation = validateMediaFile(file, platform);
          if (!validation.isValid) {
            setError(`${file.name}: ${validation.error}`);
            if (validation.tips) {
              allTips.push(...validation.tips);
            }
            hasError = true;
            break;
          }
          if (validation.tips) {
            allTips.push(...validation.tips);
          }
        }

        if (hasError) break;

        let processedFile = file;
        let fileType: "image" | "video";

        // Process images and videos
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
          try {
            const platform = selectedPlatforms[0];
            processedFile = await compressImage(file, platform);
            fileType = "image";
          } catch (err) {
            console.error(`Error processing image ${file.name}:`, err);
            setError(`Failed to process image ${file.name}`);
            hasError = true;
            break;
          }
        } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
          fileType = "video";
        } else {
          continue; // Skip unsupported file types
        }

        try {
          const preview = await fileToBase64(processedFile);
          processedFiles.push({
            file: processedFile,
            preview,
            type: fileType,
          });
        } catch (err) {
          console.error(`Error generating preview for ${file.name}:`, err);
          setError(`Failed to generate preview for ${file.name}`);
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        // Combine new files with existing ones
        const updatedFiles = [...mediaFiles, ...processedFiles];
        setMediaFiles(updatedFiles);
        setTips([...new Set(allTips)]);
        onFileSelect(updatedFiles.map((pf) => pf.file));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process files");
      onFileSelect(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await processFiles(acceptedFiles);
      }
    },
    [selectedPlatforms]
  );

  const removeFile = useCallback(
    (index: number) => {
      setMediaFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        onFileSelect(newFiles.length > 0 ? newFiles.map((f) => f.file) : null);
        return newFiles;
      });
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: true,
    disabled: isProcessing,
  });

  const renderPlatformLimits = () => {
    if (selectedPlatforms.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
        {selectedPlatforms.map((platform) => {
          const limits =
            PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];
          if (!limits) return null;

          return (
            <div key={platform} className="flex flex-col gap-1">
              <span className="font-medium capitalize">{platform} Limits:</span>
              <span>
                Images:{" "}
                {typeof limits.image === "number"
                  ? `${Math.round(limits.image / (1024 * 1024))}MB`
                  : `JPEG: ${Math.round(
                      limits.image.jpeg / (1024 * 1024)
                    )}MB, PNG: ${Math.round(
                      limits.image.png / (1024 * 1024)
                    )}MB`}
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
          ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
              : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
          }
          min-h-[200px]
          ${isProcessing ? "cursor-wait" : "cursor-pointer"}
          group
        `}>
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Processing media...
            </span>
          </div>
        ) : mediaFiles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {mediaFiles.map((media, index) => (
              <div key={index} className="relative aspect-square group">
                {media.type === "image" ? (
                  <img
                    src={media.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={media.preview}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center p-4">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Add more media</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="mb-4">
              <div
                className={`
                p-4 rounded-full 
                ${
                  isDragActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                }
                dark:bg-gray-800 dark:text-gray-400
              `}>
                <Upload className="w-8 h-8" />
              </div>
            </div>
            <p
              className={`text-lg font-medium ${
                isDragActive
                  ? "text-indigo-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}>
              {isDragActive
                ? "Drop your files here"
                : "Drag & drop your media here"}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              or click to select files
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
