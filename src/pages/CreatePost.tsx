import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../contexts/PostContext";
import { ThemeToggle } from "../components/ThemeToggle";

const PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter",
    icon: "twitter",
    color: "#1DA1F2",
    hoverColor: "#1a91da",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    color: "#1877F2",
    hoverColor: "#166fe5",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    color: "#0A66C2",
    hoverColor: "#0959ab",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "#E4405F",
    hoverColor: "#d63850",
  },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost, validateContent, loading, error } = usePost();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForPlatforms = () => {
    const errors: Record<string, string> = {};
    selectedPlatforms.forEach((platform) => {
      const validation = validateContent(content, platform);
      if (!validation.valid && validation.message) {
        errors[platform] = validation.message;
      }
    });
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForPlatforms();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await createPost(
        content,
        selectedPlatforms,
        scheduledFor ? new Date(scheduledFor) : undefined
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[platformId];
      return newErrors;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-5 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create Post
              </h1>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                  Cancel
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Post Content
                </label>
                <div className="mt-1">
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white p-4 resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`
                                                w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 
                                                border rounded-md shadow-sm text-sm font-medium 
                                                transition-colors duration-200
                                                ${
                                                  selectedPlatforms.includes(
                                                    platform.id
                                                  )
                                                    ? `bg-${platform.color} text-white hover:bg-${platform.hoverColor}`
                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                                }
                                            `}>
                      <i
                        className={`fab fa-${platform.icon} text-lg`}
                        style={{
                          color: selectedPlatforms.includes(platform.id)
                            ? "white"
                            : platform.color,
                        }}></i>
                      <span>{platform.name}</span>
                    </button>
                  ))}
                </div>
                {Object.entries(validationErrors).map(([platform, error]) => (
                  <p
                    key={platform}
                    className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ))}
              </div>

              {/* Schedule Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule Post (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white p-2"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || selectedPlatforms.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800">
                  {loading ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
