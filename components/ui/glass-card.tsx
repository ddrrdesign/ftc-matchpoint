import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: "none" | "violet" | "red" | "blue";
};

const glowClass: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  none: "",
  violet:
    "shadow-[0_0_60px_-12px_rgba(139,92,246,0.25),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
  red: "shadow-[0_0_48px_-10px_rgba(239,68,68,0.2),inset_0_1px_0_0_rgba(255,255,255,0.04)]",
  blue: "shadow-[0_0_48px_-10px_rgba(59,130,246,0.2),inset_0_1px_0_0_rgba(255,255,255,0.04)]",
};

export function GlassCard({
  children,
  className = "",
  glow = "none",
}: GlassCardProps) {
  return (
    <div
      className={`rounded-[1.35rem] border border-white/[0.09] bg-white/[0.035] backdrop-blur-sm ${glowClass[glow]} ${className}`}
    >
      {children}
    </div>
  );
}
