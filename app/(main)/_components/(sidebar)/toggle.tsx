"use client"
import { useSidebar } from "@/store/use-sidebar"
import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react"

export const Toggle = () => {
    const { collapsed, onExpend, onCollapse } = useSidebar((state) => state)
    const label = collapsed ? "Expend" : "Collapse"
    return (
        <>
            {collapsed && (
                <div className="hidden lg:flex items-center w-full p-3">
                    <Hint label={label} asChild side="right" >

                        <Button
                            onClick={onExpend}
                            variant="ghost"
                            className="p-2 h-auto m-auto">
                            <ArrowRightFromLine className="w-4 h-4" />

                        </Button>
                    </Hint>
                </div>
            )}
            {!collapsed && (
                <div className="flex items-center p-3 w-full pl-6">

                    <Hint label={label} side="right" asChild>

                        <Button
                            onClick={onCollapse}
                            variant="ghost"
                            className="ml-auto p-2 h-auto">
                            <ArrowLeftFromLine className="w-4 h-4" />
                            {/* <span className="ml-2">{label}</span> */}
                        </Button>
                    </Hint>
                </div>
            )}
        </>
    )
}