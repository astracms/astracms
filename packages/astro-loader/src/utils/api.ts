import type {
    AstraCMSConfig,
    Author,
    Category,
    Post,
    Tag,
} from "../types";

type Endpoint = "posts" | "categories" | "tags" | "authors";

type EndpointDataMap = {
    posts: Post[];
    categories: Category[];
    tags: Tag[];
    authors: Author[];
};

interface FetchAPIOptions extends AstraCMSConfig {
    endpoint: Endpoint;
    params?: Record<string, string | undefined>;
}

/**
 * Fetch data from AstraCMS API
 * Automatically detects v1 or v2 API based on provided credentials
 */
export async function fetchAPI<T extends Endpoint>(
    options: FetchAPIOptions & { endpoint: T }
): Promise<EndpointDataMap[T]> {
    const { endpoint, apiUrl, workspaceId, apiKey, params } = options;

    // Validate configuration
    if (!apiKey && !workspaceId) {
        throw new Error(
            "AstraCMS Loader: Either apiKey (recommended) or workspaceId is required"
        );
    }

    // Determine API version based on authentication method
    // v2 (API key) is preferred as it's more secure
    const isV2 = Boolean(apiKey);

    const baseUrl = isV2
        ? `${apiUrl}/v2/${endpoint}`
        : `${apiUrl}/v1/${workspaceId}/${endpoint}`;

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

    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
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
