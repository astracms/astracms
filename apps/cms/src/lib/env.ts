/**
 * Environment variable validation using Zod
 * Ensures all required environment variables are present and valid at runtime
 */
import { z } from "zod";

const envSchema = z.object({
  // Redis/Upstash for memory storage
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),
  REDIS_TOKEN: z.string().min(1, "REDIS_TOKEN is required"),

  // Optional API keys
  TAVILY_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate and return environment variables
 * Throws an error if validation fails
 * Caches result for performance
 */
export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    const errorMessage = Object.entries(errors)
      .filter(([key]) => key !== "_errors")
      .map(([key, value]) => {
        const err = value as { _errors?: string[] };
        return `  ${key}: ${err._errors?.join(", ") ?? "Invalid"}`;
      })
      .join("\n");

    throw new Error(
      `❌ Invalid environment variables:\n${errorMessage}\n\nPlease check your .env file.`
    );
  }

  cachedEnv = result.data;
  return result.data;
}

/**
 * Get environment variables (validates on first call)
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Check if a specific environment variable is configured
 */
export function hasEnvVar(key: keyof Env): boolean {
  try {
    const env = validateEnv();
    return env[key] !== undefined && env[key] !== "";
  } catch {
    return false;
  }
}
