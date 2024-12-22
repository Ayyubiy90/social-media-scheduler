import imageCompression from "browser-image-compression";

interface ImageLimits {
  jpeg: number;
  png: number;
}

interface PlatformConfig {
  image: number | ImageLimits;
  video: number;
  recommendedImageSize?: number;
  imageTypes: string[];
  videoTypes: string[];
  tips?: string[];
}

type PlatformLimits = {
  [key in "instagram" | "facebook" | "twitter" | "linkedin"]: PlatformConfig;
};

// Platform-specific size limits (in bytes)
export const PLATFORM_LIMITS: PlatformLimits = {
  instagram: {
    image: 30 * 1024 * 1024, // 30MB
    video: 650 * 1024 * 1024, // 650MB
    recommendedImageSize: 100 * 1024, // 100KB (recommended for best quality)
    imageTypes: ["image/jpeg", "image/png"],
    videoTypes: ["video/mp4"],
    tips: [
      "Use PNG for images with text to avoid pixelation",
      "Compress images to around 100KB to prevent platform compression",
      "Avoid dragging to reposition images as it may reduce quality",
      "Recommended aspect ratios: 1:1 (square), 4:5 (portrait), 1.91:1 (landscape)",
    ],
  },
  facebook: {
    image: {
      jpeg: 45 * 1024 * 1024, // 45MB for JPEG
      png: 60 * 1024 * 1024, // 60MB for PNG
    },
    video: 10 * 1024 * 1024 * 1024, // 10GB (for 360 videos)
    recommendedImageSize: 100 * 1024, // 100KB (recommended for best quality)
    imageTypes: ["image/jpeg", "image/png"],
    videoTypes: ["video/mp4"],
    tips: [
      "Use PNG for images with text to maintain quality",
      "Compress images to around 100KB to prevent Facebook compression",
      "Avoid repositioning images after upload",
      "Recommended video aspect ratio: 16:9 to 9:16 for Feed",
    ],
  },
  twitter: {
    image: 5 * 1024 * 1024, // 5MB
    video: 512 * 1024 * 1024, // 512MB
    imageTypes: ["image/jpeg", "image/png", "image/gif"],
    videoTypes: ["video/mp4"],
    tips: [
      "GIF files are supported",
      "Maximum of 4 images per tweet",
      "Images will be compressed if they exceed size limits",
    ],
  },
  linkedin: {
    image: 8 * 1024 * 1024, // 8MB
    video: 5 * 1024 * 1024 * 1024, // 5GB
    imageTypes: ["image/jpeg", "image/png"],
    videoTypes: ["video/mp4"],
    tips: [
      "Professional images perform better",
      "Company logo should be visible",
      "Keep text minimal in images",
    ],
  },
};

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export interface MediaValidationResult {
  isValid: boolean;
  error?: string;
  tips?: string[];
}

const getMaxImageSize = (platform: string, fileType: string): number => {
  const limits = PLATFORM_LIMITS[platform as keyof PlatformLimits];
  if (!limits) return 0;

  if (typeof limits.image === "number") {
    return limits.image;
  }

  return fileType === "image/jpeg" ? limits.image.jpeg : limits.image.png;
};

export const validateMediaFile = (
  file: File,
  platform?: string
): MediaValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file selected" };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error:
        "Invalid file type. Only JPG, PNG, GIF, and MP4 files are allowed.",
    };
  }

  if (platform) {
    const limits = PLATFORM_LIMITS[platform as keyof PlatformLimits];
    if (limits) {
      if (isImage) {
        const maxSize = getMaxImageSize(platform, file.type);
        if (file.size > maxSize) {
          return {
            isValid: false,
            error: `File size exceeds ${platform}'s limit of ${Math.round(
              maxSize / (1024 * 1024)
            )}MB`,
            tips: limits.tips,
          };
        }
      } else if (isVideo && file.size > limits.video) {
        return {
          isValid: false,
          error: `File size exceeds ${platform}'s limit of ${Math.round(
            limits.video / (1024 * 1024)
          )}MB`,
          tips: limits.tips,
        };
      }

      return { isValid: true, tips: limits.tips };
    }
  }

  return { isValid: true };
};

export const compressImage = async (
  file: File,
  platform?: string,
  maxWidthOrHeight = 1920
): Promise<File> => {
  if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid image file");
  }

  try {
    const platformConfig = platform
      ? PLATFORM_LIMITS[platform as keyof PlatformLimits]
      : null;
    const targetSize = platformConfig?.recommendedImageSize || 100 * 1024; // Default to 100KB if no platform specified

    const options = {
      maxSizeMB: targetSize / (1024 * 1024), // Convert to MB
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 0.9,
    };

    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Failed to compress image");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const getMediaTips = (platform: string): string[] => {
  const platformConfig = PLATFORM_LIMITS[platform as keyof PlatformLimits];
  return platformConfig?.tips || [];
};
