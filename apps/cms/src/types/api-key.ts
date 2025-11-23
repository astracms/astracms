export type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  enabled: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  workspaceId: string;
};

export type ApiKeyWithPlainKey = ApiKey & {
  plainKey: string;
};

export type ApiKeyListItem = Omit<ApiKey, "key">;
