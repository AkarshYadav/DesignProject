import Image from "next/image";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export const Logo = () => {
    return (
        <div className="flex flex-col space-y-3 items-center">
            <div className="bg-white rounded-full p-1">
                <Image
                    src="/pinsearch.svg"
                    alt="Attendease"
                    height={100}
                    width={100}
                />
            </div>
            <div className={cn("flex flex-col items-center justify-center gap-2", font.className)}>
                <p className="text-xl font-semibold">AttendEase</p>
                <p className="text-sm font-medium text-muted-foreground">Let&apos;s attend</p>
            </div>
        </div>
    );
};
