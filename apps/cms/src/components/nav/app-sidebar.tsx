import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@astra/ui/components/sidebar";
import { NavDevs } from "./nav-devs";
import { NavMain } from "./nav-main";
import { SidebarFooterContent } from "./sidebar-footer-content";
import { StatusCards } from "./status-cards";
import { WorkspaceSwitcher } from "./workspace-switcher";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-none">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavDevs />
        <StatusCards />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  );
}
