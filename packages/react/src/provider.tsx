"use client";

import { AstraCMSClient, type AstraCMSConfig } from "@astracms/core";
import { createContext, type ReactNode, useContext, useMemo } from "react";

interface AstraCMSContextValue {
  client: AstraCMSClient;
  config: AstraCMSConfig;
}

const AstraCMSContext = createContext<AstraCMSContextValue | null>(null);

export interface AstraCMSProviderProps {
  children: ReactNode;
  config: AstraCMSConfig;
}

/**
 * Provider component for AstraCMS configuration
 *
 * @example v2 (recommended)
 * ```tsx
 * import { AstraCMSProvider } from '@astracms/react';
 *
 * export default function App() {
 *   return (
 *     <AstraCMSProvider
 *       config={{ apiKey: process.env.NEXT_PUBLIC_ASTRACMS_API_KEY }}
 *     >
 *       <YourApp />
 *     </AstraCMSProvider>
 *   );
 * }
 * ```
 *
 * @example v1 (legacy)
 * ```tsx
 * <AstraCMSProvider
 *   config={{ apiVersion: 'v1', workspaceId: 'your-workspace-id' }}
 * >
 *   <YourApp />
 * </AstraCMSProvider>
 * ```
 */
export function AstraCMSProvider({ children, config }: AstraCMSProviderProps) {
  // Serialize config to create stable dependency
  const configKey = JSON.stringify(config);

  const client = useMemo(
    () => new AstraCMSClient(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configKey]
  );

  const value = useMemo(() => ({ client, config }), [client, configKey]);

  return (
    <AstraCMSContext.Provider value={value}>
      {children}
    </AstraCMSContext.Provider>
  );
}

/**
 * Hook to access the AstraCMS client
 */
export function useAstraCMS(): AstraCMSContextValue {
  const context = useContext(AstraCMSContext);
  if (!context) {
    throw new Error("useAstraCMS must be used within an AstraCMSProvider");
  }
  return context;
}

/**
 * Hook to get just the AstraCMS client instance
 */
export function useAstraCMSClient(): AstraCMSClient {
  return useAstraCMS().client;
}
