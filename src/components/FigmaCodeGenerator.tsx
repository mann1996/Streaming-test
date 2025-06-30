import { Loader2, Play, Square, FileCode, Download } from "lucide-react";
import React, { useState } from "react";
import { useStreamingResponse } from "../hooks/useStreamingResponse";
import TypewriterText from "./TypewriterText";
import FadeIn from "./FadeIn";

// Type definitions for the Figma code generation
interface CodeFile {
  name: string;
  content: string;
  fileType: string;
}

interface StreamedObject {
  files?: CodeFile[];
}

interface FormData {
  url: string;
  userTier: "free" | "premium" | "enterprise";
  framework: "react" | "vue" | "angular" | "svelte";
  styling: "tailwind" | "css" | "styled-components" | "emotion";
  typescript: boolean;
  responsive: boolean;
  accessibility: boolean;
  componentLibrary: "none" | "mui" | "antd" | "chakra" | "bootstrap";
}

const FigmaCodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    url: "https://www.figma.com/design/qfJ6PclTMcI6fCR3pzEezG/Seller-Dashboard?node-id=251-658&t=Mz4Kf7176dyHqBQe-1",
    userTier: "free",
    framework: "react",
    styling: "tailwind",
    typescript: false,
    responsive: false,
    accessibility: false,
    componentLibrary: "none",
  });

  // State for typewriter effect
  const [typewriterData, setTypewriterData] = useState<StreamedObject>({});
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [streamingState, streamingActions] = useStreamingResponse<StreamedObject>({
    url: "http://localhost:8383/api/genai/generate/code",
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

  const handleFormChange = (field: keyof FormData, value: string | boolean | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const downloadFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    if (!typewriterData.files || typewriterData.files.length === 0) return;

    typewriterData.files?.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Figma Code Generator</h2>

        {/* Form Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Configuration:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Figma URL:</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.figma.com/design/..."
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Framework:</label>
              <select
                value={formData.framework}
                onChange={(e) => handleFormChange("framework", e.target.value as FormData["framework"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={streamingState.isStreaming}
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Styling:</label>
              <select
                value={formData.styling}
                onChange={(e) => handleFormChange("styling", e.target.value as FormData["styling"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={streamingState.isStreaming}
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="css">CSS</option>
                <option value="styled-components">Styled Components</option>
                <option value="emotion">Emotion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Library:</label>
              <select
                value={formData.componentLibrary}
                onChange={(e) => handleFormChange("componentLibrary", e.target.value as FormData["componentLibrary"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={streamingState.isStreaming}
              >
                <option value="none">None</option>
                <option value="mui">Material-UI</option>
                <option value="antd">Ant Design</option>
                <option value="shadcn">Shadcn</option>
                <option value="bootstrap">Bootstrap</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.typescript}
                  onChange={(e) => handleFormChange("typescript", e.target.checked)}
                  className="mr-2"
                  disabled={streamingState.isStreaming}
                />
                <span className="text-sm font-medium text-gray-700">TypeScript</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.responsive}
                  onChange={(e) => handleFormChange("responsive", e.target.checked)}
                  className="mr-2"
                  disabled={streamingState.isStreaming}
                />
                <span className="text-sm font-medium text-gray-700">Responsive</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.accessibility}
                  onChange={(e) => handleFormChange("accessibility", e.target.checked)}
                  className="mr-2"
                  disabled={streamingState.isStreaming}
                />
                <span className="text-sm font-medium text-gray-700">Accessibility</span>
              </label>
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
                Generating Code...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Code
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

          {hasData && !streamingState.isStreaming && typewriterData.files && typewriterData.files.length > 0 && (
            <button
              onClick={downloadAllFiles}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All Files
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

      {/* Generated Code Display */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated Code:</h3>

        {!hasData ? (
          <div className="text-gray-500 italic bg-white rounded border p-4">
            {streamingState.isStreaming ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span>Generating code from Figma design...</span>
              </div>
            ) : (
              'No code generated yet. Configure settings above and click "Generate Code".'
            )}
          </div>
        ) : (
          <div className="bg-white rounded border p-4 space-y-6">
            {/* Files Section */}
            {typewriterData.files && typewriterData.files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">Generated Files ({typewriterData.files?.length || 0}):</h4>
                </div>
                {typewriterData.files?.map((file, index) => (
                  <FadeIn key={index} delay={index * 100}>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{file.fileType}</span>
                        </div>
                        <button onClick={() => downloadFile(file)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                      <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                        <pre className="text-sm">
                          {isTypewriterActive ? (
                            <TypewriterText text={file.content} speed={50} isActive={isTypewriterActive} className="text-gray-100" />
                          ) : (
                            <code className="text-gray-100">{file.content}</code>
                          )}
                        </pre>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">Show Raw JSON</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(streamingState.data, null, 2)}</pre>
            </details>
          </div>
        )}

        {/* Generation Stats */}
        {hasData && typewriterData.files && typewriterData.files.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            Files Generated: {typewriterData.files?.length || 0} | Total Size: ~
            {typewriterData.files?.reduce((acc, file) => acc + file.content?.length, 0) || 0} characters
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmaCodeGenerator;
