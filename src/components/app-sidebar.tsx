"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Home,
  ChefHat,
  BookOpen,
  Heart,
  Calendar,
  User,
  Settings,
  HelpCircle,
  UtensilsCrossed,
  ShoppingBasket,
  Star,
  FolderOpen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// EatRite app navigation data
const data = {
  teams: [
    {
      name: "EatRite",
      logo: ChefHat,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Recipes",
      url: "/recipes",
      icon: ChefHat,
    },
    {
      title: "My Ingredients",
      url: "/ingredients",
      icon: ShoppingBasket,
    },
    {
      title: "Favorites",
      url: "/favorites",
      icon: Heart,
    },
    {
      title: "Meal Plan",
      url: "/meal-plan",
      icon: Calendar,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
  projects: [
    {
      name: "Quick Add Recipe",
      url: "/recipes/add",
      icon: UtensilsCrossed,
    },
    {
      name: "Shopping List",
      url: "/shopping-list",
      icon: ShoppingBasket,
    },
    {
      name: "Nutrition Tracker",
      url: "/nutrition",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={pathname} />
        <NavProjects projects={data.projects} currentPath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
