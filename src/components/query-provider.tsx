'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - reduce refetching
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
        refetchOnReconnect: true, // Still refetch on reconnect
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
