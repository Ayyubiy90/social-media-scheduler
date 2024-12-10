const PLATFORM_LIMITS = {
  twitter: {
    textLimit: 280,
    mediaLimit: 4,
    gifLimit: 1,
    videoLimit: 1,
    validMediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
  },
  facebook: {
    textLimit: 63206,
    mediaLimit: 10,
    videoLimit: 1,
    validMediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
  },
  linkedin: {
    textLimit: 3000,
    mediaLimit: 9,
    videoLimit: 1,
    validMediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
  },
};

function validatePostContent(content, platforms) {
  const errors = [];

  if (!content || !content.text || content.text.trim() === "") {
    errors.push("Post content cannot be empty");
    return errors;
  }

  // Validate for each selected platform
  platforms.forEach((platform) => {
    const limits = PLATFORM_LIMITS[platform];
    if (!limits) {
      errors.push(`Unsupported platform: ${platform}`);
      return;
    }

    // Text length validation
    if (content.text.length > limits.textLimit) {
      errors.push(
        `${platform}: Text exceeds ${limits.textLimit} characters limit`
      );
    }

    // Media validation
    if (content.media && content.media.length > 0) {
      // Media count validation
      if (content.media.length > limits.mediaLimit) {
        errors.push(
          `${platform}: Exceeds ${limits.mediaLimit} media items limit`
        );
      }

      // Media type validation
      content.media.forEach((media) => {
        if (!limits.validMediaTypes.includes(media.type)) {
          errors.push(`${platform}: Invalid media type ${media.type}`);
        }
      });

      // Video count validation
      const videoCount = content.media.filter(
        (m) => m.type === "video/mp4"
      ).length;
      if (videoCount > limits.videoLimit) {
        errors.push(`${platform}: Exceeds ${limits.videoLimit} video limit`);
      }

      // GIF validation for Twitter
      if (platform === "twitter") {
        const gifCount = content.media.filter(
          (m) => m.type === "image/gif"
        ).length;
        if (gifCount > limits.gifLimit) {
          errors.push("Twitter: Only 1 GIF allowed per tweet");
        }
      }
    }
  });

  return errors;
}

function validateScheduleTime(scheduledTime) {
  const errors = [];
  const now = new Date();
  const scheduleDate = new Date(scheduledTime);

  if (isNaN(scheduleDate.getTime())) {
    errors.push("Invalid schedule time format");
  } else if (scheduleDate < now) {
    errors.push("Schedule time cannot be in the past");
  }

  return errors;
}

function validatePostMiddleware(req, res, next) {
  const { content, platforms, scheduledTime } = req.body;
  const errors = [];

  // Validate content and platforms
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    errors.push("At least one platform must be selected");
  } else {
    const contentErrors = validatePostContent(content, platforms);
    errors.push(...contentErrors);
  }

  // Validate schedule time if provided
  if (scheduledTime) {
    const timeErrors = validateScheduleTime(scheduledTime);
    errors.push(...timeErrors);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = {
  validatePostMiddleware,
  validatePostContent,
  validateScheduleTime,
  PLATFORM_LIMITS,
};
