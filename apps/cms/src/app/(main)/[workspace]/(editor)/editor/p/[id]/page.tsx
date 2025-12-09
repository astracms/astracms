import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Update Post - AstraCMS",
};

function Page() {
  return <PageClient />;
}

export default Page;
