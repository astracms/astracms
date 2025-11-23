"use client";

import { Button } from "@astra/ui/components/button";
import { toast } from "@astra/ui/components/sonner";
import { KeyIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { WorkspacePageWrapper } from "@/components/layout/wrapper";
import PageLoader from "@/components/shared/page-loader";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";
import type { ApiKey } from "@/types/api-key";

const CreateApiKeySheet = dynamic(
  () => import("@/components/keys/create-api-key")
);

const ApiKeyCard = dynamic(() =>
  import("@/components/keys/api-key-card").then((mod) => mod.ApiKeyCard)
);

function PageClient() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    // biome-ignore lint/style/noNonNullAssertion: <>
    queryKey: QUERY_KEYS.API_KEYS(workspaceId!),
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      try {
        const res = await fetch("/api/keys");
        if (!res.ok) {
          throw new Error(
            `Failed to fetch API keys: ${res.status} ${res.statusText}`
          );
        }
        const data: ApiKey[] = await res.json();
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch API keys"
        );
      }
    },
    enabled: !!workspaceId,
  });

  const {
    mutate: toggleApiKey,
    variables: toggleVariables,
    isPending: isToggling,
  } = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) =>
      fetch(`/api/keys/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      }),
    onMutate: async (newApiKeyData) => {
      if (!workspaceId) {
        return;
      }

      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.API_KEYS(workspaceId),
      });
      const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
        QUERY_KEYS.API_KEYS(workspaceId)
      );

      queryClient.setQueryData<ApiKey[]>(
        QUERY_KEYS.API_KEYS(workspaceId),
        (old) =>
          old?.map((apiKey) =>
            apiKey.id === newApiKeyData.id
              ? { ...apiKey, enabled: newApiKeyData.enabled }
              : apiKey
          ) ?? []
      );

      return { previousApiKeys };
    },
    onError: (_err, _newApiKey, context) => {
      if (context?.previousApiKeys && workspaceId) {
        queryClient.setQueryData(
          QUERY_KEYS.API_KEYS(workspaceId),
          context.previousApiKeys
        );
      }
      toast.error("Failed to update API key");
    },
    onSettled: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.API_KEYS(workspaceId),
        });
      }
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (apiKeys?.length === 0) {
    return (
      <WorkspacePageWrapper
        className="grid h-full place-content-center"
        size="compact"
      >
        <div className="flex max-w-80 flex-col items-center gap-4">
          <div className="p-2">
            <KeyIcon className="size-16" />
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground text-sm">
              API keys let you interact with your workspace using our API.
              Create your first key to get started.
            </p>
            <CreateApiKeySheet>
              <Button>
                <PlusIcon className="size-4" />
                New API Key
              </Button>
            </CreateApiKeySheet>
          </div>
        </div>
      </WorkspacePageWrapper>
    );
  }

  return (
    <WorkspacePageWrapper
      className="flex flex-col gap-8 pt-10 pb-16"
      size="compact"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div />
          <CreateApiKeySheet>
            <Button>
              <PlusIcon className="size-4" />
              New API Key
            </Button>
          </CreateApiKeySheet>
        </div>

        <ul className="grid gap-4">
          {apiKeys?.map((apiKey) => (
            <ApiKeyCard
              apiKey={apiKey}
              isToggling={isToggling}
              key={apiKey.id}
              onDelete={() => {
                if (workspaceId) {
                  queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.API_KEYS(workspaceId),
                  });
                }
              }}
              onToggle={toggleApiKey}
              toggleVariables={toggleVariables}
            />
          ))}
        </ul>
      </div>
    </WorkspacePageWrapper>
  );
}

export default PageClient;
