import { Logo } from "../logo"
import  Actions  from "./actions"

export const Navbar = () => {
    return (
        <nav className="fixed top-0 h-20 z-[49] w-full flex items-center justify-between shadow-sm px-2 lg:px-4">
            <Logo></Logo>
            <Actions></Actions>
        </nav>
    )
}