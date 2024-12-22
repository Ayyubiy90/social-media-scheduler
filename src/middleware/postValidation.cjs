const { PLATFORM_LIMITS } = require('../utils/mediaUtils.cjs');

const validatePostMedia = (req, res, next) => {
  const { media, platforms } = req.body;

  // If no media, continue
  if (!media) {
    return next();
  }

  try {
    // Validate media for each selected platform
    for (const platform of platforms) {
      const limits = PLATFORM_LIMITS[platform];
      if (!limits) {
        return res.status(400).json({ 
          error: `Invalid platform: ${platform}` 
        });
      }

      // Check if media is base64
      if (!media.startsWith('data:')) {
        return res.status(400).json({ 
          error: 'Invalid media format' 
        });
      }

      // Get file size from base64
      const base64Length = media.length - (media.indexOf(',') + 1);
      const fileSize = (base64Length * 3) / 4;

      // Get media type
      const mediaType = media.split(';')[0].split('/')[0];
      const fileType = media.split(';')[0].split('/')[1];

      if (mediaType === 'image') {
        const maxSize = typeof limits.image === 'number' 
          ? limits.image 
          : fileType === 'jpeg' ? limits.image.jpeg : limits.image.png;

        if (fileSize > maxSize) {
          return res.status(400).json({
            error: `Image size exceeds ${platform}'s limit of ${Math.round(maxSize / (1024 * 1024))}MB`
          });
        }

        if (!limits.imageTypes.includes(`image/${fileType}`)) {
          return res.status(400).json({
            error: `${platform} doesn't support ${fileType} images`
          });
        }
      } else if (mediaType === 'video') {
        if (fileSize > limits.video) {
          return res.status(400).json({
            error: `Video size exceeds ${platform}'s limit of ${Math.round(limits.video / (1024 * 1024))}MB`
          });
        }

        if (!limits.videoTypes.includes(`video/${fileType}`)) {
          return res.status(400).json({
            error: `${platform} doesn't support ${fileType} videos`
          });
        }
      } else {
        return res.status(400).json({
          error: 'Invalid media type. Only images and videos are supported.'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Media validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate media' 
    });
  }
};

module.exports = {
  validatePostMedia
};
