"use client";

import { Button } from "@astra/ui/components/button";
import { Input } from "@astra/ui/components/input";
import { ScrollArea } from "@astra/ui/components/scroll-area";
import { Skeleton } from "@astra/ui/components/skeleton";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}

interface MediaSelectorProps {
  onSelect: (media: MediaItem) => void;
  onUpload?: () => void;
  selectedId?: string;
  type?: "image" | "video" | "all";
}

/**
 * Media selector component for browsing and selecting images from the media library
 * Displayed inline in the chat interface
 */
export function MediaSelector({
  onSelect,
  onUpload,
  selectedId,
  type = "image",
}: MediaSelectorProps) {
  const workspaceId = useWorkspaceId();
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...QUERY_KEYS.MEDIA(workspaceId ?? ""), type, search],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({
          type,
          limit: "12",
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(search ? { search } : {}),
        });
        const res = await fetch(`/api/media?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to fetch media");
        }
        return res.json() as Promise<{
          media: MediaItem[];
          hasMore: boolean;
          lastId?: string;
        }>;
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.lastId : undefined,
      initialPageParam: undefined as string | undefined,
      enabled: !!workspaceId,
    });

  const allMedia = data?.pages.flatMap((page) => page.media) ?? [];

  return (
    <div className="my-4 space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium text-sm">Select from Media Library</h4>
        {onUpload && (
          <Button onClick={onUpload} size="sm" variant="outline">
            <UploadSimpleIcon className="mr-1 size-4" />
            Upload New
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search images..."
          value={search}
        />
      </div>

      {/* Media Grid */}
      <ScrollArea className="h-64">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton className="aspect-square rounded-lg" key={i} />
            ))}
          </div>
        ) : allMedia.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {allMedia.map((media) => (
              <MediaCard
                isSelected={selectedId === media.id}
                key={media.id}
                media={media}
                onSelect={() => onSelect(media)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              size="sm"
              variant="ghost"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface MediaCardProps {
  media: MediaItem;
  isSelected: boolean;
  onSelect: () => void;
}

function MediaCard({ media, isSelected, onSelect }: MediaCardProps) {
  return (
    <motion.div
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-primary/50"
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        alt={media.name}
        className="object-cover"
        fill
        sizes="(max-width: 640px) 33vw, 25vw"
        src={media.url}
        unoptimized
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Name on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="line-clamp-1 font-medium text-white text-xs">
          {media.name}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
        >
          <div className="flex size-6 items-center justify-center rounded-full bg-primary shadow-lg">
            <CheckIcon
              className="size-4 text-primary-foreground"
              weight="bold"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default MediaSelector;
