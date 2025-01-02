"use client";

import { type LucideIcon, type LucideProps } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export function NavMain({
  items,
  team,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isExternal: boolean;
    isActive?: boolean;
  }[];
  team: {
    name: string;
    logo: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    plan: string;
  };
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{team.name}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              tooltip={item.title}
            >
              <Link
                href={item.url}
                target={item.isExternal ? "_blank" : undefined}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
