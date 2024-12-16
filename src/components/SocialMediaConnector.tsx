import React, { useState } from "react";
import { useSocialMedia } from "../contexts/SocialMediaContext";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Link2,
  Unlink,
  AlertCircle,
  X,
} from "lucide-react";

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    description: "Share updates, photos, and stories",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "#1DA1F2",
    description: "Post tweets and engage with followers",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    description: "Share professional updates and articles",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    description: "Share photos and stories",
  },
];

export const SocialMediaConnector: React.FC = () => {
  const {
    connectedAccounts,
    connectAccount,
    disconnectAccount,
    loading,
    error: contextError,
  } = useSocialMedia();

  const [error, setError] = useState<string | null>(contextError);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );

  const handleConnect = async (platform: string) => {
    try {
      setError(null);
      setConnectingPlatform(platform);
      await connectAccount(platform);
      setConnectingPlatform(null);
    } catch (err) {
      console.error(`Failed to connect ${platform}:`, err);
      setError(
        err instanceof Error ? err.message : `Failed to connect ${platform}`
      );
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      setError(null);
      setConnectingPlatform(platform);
      await disconnectAccount(platform);
      setConnectingPlatform(null);
    } catch (err) {
      console.error(`Failed to disconnect ${platform}:`, err);
      setError(
        err instanceof Error ? err.message : `Failed to disconnect ${platform}`
      );
      setConnectingPlatform(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Connected Accounts
        </h2>
        {error && (
          <button
            onClick={() => setError(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-grow">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectedAccounts.some(
            (account) => account.platform === platform.id && account.connected
          );
          const account = connectedAccounts.find(
            (acc) => acc.platform === platform.id
          );
          const isLoading = loading && connectingPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6" style={{ color: platform.color }} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {platform.name}
                    </h3>
                    {isConnected && account?.accountName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {account.accountName}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    isConnected
                      ? handleDisconnect(platform.id)
                      : handleConnect(platform.id)
                  }
                  disabled={isLoading}
                  className={`
                    inline-flex items-center px-4 py-2 border-2 rounded-md text-sm font-medium shadow-sm
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isConnected
                        ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:ring-red-500 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:border-gray-500"
                        : "border-transparent text-white hover:opacity-90 hover:scale-105 focus:ring-offset-2"
                    }
                    ${
                      !isConnected
                        ? `bg-[${platform.color}] focus:ring-[${platform.color}]`
                        : ""
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  style={
                    !isConnected
                      ? { backgroundColor: platform.color }
                      : undefined
                  }>
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-1.5"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isConnected ? "Disconnecting..." : "Connecting..."}
                    </div>
                  ) : isConnected ? (
                    <>
                      <Unlink className="w-4 h-4 mr-1.5" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-1.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {platform.description}
              </p>

              {isConnected && account?.profileUrl && (
                <a
                  href={account.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  View Profile
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
