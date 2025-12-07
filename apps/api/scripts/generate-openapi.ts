#!/usr/bin/env node
/**
 * Generate OpenAPI spec from the running API and update docs
 *
 * Usage:
 *   pnpm generate:openapi
 *
 * This script:
 * 1. Starts the API dev server temporarily
 * 2. Fetches the OpenAPI spec from /doc endpoint
 * 3. Saves it to apps/docs/content/docs/api-reference/openapi.yml
 */

import { type ChildProcess, spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = "http://localhost:8787/doc";
const OUTPUT_PATH = resolve(
  __dirname,
  "../../docs/content/docs/api-reference/openapi.yml"
);

async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function main() {
  console.log("🚀 Starting API server...");

  // Start the API dev server
  let serverProcess: ChildProcess | null = null;

  try {
    serverProcess = spawn("pnpm", ["dev"], {
      cwd: resolve(__dirname, ".."),
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    // Wait for server to be ready
    console.log("⏳ Waiting for server to be ready...");
    const isReady = await waitForServer(API_URL);

    if (!isReady) {
      throw new Error("Server did not start in time");
    }

    console.log("📥 Fetching OpenAPI spec...");
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status}`);
    }

    const spec = await response.json();

    // Format as pretty JSON (OpenAPI YAML compatibility)
    const content = JSON.stringify(spec, null, 2);

    console.log(`📝 Writing to ${OUTPUT_PATH}...`);
    await writeFile(OUTPUT_PATH, content, "utf-8");

    console.log("✅ OpenAPI spec generated successfully!");
    console.log(`   Output: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("❌ Failed to generate OpenAPI spec:", error);
    process.exit(1);
  } finally {
    // Clean up server process
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main();
