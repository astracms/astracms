"use client";

import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import { HashIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { OnboardingData } from "./onboarding-wizard";

interface StepKeywordsProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function StepKeywords({ data, updateData }: StepKeywordsProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;

    const currentKeywords = data.targetKeywords || [];
    if (!currentKeywords.includes(newKeyword.trim())) {
      updateData({
        targetKeywords: [...currentKeywords, newKeyword.trim()],
      });
    }
    setNewKeyword("");
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const currentKeywords = data.targetKeywords || [];
    updateData({
      targetKeywords: currentKeywords.filter((k) => k !== keywordToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">Target keywords</h2>
        <p className="mt-2 text-muted-foreground">
          These keywords will help optimize your blog posts for search engines.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border p-4">
          <HashIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">SEO Keywords</h3>
            <p className="text-muted-foreground text-sm">
              Keywords your target audience searches for
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a keyword..."
              value={newKeyword}
            />
            <Button
              disabled={!newKeyword.trim()}
              onClick={handleAddKeyword}
              size="icon"
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {data.targetKeywords && data.targetKeywords.length > 0 && (
            <div className="space-y-2">
              <Label>Current keywords:</Label>
              <div className="flex flex-wrap gap-2">
                {data.targetKeywords.map((keyword) => (
                  <Badge
                    className="flex items-center gap-1"
                    key={keyword}
                    variant="secondary"
                  >
                    {keyword}
                    <button
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      onClick={() => handleRemoveKeyword(keyword)}
                      type="button"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-2 font-medium">Tips for choosing keywords:</h4>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Focus on terms your audience actually searches for</li>
              <li>• Include both short-tail and long-tail keywords</li>
              <li>
                • Consider search intent (informational, commercial,
                transactional)
              </li>
              <li>• Research competitors' top-performing keywords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
