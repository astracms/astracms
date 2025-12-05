"use client";

import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "@ai-sdk/react";
import type { CMSAgentUIMessage } from "@/lib/ai/agent";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
  MessageAction,
} from "@astra/ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputAttachments,
  PromptInputAttachment,
} from "@astra/ui/components/ai-elements/prompt-input";
import { Button } from "@astra/ui/components/button";
import { ScrollArea } from "@astra/ui/components/scroll-area";
import { ArrowClockwiseIcon, ArrowUpIcon, CopyIcon, StopCircleIcon } from "@phosphor-icons/react";
import { AddCategoryView, AddTagView, CreatePostView, SearchView } from "@/components/agent/tool-views";

export function PageClient() {
  const { status, sendMessage, messages } = useChat<CMSAgentUIMessage>({
    onError: (error: Error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 py-6" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-8 pb-32">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">How can I help you today?</h2>
                  <p className="text-muted-foreground max-w-md">
                    I can help you manage your content, create tags, find posts, and more.
                  </p>
                </motion.div>
              )}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Message from={message.role === "user" ? "user" : "assistant"}>
                    <MessageContent>
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return <MessageResponse key={index}>{part.text}</MessageResponse>;

                          case "step-start":
                            return index > 0 ? (
                              <div key={index} className="my-3">
                                <hr className="border-border" />
                              </div>
                            ) : null;

                          case "tool-addTag":
                            return <AddTagView key={index} invocation={part} />;

                          case "tool-addCategory":
                            return <AddCategoryView key={index} invocation={part} />;

                          case "tool-createPost":
                            return <CreatePostView key={index} invocation={part} />;

                          case "tool-search":
                            return <SearchView key={index} invocation={part} />;

                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                    {message.role === "assistant" && status !== "streaming" && (
                       <MessageToolbar>
                         <div className="flex items-center gap-1">
                           <MessageAction 
                             tooltip="Copy" 
                             onClick={() => {
                               // Extract text parts for copying
                               const textContent = message.parts
                                 .filter((part) => part.type === "text")
                                 .map((part) => part.type === "text" ? part.text : "")
                                 .join("\n\n");
                               navigator.clipboard.writeText(textContent);
                               toast.success("Copied to clipboard");
                             }}
                           >
                             <CopyIcon className="size-4" />
                           </MessageAction>
                         </div>
                       </MessageToolbar>
                    )}
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>
            {status === "streaming" && (
              <div className="flex justify-center">
                <div className="text-sm text-muted-foreground">Thinking...</div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background to-transparent pt-10 pb-6">
          <div className="mx-auto max-w-3xl px-4">
             <PromptInputProvider>
               <PromptInputForm 
                 sendMessage={sendMessage} 
                 isStreaming={status === "streaming"}
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
}

function PromptInputForm({ sendMessage, isStreaming }: PromptInputFormProps) {
    const [input, setInput] = useState("");

    return (
        <PromptInput
            onSubmit={(message, e) => {
                e.preventDefault();
                if (!input.trim() || isStreaming) return;
                
                sendMessage({ text: input });
                setInput("");
            }}
            className="relative overflow-hidden rounded-xl border bg-background shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20"
        >
            <PromptInputAttachments>
                {(file) => <PromptInputAttachment data={file} />}
            </PromptInputAttachments>
            <div className="flex w-full items-center gap-2">
                {/* <PromptInputActionAddAttachments /> */}
                <input
                  className="flex-1 bg-transparent px-2 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button 
                    size="icon" 
                    type="submit" 
                    disabled={isStreaming || !input.trim()}
                    className="rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                    <ArrowUpIcon className="size-4" />
                </Button>
            </div>
        </PromptInput>
    )
}
