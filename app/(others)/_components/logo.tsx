import Image from "next/image"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import Link from "next/link";

const font = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});
export const Logo = () => {
    return (
        <Link href="/" className="hover:cursor-pointer">
            <div className="flex  items-center gap-x-2 hover:opacity-75 transition">
                <div className=" p-1 lg:mr-0 mr-12 shrink-0 ">
                    <Image
                        src="/pinsearch.svg"
                        alt="attendease logo"
                        height="38"
                        width="38" />
                </div>
                <div className={cn("hidden lg:flex flex-col items-center justify-center ",
                    font.className
                )}><p className="text-lg font-semibold">
                        AttendEase</p>
                </div>

            </div>
        </Link>
    )
}