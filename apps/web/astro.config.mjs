// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwind from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwind()],
  },
  site: "https://blog.astracms.com",
  trailingSlash: "never",
  output: "server",
  image: {
    domains: [
      "images.astracms.com",
      "storage.astracms.com",
      "*.up.railway.app",
    ],
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  adapter: node({
    mode: "standalone",
  }),
  server: {
    port: 3001,
    host: true,
  },
  experimental: {
    fonts: [
      {
        name: "Literata",
        cssVariable: "--font-literata",
        provider: fontProviders.fontsource(),
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
      },
      {
        name: "Geist",
        cssVariable: "--font-geist",
        provider: fontProviders.google(),
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ],
  },
});
