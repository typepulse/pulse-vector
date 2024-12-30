"use client";

import * as React from "react";
import { BookOpen, Key, SquareTerminal } from "lucide-react";

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

export function AppSidebar({ email }: { email: string }) {
  const data = {
    teams: [
      {
        name: "Supavec",
        logo: () => {
          // eslint-disable-next-line @next/next/no-img-element
          return <img src="/logo.png" alt="Supavec" />;
        },
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
        url: "https://github.com/taishikato/supavec",
        icon: BookOpen,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
