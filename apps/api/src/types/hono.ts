// Hono context types for Node.js deployment
// This extends Hono's context to include our custom environment variables

export type AppEnv = {
  Variables: {
    env: {
      DATABASE_URL: string;
      REDIS_URL?: string;
      REDIS_TOKEN?: string;
      NODE_ENV?: string;
      PORT?: string;
      CORS_ORIGINS?: string;
      API_VERSION?: string;
    };
  };
};
