"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const GlassBackground = React.memo(
  ({ className }: { className?: string }) => {
    return (
      <div
        className={cn(
          "absolute inset-0 h-full w-full overflow-hidden",
          className,
        )}
      >
        {/* Main dark background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        
        {/* Animated floating orbs */}
        <div className="absolute inset-0">
          {/* Large orb - top left */}
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Medium orb - top right */}
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 blur-2xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          
          {/* Small orb - bottom left */}
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 blur-xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
          
          {/* Medium orb - bottom right */}
          <motion.div
            className="absolute -bottom-40 -right-40 w-70 h-70 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          
          {/* Center orb */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-slate-500/10 to-gray-500/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-sm" />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
            animate={{
              backgroundPosition: ['0px 0px', '50px 50px'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  },
);

GlassBackground.displayName = "GlassBackground";
