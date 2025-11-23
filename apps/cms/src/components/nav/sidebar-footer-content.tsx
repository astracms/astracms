"use client";

import { useSidebar } from "@astra/ui/components/sidebar";
import { NavUser } from "./nav-user";

export function SidebarFooterContent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <div className="flex justify-center p-1">
        <NavUser />
      </div>
    );
  }

  return (
    <section className="p-2">
      <NavUser />
    </section>
  );
}
