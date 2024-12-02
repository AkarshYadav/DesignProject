"use client";

import React from 'react';
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/store/use-sidebar";
import { useMediaQuery } from "usehooks-ts";
const Actions = () => {
    const { data: session, status } = useSession();
    const { collapsed } = useSidebar((state) => state)
    const matches = useMediaQuery("(max-width: 1024px)")
    if (status === "loading") {
        return <div className="h-8 w-8 animate-pulse bg-slate-200 rounded-full" />;
    }

    if (!session?.user) {
        return null;
    }

    // Extract username from email (before @) for routing
    const username = session.user.email?.split('@')[0] || '';

    return (
        <div className="flex items-center gap-x-2 ml-2 lg:ml-0 justify-end">
          {!matches &&( <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-primary"
                        >
                            <Plus className="h-8 w-8 mx-2 hover:bg-slate-600 " />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                    <DropdownMenuContent align="end">
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
            </div>)}
        </div>
    );
};

export default Actions;