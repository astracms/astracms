/**
 * Type definitions for external API responses
 */

/**
 * Tavily Search API types
 */
export interface TavilySearchResult {
  /** The content/snippet from the search result */
  content: string;
  /** The URL of the search result */
  url: string;
  /** The title of the search result */
  title?: string;
  /** Relevance score */
  score?: number;
  /** Published date if available */
  publishedDate?: string;
}

export interface TavilySearchResponse {
  /** Array of search results */
  results?: TavilySearchResult[];
  /** AI-generated answer based on search results */
  answer?: string;
  /** Query that was executed */
  query?: string;
  /** Images found in search results */
  images?: string[];
  /** Response metadata */
  responseTime?: number;
}
