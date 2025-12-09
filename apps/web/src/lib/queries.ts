import { getSecret } from "astro:env/server";
import { createAstraCMSClient } from "@astracms/core";

const workspaceId = getSecret("ASTRA_WORKSPACE_KEY");

const client = createAstraCMSClient({
  apiVersion: "v1",
  workspaceId: workspaceId as string,
});

export async function fetchPosts(
  categories: string[],
  tags: string[],
  query: string
) {
  const posts = await client.getPosts({
    limit: 10,
    page: 1,
    categories,
    tags,
    excludeCategories: ["internal"],
    excludeTags: ["draft"],
    query,
  });

  return posts;
}
