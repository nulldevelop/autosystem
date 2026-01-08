"use client";

import { motion } from "framer-motion";

export const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.1]"
      style={{
        backgroundImage: `linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
      }}
    />

    {/* Esfera de Luz Verde (Topo Esquerda) */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
        x: [0, 50, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-20 -left-20 w-150 h-150 bg-green-500/20 blur-[120px] rounded-full"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.3, 0.1],
        x: [0, -50, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 right-0 w-175 h-175 bg-orange-500/10 blur-[140px] rounded-full"
    />
  </div>
);
