// Platform-specific size limits (in bytes)
const PLATFORM_LIMITS = {
  instagram: {
    image: 30 * 1024 * 1024, // 30MB
    video: 650 * 1024 * 1024, // 650MB
    imageTypes: ["image/jpeg", "image/png"],
    videoTypes: ["video/mp4"],
    recommendedImageSize: 100 * 1024, // 100KB for best quality
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
    imageTypes: ["image/jpeg", "image/png"],
    videoTypes: ["video/mp4"],
    recommendedImageSize: 100 * 1024, // 100KB for best quality
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
    recommendedImageSize: 100 * 1024, // 100KB for best quality
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
    recommendedImageSize: 100 * 1024, // 100KB for best quality
    tips: [
      "Professional images perform better",
      "Company logo should be visible",
      "Keep text minimal in images",
    ],
  },
};

// Helper function to get max size for a platform and file type
const getMaxSize = (platform, mediaType, fileType) => {
  const limits = PLATFORM_LIMITS[platform];
  if (!limits) return 0;

  if (mediaType === "image") {
    return typeof limits.image === "number"
      ? limits.image
      : fileType === "jpeg"
      ? limits.image.jpeg
      : limits.image.png;
  }

  return limits.video;
};

// Helper function to validate file type
const isValidFileType = (platform, mediaType, fileType) => {
  const limits = PLATFORM_LIMITS[platform];
  if (!limits) return false;

  const types = mediaType === "image" ? limits.imageTypes : limits.videoTypes;
  return types.includes(`${mediaType}/${fileType}`);
};

module.exports = {
  PLATFORM_LIMITS,
  getMaxSize,
  isValidFileType,
};
