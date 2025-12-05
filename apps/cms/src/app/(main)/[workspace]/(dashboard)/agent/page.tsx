import type { Metadata } from "next";
import { PageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Agent",
  description: "Interact with the CMS AI Agent",
};

export default function Page() {
  return (
    <div className="flex h-full flex-col bg-background">
      <PageClient />
    </div>
  );
}
