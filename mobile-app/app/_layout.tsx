import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Create a single TanStack Query client for the entire app
const queryClient = new QueryClient();

/**
 * Root layout for the Expo Router. This component wraps all routes with
 * providers for authentication and data fetching. It also starts the
 * MSW (Mock Service Worker) in development when running on the web so
 * that network requests can be mocked consistently across platforms.
 */
export default function RootLayout() {
  useEffect(() => {
    // Only start MSW in development and on the web. On native platforms
    // `window` will be undefined so the worker won't start. When building
    // for production you can remove this or add additional conditions.
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Dynamically import the worker to avoid bundling MSW code in production
      import('../src/mocks/browser').then(({ worker }) => {
        worker.start();
      });
    }
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {/* The Stack component renders your route hierarchy defined in the app/ directory. */}
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </AuthProvider>
  );
}