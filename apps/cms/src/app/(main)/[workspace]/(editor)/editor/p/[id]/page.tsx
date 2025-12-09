import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Update Post - Astra CMS",
};

function Page() {
  return <PageClient />;
}

export default Page;
