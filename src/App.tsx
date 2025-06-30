import { Loader2, Play, Square, FileText, Code } from "lucide-react";
import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStreamingResponse } from "./hooks/useStreamingResponse";
import TypewriterText from "./components/TypewriterText";
import FadeIn from "./components/FadeIn";
import FigmaCodeGenerator from "./components/FigmaCodeGenerator";

// Type definitions based on your Zod schema
interface UserStory {
  description: string;
  acceptanceCriteria: string[];
  checklist: string[];
}

interface StreamedObject {
  userStory?: UserStory;
  imageUrl?: string;
}

interface FormData {
  prompt: string;
  userTier: "free" | "premium" | "enterprise";
  templateId: number;
}

const UserStoryGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    prompt: "create a dashboard",
    userTier: "free",
    templateId: 1,
  });

  // State for typewriter effect
  const [typewriterData, setTypewriterData] = useState<StreamedObject>({});
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [streamingState, streamingActions] = useStreamingResponse<StreamedObject>({
    url: "http://localhost:8080/api/genai/generate-user-story",
    method: "POST",
    credentials: "include",
    body: formData,
  });

  // Update typewriter data when streaming data changes
  React.useEffect(() => {
    console.log("Streaming state changed:", {
      isStreaming: streamingState.isStreaming,
      connectionStatus: streamingState.connectionStatus,
      dataKeys: Object.keys(streamingState.data),
      hasData,
    });

    if (streamingState.isStreaming) {
      // Reset data when starting new generation
      if (!hasData) {
        setTypewriterData({});
        setIsTypewriterActive(false);
      }
      setTypewriterData(streamingState.data);
      setIsTypewriterActive(true);
      if (Object.keys(streamingState.data).length > 0) {
        setHasData(true);
      }
    } else if (streamingState.connectionStatus === "completed") {
      console.log("Streaming completed, setting final data");
      setTypewriterData(streamingState.data);
      setIsTypewriterActive(false);
      if (Object.keys(streamingState.data).length > 0) {
        setHasData(true);
      }
    } else if (streamingState.connectionStatus === "idle" && !hasData) {
      // Reset when going back to idle state
      setTypewriterData({});
      setIsTypewriterActive(false);
      setHasData(false);
    }
  }, [streamingState.data, streamingState.isStreaming, streamingState.connectionStatus, hasData]);

  const getStatusColor = (): string => {
    switch (streamingState.connectionStatus) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      case "completed":
        return "text-blue-600";
      case "stopped":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  const renderUserStory = (userStory: UserStory): React.ReactElement => {
    return (
      <div className="space-y-4">
        {/* Description */}
        {userStory.description && (
          <FadeIn delay={100}>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">User Story:</h4>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                {isTypewriterActive ? (
                  <TypewriterText text={userStory.description} speed={150} isActive={isTypewriterActive} className="text-gray-800" />
                ) : (
                  <span className="text-gray-800">{userStory.description}</span>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Acceptance Criteria */}
        {userStory.acceptanceCriteria && userStory.acceptanceCriteria.length > 0 && (
          <FadeIn delay={200}>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Acceptance Criteria:</h4>
              <ul className="bg-green-50 p-3 rounded border-l-4 border-green-400 space-y-1">
                {userStory.acceptanceCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    {isTypewriterActive ? (
                      <TypewriterText text={criteria} speed={120} isActive={isTypewriterActive} className="text-gray-800" />
                    ) : (
                      <span className="text-gray-800">{criteria}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        )}

        {/* Checklist */}
        {userStory.checklist && userStory.checklist.length > 0 && (
          <FadeIn delay={300}>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Checklist:</h4>
              <ul className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 space-y-1">
                {userStory.checklist.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">□</span>
                    {isTypewriterActive ? (
                      <TypewriterText text={item} speed={120} isActive={isTypewriterActive} className="text-gray-800" />
                    ) : (
                      <span className="text-gray-800">{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        )}
      </div>
    );
  };

  const handleFormChange = (field: keyof FormData, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Story Generator</h2>

        {/* Form Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Configuration:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt:</label>
              <input
                type="text"
                value={formData.prompt}
                onChange={(e) => handleFormChange("prompt", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., create a dashboard"
                disabled={streamingState.isStreaming}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Tier:</label>
              <select
                value={formData.userTier}
                onChange={(e) => handleFormChange("userTier", e.target.value as FormData["userTier"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={streamingState.isStreaming}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template ID:</label>
              <input
                type="number"
                value={formData.templateId}
                onChange={(e) => handleFormChange("templateId", parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                disabled={streamingState.isStreaming}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={streamingActions.startStreaming}
            disabled={streamingState.isStreaming}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {streamingState.isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate User Story
              </>
            )}
          </button>

          {streamingState.isStreaming && (
            <button
              onClick={streamingActions.stopStreaming}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Generation
            </button>
          )}

          {hasData && !streamingState.isStreaming && (
            <button
              onClick={() => {
                setTypewriterData({});
                setIsTypewriterActive(false);
                setHasData(false);
                streamingActions.reset();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                streamingState.connectionStatus === "connected"
                  ? "bg-green-500"
                  : streamingState.connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : streamingState.connectionStatus === "error"
                  ? "bg-red-500"
                  : streamingState.connectionStatus === "completed"
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {streamingState.connectionStatus.charAt(0).toUpperCase() + streamingState.connectionStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {streamingState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <strong>Error:</strong> {streamingState.error}
          </div>
        )}
      </div>

      {/* Generated User Story Display */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated User Story:</h3>

        {!hasData ? (
          <div className="text-gray-500 italic bg-white rounded border p-4">
            {streamingState.isStreaming ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span>Generating user story...</span>
              </div>
            ) : (
              'No user story generated yet. Configure settings above and click "Generate User Story".'
            )}
          </div>
        ) : (
          <div className="bg-white rounded border p-4 space-y-6">
            {/* User Story Section */}
            {typewriterData.userStory && renderUserStory(typewriterData.userStory)}

            {/* Image URL Section */}
            {typewriterData.imageUrl && (
              <FadeIn delay={400}>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Related Image:</h4>
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                    <a
                      href={typewriterData.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 underline break-all"
                    >
                      {typewriterData.imageUrl}
                    </a>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4" open>
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">Show Raw JSON</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(streamingState.data, null, 2)}</pre>
            </details>
          </div>
        )}

        {/* Generation Stats */}
        {hasData && (
          <div className="mt-3 text-sm text-gray-600">
            {typewriterData.userStory?.acceptanceCriteria?.length && <>Acceptance Criteria: {typewriterData.userStory.acceptanceCriteria.length} | </>}
            {typewriterData.userStory?.checklist?.length && <>Checklist Items: {typewriterData.userStory.checklist.length} | </>}
            Size: ~{JSON.stringify(typewriterData).length} characters
          </div>
        )}
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b mb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-800">AI Generator Hub</h1>
            <div className="flex space-x-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                User Stories
              </Link>
              <Link
                to="/figma-code"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/figma-code" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Code className="w-4 h-4" />
                Figma Code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        <Route path="/" element={<UserStoryGenerator />} />
        <Route path="/figma-code" element={<FigmaCodeGenerator />} />
      </Routes>
    </div>
  );
};

export default App;
