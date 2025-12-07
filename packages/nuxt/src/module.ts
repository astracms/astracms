import type { AstraCMSConfig } from "@astracms/core";
import {
  addImports,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";

export interface ModuleOptions extends Partial<AstraCMSConfig> {
  /**
   * Whether to auto-import composables
   * @default true
   */
  autoImport?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@astracms/nuxt",
    configKey: "astracms",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  defaults: {
    autoImport: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Add runtime config
    nuxt.options.runtimeConfig.public.astracms = {
      apiUrl: options.apiUrl ?? "",
      apiKey: options.apiKey ?? "",
      workspaceId: options.workspaceId ?? "",
    };

    // Auto-import composables
    if (options.autoImport) {
      addImports([
        {
          name: "useAstraCMS",
          from: resolver.resolve("./runtime/composables"),
        },
        { name: "usePosts", from: resolver.resolve("./runtime/composables") },
        { name: "usePost", from: resolver.resolve("./runtime/composables") },
        {
          name: "useCategories",
          from: resolver.resolve("./runtime/composables"),
        },
        { name: "useTags", from: resolver.resolve("./runtime/composables") },
        { name: "useAuthors", from: resolver.resolve("./runtime/composables") },
        {
          name: "usePostSearch",
          from: resolver.resolve("./runtime/composables"),
        },
      ]);
    }

    // Add type declarations
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ path: resolver.resolve("./runtime/types.d.ts") });
    });
  },
});
