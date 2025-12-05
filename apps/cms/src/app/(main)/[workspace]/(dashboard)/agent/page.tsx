
import { Metadata } from "next";
import { PageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Agent",
  description: "Interact with the CMS AI Agent",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full bg-background">
      <PageClient />
    </div>
  );
}
