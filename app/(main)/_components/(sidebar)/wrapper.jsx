"use client"
import { useSidebar } from "@/store/use-sidebar";

import { cn } from "@/lib/utils";


// interface WrapperProps {
//     children: React.ReactNode;
// }
export const Wrapper = ({ children }) => {
    const { collapsed } = useSidebar((state) => state);
    return (
        <aside className={cn("fixed left-0  border-r border-gray-200 h-full flex flex-col w-60 z-50 "
            , collapsed && "w-[70px]"
        )}>

            {children}
        </aside>
    );
}
