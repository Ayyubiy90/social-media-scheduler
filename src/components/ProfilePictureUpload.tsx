import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ProfilePictureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function ProfilePictureUpload({
  isOpen,
  onClose,
  onUpload,
}: ProfilePictureUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        onClose();
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-25 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-auto md:right-4 md:w-96 z-50"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Upload Profile Picture
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center
                transition-all duration-200
                ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}>
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full rounded-xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black opacity-0 hover:opacity-10 transition-opacity duration-200" />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setError(null);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <label className="inline-flex items-center gap-1 px-3 py-2 cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        Choose a file
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleChange}
                          ref={fileInputRef}
                        />
                      </label>
                      {" or drag and drop"}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 
                  text-sm font-medium text-white rounded-lg 
                  transition-all duration-200
                  ${
                    selectedFile
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl"
                      : "bg-indigo-400 cursor-not-allowed"
                  }
                `}>
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
