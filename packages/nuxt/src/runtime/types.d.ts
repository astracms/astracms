import type { AstraCMSConfig } from "@astracms/core";

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    astracms: Partial<AstraCMSConfig>;
  }
}

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    astracms: Partial<AstraCMSConfig>;
  }
}

