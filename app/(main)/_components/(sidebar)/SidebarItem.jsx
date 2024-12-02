'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/store/use-sidebar"
import Link from "next/link"
import { Hint } from "@/components/hint"
export const SidebarItem = ({ href, icon, label, isActive }) => {
  const { collapsed } = useSidebar((state) => state)

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-12 hover:bg-slate-200",
        collapsed ? "justify-center" : "justify-start",
        isActive && "bg-slate-200"
      )}
    >
      <Link href={href}>
        <div
          className={cn(
            "flex items-center w-full gap-x-4",
            collapsed && "justify-center"
          )}
        >
          {icon}
          {!collapsed && <p className="truncate text-lg">{label}</p>}
        </div>
      </Link>
    </Button>
  )
}