"use client";

import * as React from "react";
import { BookOpen, SquareTerminal, GalleryVerticalEnd } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({
  email,
  team,
}: {
  email: string;
  team:
    | {
        id: string;
        teams: {
          name: string | null;
          id: string;
        };
      }[]
    | null;
}) {
  const data = {
    teams: [
      {
        name: team?.[0]?.teams?.name ?? "Your team",
        logo: GalleryVerticalEnd,
        plan: "Beta",
      },
    ],
    user: {
      name: "User",
      email,
      avatar: "/avatars/user.jpg",
    },
    navMain: [
      {
        isExternal: false,
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      // {
      //   title: "Generate API Key",
      //   url: "/dsahboard/generate-apikey",
      //   icon: Key,
      // },
      {
        title: "Documentation",
        url: "https://github.com/taishikato/supavec/blob/main/packages/api/README.md",
        icon: BookOpen,
        isExternal: true,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} team={data.teams[0]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
