export type Env = {
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_TOKEN: string;
  ENVIRONMENT?: string;
};

export type Variables = {
  workspaceId: string;
  apiKeyId: string;
  apiKeyScopes: string[];
};
