"use client";

import { useChat } from "@ai-sdk/react";
import {
  Message,
  MessageAction,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@astra/ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputProvider,
} from "@astra/ui/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@astra/ui/components/ai-elements/suggestion";
import { Button } from "@astra/ui/components/button";
import { ScrollArea } from "@astra/ui/components/scroll-area";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AddCategoryView,
  AddTagView,
  CreatePostView,
  SearchView,
} from "@/components/agent/tool-views";
import type { CMSAgentUIMessage } from "@/lib/ai/agent";

export function PageClient() {
  const { status, sendMessage, messages } = useChat<CMSAgentUIMessage>({
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
  const [input, setInput] = useState<string>("");

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const suggestions: { key: string; value: string }[] = [
    { key: "1", value: "Create a new blog post about AI" },
    { key: "2", value: "Add a 'Technology' tag" },
    { key: "3", value: "Search for published posts" },
    { key: "4", value: "Create a 'Tutorials' category" },
    { key: "5", value: "Draft a post about Next.js 15" },
    { key: "6", value: "Find posts with 'Draft' status" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-8 pb-32">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h2 className="font-semibold text-2xl tracking-tight">
                    How can I help you today?
                  </h2>
                  <p className="max-w-md text-muted-foreground">
                    I can help you manage your content, create tags, find posts,
                    and more.
                  </p>
                </motion.div>
              )}
              {messages.map((message) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  key={message.id}
                  transition={{ duration: 0.2 }}
                >
                  <Message
                    from={message.role === "user" ? "user" : "assistant"}
                  >
                    <MessageContent>
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MessageResponse key={index}>
                                {part.text}
                              </MessageResponse>
                            );

                          case "step-start":
                            return index > 0 ? (
                              <div className="my-3" key={index}>
                                <hr className="border-border" />
                              </div>
                            ) : null;

                          case "tool-addTag":
                            return <AddTagView invocation={part} key={index} />;

                          case "tool-addCategory":
                            return (
                              <AddCategoryView invocation={part} key={index} />
                            );

                          case "tool-createPost":
                            return (
                              <CreatePostView invocation={part} key={index} />
                            );

                          case "tool-search":
                            return <SearchView invocation={part} key={index} />;

                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                    {message.role === "assistant" && status !== "streaming" && (
                      <MessageToolbar>
                        <div className="flex items-center gap-1">
                          <MessageAction
                            onClick={() => {
                              // Extract text parts for copying
                              const textContent = message.parts
                                .filter((part) => part.type === "text")
                                .map((part) =>
                                  part.type === "text" ? part.text : ""
                                )
                                .join("\n\n");
                              navigator.clipboard.writeText(textContent);
                              toast.success("Copied to clipboard");
                            }}
                            tooltip="Copy"
                          />
                        </div>
                      </MessageToolbar>
                    )}
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>
            {status === "streaming" && (
              <div className="flex justify-center">
                <div className="text-muted-foreground text-sm">Thinking...</div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background to-transparent pt-10 pb-6">
          <div className="mx-auto max-w-3xl space-y-3 px-4">
            <Suggestions>
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion.key}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion.value}
                />
              ))}
            </Suggestions>
            <PromptInputProvider>
              <PromptInputForm
                input={input}
                isStreaming={status === "streaming"}
                sendMessage={sendMessage}
                setInput={setInput}
              />
            </PromptInputProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PromptInputFormProps {
  sendMessage: (message: { text: string; cancel?: boolean }) => void;
  isStreaming: boolean;
  input: string;
  setInput: (value: string) => void;
}

function PromptInputForm({
  sendMessage,
  isStreaming,
  input,
  setInput,
}: PromptInputFormProps) {
  return (
    <PromptInput
      className="relative overflow-hidden rounded-xl border bg-background shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20"
      onSubmit={(message, e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        sendMessage({ text: input });
        setInput("");
      }}
    >
      <PromptInputAttachments>
        {(file) => <PromptInputAttachment data={file} />}
      </PromptInputAttachments>
      <div className="flex w-full items-center gap-2">
        {/* <PromptInputActionAddAttachments /> */}
        <input
          className="flex-1 bg-transparent px-2 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          value={input}
        />
        <Button
          className="rounded-lg transition-all hover:scale-105 active:scale-95"
          disabled={isStreaming || !input.trim()}
          size="icon"
          type="submit"
        >
          <ArrowUpIcon className="size-4" />
        </Button>
      </div>
    </PromptInput>
  );
}
