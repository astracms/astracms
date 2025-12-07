import { AstraCMSClient, type AstraCMSConfig } from "@astracms/core";
import { type InjectionKey, inject, provide } from "vue";

const AstraCMSKey: InjectionKey<AstraCMSClient> = Symbol("astracms");

/**
 * Provide AstraCMS client to all child components
 *
 * @example
 * ```vue
 * <script setup>
 * import { provideAstraCMS } from '@astracms/vue';
 *
 * provideAstraCMS({
 *   apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
 * });
 * </script>
 * ```
 */
export function provideAstraCMS(config: AstraCMSConfig): AstraCMSClient {
  const client = new AstraCMSClient(config);
  provide(AstraCMSKey, client);
  return client;
}

/**
 * Inject the AstraCMS client from parent component
 */
export function useAstraCMSClient(): AstraCMSClient {
  const client = inject(AstraCMSKey);
  if (!client) {
    throw new Error(
      "AstraCMS client not found. Did you call provideAstraCMS() in a parent component?"
    );
  }
  return client;
}

/**
 * Create an AstraCMS plugin for Vue
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { createAstraCMSPlugin } from '@astracms/vue';
 *
 * const app = createApp(App);
 * app.use(createAstraCMSPlugin({
 *   apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
 * }));
 * ```
 */
export function createAstraCMSPlugin(config: AstraCMSConfig) {
  return {
    install(app: {
      provide: (
        key: InjectionKey<AstraCMSClient>,
        value: AstraCMSClient
      ) => void;
    }) {
      const client = new AstraCMSClient(config);
      app.provide(AstraCMSKey, client);
    },
  };
}
