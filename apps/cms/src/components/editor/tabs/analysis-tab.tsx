"use client";

import { Separator } from "@astra/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@astra/ui/components/tooltip";
import { ArrowClockwiseIcon, InfoIcon } from "@phosphor-icons/react";
import type { EditorInstance } from "novel";
import { useEffect, useState } from "react";
import { useReadability } from "@/hooks/use-readability";
import { useUnsavedChanges } from "@/providers/unsaved-changes";
import { Gauge } from "../../ui/gauge";
import { HiddenScrollbar } from "../../ui/hidden-scrollbar";
import type { ReadabilitySuggestion } from "../ai/readability-suggestions";
import { ReadabilitySuggestions } from "../ai/readability-suggestions";

type AnalysisTabProps = {
  editor?: EditorInstance | null;
  aiSuggestions?: ReadabilitySuggestion[];
  aiLoading?: boolean;
  onRefreshAi?: () => void;
  aiEnabled?: boolean;
  localSuggestions?: string[];
};

export function AnalysisTab({
  editor,
  aiSuggestions,
  aiLoading,
  onRefreshAi,
  aiEnabled,
  localSuggestions,
}: AnalysisTabProps) {
  const [editorText, setEditorText] = useState("");
  const { setHasUnsavedChanges } = useUnsavedChanges();

  useEffect(() => {
    if (!editor) {
      return;
    }
    setEditorText(editor.getText());
    const handler = () => {
      setEditorText(editor.getText());
      setHasUnsavedChanges(true);
    };
    editor.on("update", handler);
    editor.on("create", handler);
    return () => {
      editor.off("update", handler);
      editor.off("create", handler);
    };
  }, [editor, setHasUnsavedChanges]);

  const textMetrics = useReadability({ editor, text: editorText });

  return (
    <HiddenScrollbar className="h-full px-6">
      <section className="grid gap-6 pt-4 pb-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Readability</h4>
            <div className="flex items-center justify-center">
              <Gauge
                label="Score"
                size={200}
                value={textMetrics.readabilityScore}
              />
            </div>
            {textMetrics.wordCount > 0 && (
              <div className="space-y-1">
                <h5 className="font-medium text-sm">Feedback</h5>
                <p className="text-muted-foreground text-xs">
                  <span className="font-medium">
                    {textMetrics.readabilityLevel.level}:
                  </span>{" "}
                  {textMetrics.readabilityLevel.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Text Statistics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Words</p>
                <p className="font-medium">{textMetrics.wordCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Sentences</p>
                <p className="font-medium">{textMetrics.sentenceCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Words per Sentence</p>
                <p className="font-medium">{textMetrics.wordsPerSentence}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Reading Time</p>
                <p className="font-medium">
                  {textMetrics.readingTime.toFixed(0)} minutes
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="group space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h4 className="font-medium text-sm">
                  {textMetrics.wordCount === 0
                    ? "Getting Started"
                    : "Suggestions"}
                </h4>
                {aiEnabled && aiSuggestions && aiSuggestions.length > 0 ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon
                        aria-label="AI generated"
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        These suggestions are AI-generated
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              {aiEnabled && aiSuggestions && aiSuggestions.length > 0 && (
                <button
                  aria-label="Refresh AI suggestions"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-accent disabled:opacity-50"
                  disabled={Boolean(aiLoading)}
                  onClick={onRefreshAi}
                  type="button"
                >
                  <ArrowClockwiseIcon
                    className={aiLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                  />
                </button>
              )}
            </div>

            {aiEnabled ? (
              aiSuggestions && aiSuggestions.length > 0 ? (
                <ReadabilitySuggestions
                  editor={editor ?? null}
                  isLoading={aiLoading}
                  suggestions={aiSuggestions}
                />
              ) : (
                <div className="space-y-3">
                  {/* Local suggestions shown by default */}
                  <div className="space-y-2 text-muted-foreground text-sm">
                    {(localSuggestions ?? textMetrics.suggestions).map(
                      (suggestion) => (
                        <p key={suggestion}>• {suggestion}</p>
                      )
                    )}
                  </div>

                  {/* AI fetch button */}
                  {textMetrics.wordCount > 0 && (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-3 text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                      disabled={Boolean(aiLoading)}
                      onClick={onRefreshAi}
                      type="button"
                    >
                      {aiLoading ? (
                        <>
                          <ArrowClockwiseIcon className="h-4 w-4 animate-spin" />
                          <span>Generating AI suggestions...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">✨</span>
                          <span>Get AI-Powered Suggestions</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-2 text-muted-foreground text-sm">
                {(localSuggestions ?? textMetrics.suggestions).map(
                  (suggestion) => (
                    <p key={suggestion}>• {suggestion}</p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </HiddenScrollbar>
  );
}
