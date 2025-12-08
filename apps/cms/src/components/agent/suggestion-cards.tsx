"use client";

import { Button } from "@astra/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@astra/ui/components/card";
import { Input } from "@astra/ui/components/input";
import {
  ArrowsClockwiseIcon,
  CheckIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface Option {
  id: string;
  label: string;
  description?: string;
  value: string;
  imageUrl?: string;
}

interface SuggestionCardsProps {
  type: "title" | "description" | "category" | "tag" | "image" | "custom";
  prompt: string;
  options: Option[];
  allowCustom?: boolean;
  allowRegenerate?: boolean;
  onSelect: (value: string, option: Option) => void;
  onCustom?: (value: string) => void;
  onRegenerate?: () => void;
}

/**
 * Interactive suggestion cards for displaying AI-generated options
 * Users can select, edit, or request regeneration
 */
export function SuggestionCards({
  type,
  prompt,
  options,
  allowCustom = true,
  allowRegenerate = true,
  onSelect,
  onCustom,
  onRegenerate,
}: SuggestionCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleSelect = (option: Option) => {
    setSelectedId(option.id);
    onSelect(option.value, option);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onCustom?.(customValue.trim());
      setIsEditing(false);
    }
  };

  const isImageType = type === "image";

  return (
    <div className="my-4 space-y-4">
      <p className="font-medium text-foreground">{prompt}</p>

      <div
        className={
          isImageType
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            : "space-y-2"
        }
      >
        <AnimatePresence mode="popLayout">
          {options.map((option, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              key={option.id}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {isImageType ? (
                <ImageOptionCard
                  isSelected={selectedId === option.id}
                  onSelect={() => handleSelect(option)}
                  option={option}
                />
              ) : (
                <TextOptionCard
                  isSelected={selectedId === option.id}
                  onSelect={() => handleSelect(option)}
                  option={option}
                  type={type}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {allowCustom && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="outline"
          >
            <PencilSimpleIcon className="mr-1 size-4" />
            Enter custom
          </Button>
        )}
        {allowRegenerate && (
          <Button onClick={onRegenerate} size="sm" variant="outline">
            <ArrowsClockwiseIcon className="mr-1 size-4" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Custom Input */}
      {isEditing && (
        <motion.div
          animate={{ opacity: 1, height: "auto" }}
          className="flex gap-2"
          initial={{ opacity: 0, height: 0 }}
        >
          <Input
            autoFocus
            className="flex-1"
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder={`Enter your own ${type}...`}
            value={customValue}
          />
          <Button onClick={handleCustomSubmit} size="sm">
            Use this
          </Button>
          <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost">
            Cancel
          </Button>
        </motion.div>
      )}
    </div>
  );
}

interface TextOptionCardProps {
  option: Option;
  type: string;
  isSelected: boolean;
  onSelect: () => void;
}

function TextOptionCard({
  option,
  type,
  isSelected,
  onSelect,
}: TextOptionCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 font-medium text-sm">
            {option.label}
          </CardTitle>
          {isSelected && (
            <motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
              <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                <CheckIcon
                  className="size-3 text-primary-foreground"
                  weight="bold"
                />
              </div>
            </motion.div>
          )}
        </div>
      </CardHeader>
      {option.description && (
        <CardContent className="p-3 pt-0">
          <CardDescription className="line-clamp-2 text-xs">
            {option.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
}

interface ImageOptionCardProps {
  option: Option;
  isSelected: boolean;
  onSelect: () => void;
}

function ImageOptionCard({
  option,
  isSelected,
  onSelect,
}: ImageOptionCardProps) {
  return (
    <button
      className={`group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-lg border-2 text-left transition-all hover:border-primary ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
      onClick={onSelect}
      type="button"
    >
      {option.imageUrl ? (
        <Image
          alt={option.label}
          className="object-cover transition-transform group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          src={option.imageUrl}
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-muted-foreground text-xs">{option.label}</span>
        </span>
      )}

      {/* Overlay with title */}
      <span className="absolute inset-x-0 bottom-0 flex bg-linear-to-t from-black/60 to-transparent p-2">
        <span className="line-clamp-1 text-white text-xs">{option.label}</span>
      </span>

      {/* Selection indicator */}
      {isSelected && (
        <motion.span
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 block"
          initial={{ scale: 0 }}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-primary shadow-lg">
            <CheckIcon
              className="size-4 text-primary-foreground"
              weight="bold"
            />
          </span>
        </motion.span>
      )}
    </button>
  );
}

export default SuggestionCards;
