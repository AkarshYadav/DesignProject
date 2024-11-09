import { create } from "zustand";

interface SidebarStore{
    collapsed: boolean;
    onExpend: () => void;
    onCollapse: () => void;
}

export const useSidebar = create<SidebarStore>((set)=>({
    collapsed: false,
    onExpend: () => set({collapsed: false}),
    onCollapse: () => set({collapsed: true})
}))
