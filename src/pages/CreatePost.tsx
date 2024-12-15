import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../contexts/PostContext";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  FilePlus2,
  FileText,
  Share2,
  CalendarClock,
  X,
  AlertCircle,
  Send,
} from "lucide-react";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: (
      <svg
        className="w-5 h-5 text-[#E4405F]"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
    bgColor: "bg-[#E4405F]/10",
    hoverBgColor: "hover:bg-[#E4405F]/20",
    selectedBgColor: "bg-[#E4405F]/20",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: (
      <svg
        className="w-5 h-5 text-[#1877F2]"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
    bgColor: "bg-[#1877F2]/10",
    hoverBgColor: "hover:bg-[#1877F2]/20",
    selectedBgColor: "bg-[#1877F2]/20",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: (
      <svg
        className="w-5 h-5 text-[#1DA1F2]"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    bgColor: "bg-[#1DA1F2]/10",
    hoverBgColor: "hover:bg-[#1DA1F2]/20",
    selectedBgColor: "bg-[#1DA1F2]/20",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: (
      <svg
        className="w-5 h-5 text-[#0A66C2]"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    bgColor: "bg-[#0A66C2]/10",
    hoverBgColor: "hover:bg-[#0A66C2]/20",
    selectedBgColor: "bg-[#0A66C2]/20",
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
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <FilePlus2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create Post
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200">
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-8 transform transition-all duration-200 hover:shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Content Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Post Content
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white p-4 text-base transition-colors duration-200"
                  placeholder="What's on your mind?"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Select Platforms
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={`
                          flex items-center justify-center gap-3 px-4 py-3
                          rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${platform.bgColor}
                          ${isSelected ? platform.selectedBgColor : platform.hoverBgColor}
                          ${isSelected ? "ring-2 ring-offset-2 ring-gray-500 dark:ring-offset-gray-800" : ""}
                        `}>
                        {platform.icon}
                        <span>{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
                {Object.entries(validationErrors).map(([platform, error]) => (
                  <p
                    key={platform}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                ))}
              </div>

              {/* Schedule Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  Schedule Post (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white p-3 text-base transition-colors duration-200"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || selectedPlatforms.length === 0}
                  className={`
                    inline-flex items-center gap-2 px-8 py-3 
                    rounded-lg text-base font-medium text-white 
                    bg-indigo-600 hover:bg-indigo-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                    dark:focus:ring-offset-gray-800
                    transition-all duration-200
                    shadow-lg hover:shadow-xl
                    ${loading || selectedPlatforms.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  `}>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Create Post
                    </>
                  )}
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
