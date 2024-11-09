import { Tooltip, 
    TooltipContent,
     TooltipProvider,
     TooltipTrigger } from "./ui/tooltip";

     interface HintProps{
        label: string;
        children: React.ReactNode;
        asChild?:boolean;
        side?: "left" | "right" | "top" | "bottom";
        align?: "start" | "center" | "end";
     };

     export const Hint = ({
            label,
            children,
            asChild,
            side ,
            align 
     }:HintProps) =>{
            return(
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild = {asChild}>
                            {children}
                        </TooltipTrigger>
                        <TooltipContent 
                        side={side}
                        align={align}
                        className="text-black bg-slate-200 rounded-lg">
                          <p className="font-semibold">
                            {label} </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>)
     }