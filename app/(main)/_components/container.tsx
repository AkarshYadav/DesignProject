"use client"
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { useSidebar } from "@/store/use-sidebar";
interface ContainerProps {
    children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
    const matches = useMediaQuery("(max-width: 1024px)")
    const { collapsed, onCollapse, onExpend } = useSidebar((state) => state)
    useEffect(() => {
        if (matches) {
            onCollapse()
        } else {
            onExpend()
        }
    }, [matches, onCollapse, onExpend])
    return (
        <div className={cn("flex-1",
            collapsed ? "ml-[70px]" : "ml-[70px] lg:ml-60"
        )}>
            {children}
        </div>
    )
}