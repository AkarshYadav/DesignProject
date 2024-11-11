'use client'

import { useSidebar } from "@/store/use-sidebar"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export const UserItem = () => {
    const pathname = usePathname()

    // Make the item active if the current route is "/"
    const isActive = pathname === "/"

    const { collapsed } = useSidebar((state) => state);

    return (
        <Button
            variant="ghost"
            className={cn("w-full h-12 hover:bg-slate-200",
                collapsed ? "justify-center" : "justify-start",
                isActive && "bg-slate-200")}>
            <Link href="/">
                <div className={cn("flex items-center w-full gap-x-4",
                    collapsed && "justify-center"
                )}>
                    <GraduationCap />
                    {!collapsed && (<p className="truncate text-lg">
                        Home
                    </p>)}
                </div>
            </Link>
        </Button>
    )
}
