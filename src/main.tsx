import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { startMockServer } from './mocks/mockServer.ts';
import { PostHogProvider } from 'posthog-js/react';

// Start the mock server in development
startMockServer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking
        debug: import.meta.env.DEV,
      }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);