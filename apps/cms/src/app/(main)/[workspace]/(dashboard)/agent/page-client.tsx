"use client";

import { type UIMessage as AIMessage, useChat } from "@ai-sdk/react";
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
import { ArrowUpIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AddCategoryView,
  AddTagView,
  CreateBlogAutoView,
  CreatePostView,
  ListMediaView,
  ListResourcesView,
  PresentOptionsView,
  SearchView,
  WebSearchView,
} from "@/components/agent/tool-views";

const SUGGESTIONS = [
  "Create a blog post about AI",
  "Show me all available tags",
  "List all categories",
  "What posts do I have?",
  "Help me write a new article",
  "Show my media library",
];

export function PageClient() {
  const { status, sendMessage, messages, setMessages, stop } =
    useChat<AIMessage>({
      onError: (error: Error) => {
        toast.error(`Failed to send message: ${error.message}`);
      },
    });
  const [input, setInput] = useState<string>("");

  const handleClearChat = async () => {
    try {
      const res = await fetch("/api/chat/clear", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        toast.success("Chat cleared");
      } else {
        toast.error("Failed to clear chat");
      }
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [setMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSuggestionClick = (suggestionValue: string) => {
    setInput(suggestionValue);
  };

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
                        // Handle text parts
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={index}>
                              {part.text}
                            </MessageResponse>
                          );
                        }

                        // Handle step separators
                        if (part.type === "step-start") {
                          return index > 0 ? (
                            <div className="my-3" key={index}>
                              <hr className="border-border" />
                            </div>
                          ) : null;
                        }

                        // Handle tool invocations
                        // AI SDK v5 uses part.type like "tool-add-tag" or just has toolName
                        if (part.type.startsWith("tool-")) {
                          const toolName = part.type.replace("tool-", "");

                          // Match tool names (Mastra uses kebab-case IDs like "add-tag")
                          if (toolName === "add-tag" || toolName === "addTag") {
                            return <AddTagView invocation={part} key={index} />;
                          }
                          if (
                            toolName === "add-category" ||
                            toolName === "addCategory"
                          ) {
                            return (
                              <AddCategoryView invocation={part} key={index} />
                            );
                          }
                          if (
                            toolName === "create-post" ||
                            toolName === "createPost"
                          ) {
                            return (
                              <CreatePostView invocation={part} key={index} />
                            );
                          }
                          if (toolName === "search") {
                            return <SearchView invocation={part} key={index} />;
                          }
                          if (
                            toolName === "update-post" ||
                            toolName === "updatePost"
                          ) {
                            return (
                              <CreatePostView invocation={part} key={index} />
                            );
                          }
                          if (
                            toolName === "list-resources" ||
                            toolName === "listResources"
                          ) {
                            return (
                              <ListResourcesView
                                invocation={part}
                                key={index}
                              />
                            );
                          }
                          if (
                            toolName === "get-analytics" ||
                            toolName === "getAnalytics"
                          ) {
                            // Generic analytics view - show as text for now
                            return null;
                          }
                          if (
                            toolName === "get-authors" ||
                            toolName === "getAuthors"
                          ) {
                            // Generic authors view - show as text for now
                            return null;
                          }
                          if (
                            toolName === "web-search" ||
                            toolName === "webSearch"
                          ) {
                            return (
                              <WebSearchView invocation={part} key={index} />
                            );
                          }

                          if (
                            toolName === "list-media" ||
                            toolName === "listMedia"
                          ) {
                            return (
                              <ListMediaView invocation={part} key={index} />
                            );
                          }

                          if (
                            toolName === "create-blog-auto" ||
                            toolName === "createBlogAuto"
                          ) {
                            return (
                              <CreateBlogAutoView
                                invocation={part}
                                key={index}
                              />
                            );
                          }
                        }

                        return null;
                      })}
                    </MessageContent>
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
              {SUGGESTIONS.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
            <PromptInputProvider>
              <PromptInputForm
                input={input}
                isStreaming={status === "streaming"}
                onClearChat={handleClearChat}
                sendMessage={sendMessage}
                setInput={setInput}
                stop={stop}
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
  stop: () => void;
  isStreaming: boolean;
  input: string;
  setInput: (value: string) => void;
  onClearChat: () => Promise<void>;
}

function PromptInputForm({
  sendMessage,
  stop,
  isStreaming,
  input,
  setInput,
  onClearChat,
}: PromptInputFormProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearChat = async () => {
    if (isStreaming) {
      stop();
    }
    setIsClearing(true);
    try {
      await onClearChat();
    } finally {
      setIsClearing(false);
    }
  };

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
          disabled={isClearing}
          onClick={handleClearChat}
          size="icon"
          title="Clear chat"
          type="button"
          variant="ghost"
        >
          <TrashIcon className="size-4" />
        </Button>
        {isStreaming ? (
          <Button
            className="rounded-lg transition-all hover:scale-105 active:scale-95"
            onClick={() => stop()}
            size="icon"
            title="Stop generation"
            type="button"
            variant="destructive"
          >
            <StopIcon className="size-4" />
          </Button>
        ) : (
          <Button
            className="rounded-lg transition-all hover:scale-105 active:scale-95"
            disabled={!input.trim()}
            size="icon"
            title="Send message"
            type="submit"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        )}
      </div>
    </PromptInput>
  );
}
