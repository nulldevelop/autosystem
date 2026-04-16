import React from "react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-10 group flex-shrink-0", className)}>
      <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full overflow-visible">
        {/* S - Pista de Titânio (Sólida e Robusta) */}
        <path 
          d="M440 110 H140 L380 256 L80 402 H380" 
          stroke="#333333" 
          strokeWidth="70" 
          strokeLinejoin="miter"
          strokeLinecap="butt"
          className="group-hover:stroke-[#444444] transition-colors duration-500"
        />
        
        {/* A - O Spoiler Neon */}
        <g className="drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:drop-shadow-[0_0_35px_rgba(34,197,94,0.7)] transition-all duration-500">
          <path 
            d="M256 30 L80 450 H180 L256 260 L332 450 H432 L256 30 Z" 
            className="fill-primary" 
          />
          {/* Canal de Ar Aerodinâmico */}
          <path 
            d="M220 370 H292 L305 405 H207 L220 370 Z" 
            className="fill-black/90" 
          />
        </g>
      </svg>
    </div>
  );
}
