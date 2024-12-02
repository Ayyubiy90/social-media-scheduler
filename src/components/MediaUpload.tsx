import React, { useState } from 'react';
import { Image, X } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (urls: string[]) => void;
  initialUrls?: string[];
}

export function MediaUpload({ onUpload, initialUrls = [] }: MediaUploadProps) {
  const [preview, setPreview] = useState<string[]>(initialUrls);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(file => URL.createObjectURL(file));
    const newUrls = [...preview, ...urls];
    setPreview(newUrls);
    onUpload(newUrls);
  };

  const removeImage = (index: number) => {
    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);
    onUpload(newPreview);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {preview.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="h-24 w-24 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">Choose files</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </label>
    </div>
  );
}