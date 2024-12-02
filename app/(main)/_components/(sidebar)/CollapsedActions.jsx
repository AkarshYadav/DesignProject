import React from 'react'
import { cn } from "@/lib/utils"
import {      
    DropdownMenu,      
    DropdownMenuTrigger,      
    DropdownMenuContent,      
    DropdownMenuItem,      
    DropdownMenuSeparator  
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useMediaQuery } from "usehooks-ts";
export const CollapsedActions = ({ session, username }) => {

    const matches = useMediaQuery("(max-width: 1024px)")
  

    if (!matches) return null;

    return (
        <div className={cn(
            "fixed left-4 flex flex-col space-y-2 items-center",
            "bottom-[5vh]", // 5% from the bottom of the viewport
            "w-[var(--sidebar-width)]"
        )}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-primary"
                    >
                        <Plus className="h-8 w-8 mx-2 hover:bg-slate-600" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                        <Link href={`/u/${username}/join-class`} className="w-full">
                            Join Class
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href={`/u/${username}/create-class`} className="w-full">
                            Create Class
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={session.user.image || ''}
                            alt={session.user.name || 'User avatar'}
                        />
                        <AvatarFallback>
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                        <span className="w-full text-sm font-medium">
                            {session.user.name || session.user.email}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-sm cursor-pointer"
                        onClick={() => signOut()}
                    >
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}