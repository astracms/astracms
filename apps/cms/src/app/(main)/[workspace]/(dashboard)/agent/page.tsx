import type { Metadata } from "next";
import { PageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Astra AI",
  description: "Your AI-powered copilot for content creation",
};

export default function Page() {
  return (
    <div className="flex h-full flex-col bg-background">
      <PageClient />
    </div>
  );
}
