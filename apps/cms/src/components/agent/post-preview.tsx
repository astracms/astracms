"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { CheckCircleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Image from "next/image";

interface PostPreviewData {
  title: string;
  description: string;
  category?: { name: string; slug: string };
  tags?: Array<{ name: string; slug: string }>;
  coverImage?: string;
  contentPreview?: string;
}

interface PostPreviewProps {
  data: PostPreviewData;
  onConfirm: () => void;
  onEdit: (field: keyof PostPreviewData) => void;
  isCreating?: boolean;
}

/**
 * Post preview component showing a summary of the blog post before creation
 */
export function PostPreview({
  data,
  onConfirm,
  onEdit,
  isCreating = false,
}: PostPreviewProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="my-4"
      initial={{ opacity: 0, y: 10 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-5 text-primary" weight="fill" />
            <CardTitle className="text-base">Ready to Create</CardTitle>
          </div>
          <CardDescription>
            Review your post details before creating the draft
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Cover Image */}
          {data.coverImage && (
            <div className="group relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                alt="Cover image"
                className="object-cover"
                fill
                sizes="100vw"
                src={data.coverImage}
                unoptimized
              />
              <button
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onEdit("coverImage")}
                type="button"
              >
                <PencilSimpleIcon className="size-4" />
              </button>
            </div>
          )}

          {/* Title */}
          <div className="group">
            <div className="flex items-center justify-between">
              <label
                className="text-muted-foreground text-xs uppercase tracking-wide"
                htmlFor="title"
              >
                Title
              </label>
              <button
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                onClick={() => onEdit("title")}
                type="button"
              >
                <PencilSimpleIcon className="size-4" />
              </button>
            </div>
            <p className="font-semibold text-lg">{data.title}</p>
          </div>

          {/* Description */}
          <div className="group">
            <div className="flex items-center justify-between">
              <label
                className="text-muted-foreground text-xs uppercase tracking-wide"
                htmlFor="description"
              >
                SEO Description
              </label>
              <button
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                onClick={() => onEdit("description")}
                type="button"
              >
                <PencilSimpleIcon className="size-4" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm">{data.description}</p>
          </div>

          {/* Category */}
          {data.category && (
            <div className="group">
              <div className="flex items-center justify-between">
                <label
                  className="text-muted-foreground text-xs uppercase tracking-wide"
                  htmlFor="category"
                >
                  Category
                </label>
                <button
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  onClick={() => onEdit("category")}
                  type="button"
                >
                  <PencilSimpleIcon className="size-4" />
                </button>
              </div>
              <Badge variant="secondary">{data.category.name}</Badge>
            </div>
          )}

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="group">
              <div className="flex items-center justify-between">
                <label
                  className="text-muted-foreground text-xs uppercase tracking-wide"
                  htmlFor="tags"
                >
                  Tags
                </label>
                <button
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  onClick={() => onEdit("tags")}
                  type="button"
                >
                  <PencilSimpleIcon className="size-4" />
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {data.tags.map((tag) => (
                  <Badge key={tag.slug} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          {data.contentPreview && (
            <div className="group">
              <div className="flex items-center justify-between">
                <label
                  className="text-muted-foreground text-xs uppercase tracking-wide"
                  htmlFor="contentPreview"
                >
                  Content Preview
                </label>
                <button
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  onClick={() => onEdit("contentPreview")}
                  type="button"
                >
                  <PencilSimpleIcon className="size-4" />
                </button>
              </div>
              <p className="line-clamp-3 text-muted-foreground text-sm">
                {data.contentPreview}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button disabled={isCreating} onClick={onConfirm}>
              {isCreating ? "Creating..." : "Create Draft"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PostPreview;
