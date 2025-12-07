// Shim for Nuxt's #imports alias
// This allows TypeScript to understand the #imports auto-import
declare module "#imports" {
    export const useAsyncData: typeof import("nuxt/app").useAsyncData;
    export const useRuntimeConfig: typeof import("nuxt/app").useRuntimeConfig;
    export const ref: typeof import("vue").ref;
    export const watch: typeof import("vue").watch;
    export const computed: typeof import("vue").computed;
}

declare module "#app" {
    export * from "nuxt/app";
}
