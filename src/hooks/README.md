# useStreamingResponse Hook

A reusable React hook for handling streaming responses from APIs. This hook provides a clean interface for managing streaming data, connection status, and error handling.

## Features

- ✅ TypeScript support with generic types
- ✅ Automatic connection status management
- ✅ Error handling and recovery
- ✅ Request cancellation with AbortController
- ✅ Support for Server-Sent Events (SSE) format
- ✅ Vercel AI SDK compatibility
- ✅ Customizable callbacks for data, error, and completion events

## Basic Usage

```typescript
import { useStreamingResponse } from "./hooks/useStreamingResponse";

interface MyData {
  message: string;
  timestamp: number;
}

function MyComponent() {
  const [streamingState, streamingActions] = useStreamingResponse<MyData>({
    url: "https://api.example.com/stream",
    method: "POST",
    body: { prompt: "Hello world" },
    onData: (data) => console.log("Received data:", data),
    onError: (error) => console.error("Stream error:", error),
    onComplete: () => console.log("Stream completed"),
  });

  return (
    <div>
      <button onClick={streamingActions.startStreaming}>Start Streaming</button>
      <button onClick={streamingActions.stopStreaming}>Stop Streaming</button>
      <div>Status: {streamingState.connectionStatus}</div>
      <div>Data: {JSON.stringify(streamingState.data)}</div>
    </div>
  );
}
```

## API Reference

### Hook Parameters

```typescript
interface StreamingOptions {
  url: string; // API endpoint URL
  method?: "GET" | "POST" | "PUT" | "DELETE"; // HTTP method (default: 'POST')
  headers?: Record<string, string>; // Custom headers
  credentials?: RequestCredentials; // Fetch credentials (default: 'include')
  body?: unknown; // Request body
  onData?: (data: unknown) => void; // Callback for each data chunk
  onError?: (error: string) => void; // Error callback
  onComplete?: () => void; // Completion callback
  onStatusChange?: (status: ConnectionStatus) => void; // Status change callback
}
```

### Return Value

The hook returns a tuple with state and actions:

```typescript
[StreamingState<T>, StreamingActions];
```

#### StreamingState

```typescript
interface StreamingState<T = Record<string, unknown>> {
  data: T; // Accumulated streaming data
  isStreaming: boolean; // Whether currently streaming
  error: string | null; // Error message if any
  connectionStatus: ConnectionStatus; // Current connection status
}
```

#### StreamingActions

```typescript
interface StreamingActions {
  startStreaming: () => Promise<void>; // Start the streaming request
  stopStreaming: () => void; // Stop and abort the request
  reset: () => void; // Reset state to initial values
}
```

### Connection Status

```typescript
type ConnectionStatus =
  | "idle" // Initial state
  | "connecting" // Establishing connection
  | "connected" // Successfully connected and receiving data
  | "completed" // Stream completed successfully
  | "error" // Error occurred
  | "stopped"; // Manually stopped
```

## Advanced Examples

### With Custom Headers

```typescript
const [state, actions] = useStreamingResponse<MyData>({
  url: "https://api.example.com/stream",
  headers: {
    Authorization: "Bearer token",
    "Custom-Header": "value",
  },
  body: { userId: 123 },
});
```

### With Event Callbacks

```typescript
const [state, actions] = useStreamingResponse<MyData>({
  url: "https://api.example.com/stream",
  onData: (data) => {
    // Handle each chunk of data
    console.log("New data received:", data);
  },
  onError: (error) => {
    // Handle errors
    toast.error(`Stream error: ${error}`);
  },
  onComplete: () => {
    // Handle completion
    toast.success("Stream completed successfully!");
  },
  onStatusChange: (status) => {
    // Handle status changes
    console.log("Connection status changed to:", status);
  },
});
```

### With TypeScript Generics

```typescript
interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  messages: ChatMessage[];
  metadata: {
    totalMessages: number;
    sessionId: string;
  };
}

const [state, actions] = useStreamingResponse<ChatResponse>({
  url: "https://api.example.com/chat/stream",
  body: { message: "Hello" },
});

// TypeScript will now provide full type safety for state.data
console.log(state.data.messages); // ✅ Fully typed
```

## Error Handling

The hook automatically handles various error scenarios:

- Network errors
- HTTP status errors
- JSON parsing errors
- AbortController cancellation
- Stream processing errors

All errors are captured in `state.error` and can be handled via the `onError` callback.

## Best Practices

1. **Always provide a generic type** for better TypeScript support
2. **Use the reset action** when starting a new stream to clear previous data
3. **Handle errors gracefully** using the `onError` callback
4. **Clean up on component unmount** - the hook handles this automatically
5. **Use appropriate HTTP methods** for your API endpoints
6. **Provide meaningful error messages** in your error callbacks

## Compatibility

- React 16.8+ (hooks support)
- TypeScript 4.0+
- Modern browsers with Fetch API support
- Server-Sent Events (SSE) compatible APIs
- Vercel AI SDK streaming format
