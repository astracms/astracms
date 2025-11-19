import type { Metadata } from "next";
import NewPostPageClient from "./page-client";

export const metadata: Metadata = {
  title: "New Post - Astra",
};

export default function Page() {
  return <NewPostPageClient />;
}
