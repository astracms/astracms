"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@astra/ui/components/sidebar";
import { cn } from "@astra/ui/lib/utils";

import {
  BookOpenIcon,
  KeyIcon,
  LinkSimpleBreak,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const items = [
  {
    name: "API Keys",
    url: "keys",
    icon: KeyIcon,
  },
  {
    name: "Webhooks",
    url: "webhooks",
    icon: WebhooksLogoIcon,
  },
  {
    name: "Documentation",
    url: "https://docs.astracms.dev",
    icon: WebhooksLogoIcon,
  },
  {
    name: "Blog",
    url: "https://astracms.dev/blog",
    icon: BookOpenIcon,
  },
];

export function NavDevs() {
  const pathname = usePathname();
  const params = useParams<{ workspace: string }>();
  const { open } = useSidebar();
  const isActive = (url: string) => pathname === `/${params.workspace}/${url}`;

  return (
    <SidebarGroup className={cn(open ? "px-4" : "px-2")}>
      <SidebarGroupLabel>Developers</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={`border border-transparent transition-colors duration-200 hover:bg-sidebar-accent ${
                isActive(item.url)
                  ? "border bg-sidebar-accent text-foreground"
                  : "hover:text-accent-foreground"
              }`}
            >
              <Link href={`/${params.workspace}/${item.url}`}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
