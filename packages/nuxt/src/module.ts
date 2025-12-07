import { addImports, createResolver, defineNuxtModule } from "@nuxt/kit";

export interface ModuleOptions {
  /**
   * API Key for v2 authentication (recommended)
   */
  apiKey?: string;

  /**
   * Workspace ID for v1 authentication (legacy)
   */
  workspaceId?: string;

  /**
   * API version - 'v1' or 'v2' (defaults to 'v2')
   */
  apiVersion?: "v1" | "v2";

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
      apiKey: options.apiKey ?? "",
      workspaceId: options.workspaceId ?? "",
      apiVersion: options.apiVersion ?? "v2",
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
