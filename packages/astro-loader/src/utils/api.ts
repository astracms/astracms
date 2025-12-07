import type {
  AstraCMSConfig,
  Author,
  Category,
  Post,
  Tag,
  V1Config,
} from "../types";

type Endpoint = "posts" | "categories" | "tags" | "authors";

type EndpointDataMap = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  authors: Author[];
};

type FetchAPIOptions = AstraCMSConfig & {
  endpoint: Endpoint;
  params?: Record<string, string | undefined>;
};

/** Default API URL for AstraCMS */
const DEFAULT_API_URL = "https://api.astracms.dev";

/**
 * Type guard to check if config is V1Config
 */
function isV1Config(config: AstraCMSConfig): config is V1Config {
  return config.apiVersion === "v1";
}

/**
 * Fetch data from AstraCMS API
 * Automatically handles v1 or v2 API based on config
 */
export async function fetchAPI<T extends Endpoint>(
  options: FetchAPIOptions & { endpoint: T }
): Promise<EndpointDataMap[T]> {
  const { endpoint, params, ...config } = options;

  const apiUrl = config._apiUrl ?? DEFAULT_API_URL;
  const isV1 = isV1Config(config);

  // Build URL based on API version
  const baseUrl = isV1
    ? `${apiUrl}/v1/${(config as V1Config).workspaceId}/${endpoint}`
    : `${apiUrl}/v2/${endpoint}`;

  const url = new URL(baseUrl);

  // Add query params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key for v2
  if (!isV1) {
    headers.Authorization = `Bearer ${(config as { apiKey: string }).apiKey}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `AstraCMS API error (${response.status}): ${response.statusText}. ${errorBody}`
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  // API returns { posts: [...] }, { categories: [...] }, etc.
  return data[endpoint] as EndpointDataMap[T];
}

/**
 * Fetch all pages of data from AstraCMS API
 * Used when limit is not "all" and we need to paginate
 */
export async function fetchAllPages<T extends Endpoint>(
  options: FetchAPIOptions & { endpoint: T }
): Promise<EndpointDataMap[T]> {
  // For now, just use limit=all to get everything in one request
  // The API supports this directly
  return fetchAPI({
    ...options,
    params: {
      ...options.params,
      limit: "all",
    },
  });
}
