"use client";

import { AstraCMSClient, type AstraCMSConfig } from "@astracms/core";
import { createContext, type ReactNode, useContext, useMemo } from "react";

interface AstraCMSContextValue {
    client: AstraCMSClient;
    config: AstraCMSConfig;
}

const AstraCMSContext = createContext<AstraCMSContextValue | null>(null);

export interface AstraCMSProviderProps extends AstraCMSConfig {
    children: ReactNode;
}

/**
 * Provider component for AstraCMS configuration
 *
 * @example
 * ```tsx
 * import { AstraCMSProvider } from '@astracms/react';
 *
 * export default function App() {
 *   return (
 *     <AstraCMSProvider
 *       apiUrl="https://api.astracms.dev"
 *       apiKey={process.env.NEXT_PUBLIC_ASTRACMS_API_KEY}
 *     >
 *       <YourApp />
 *     </AstraCMSProvider>
 *   );
 * }
 * ```
 */
export function AstraCMSProvider({
    children,
    apiUrl,
    apiKey,
    workspaceId,
}: AstraCMSProviderProps) {
    const config: AstraCMSConfig = useMemo(
        () => ({ apiUrl, apiKey, workspaceId }),
        [apiUrl, apiKey, workspaceId]
    );

    const client = useMemo(() => new AstraCMSClient(config), [config]);

    const value = useMemo(() => ({ client, config }), [client, config]);

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
