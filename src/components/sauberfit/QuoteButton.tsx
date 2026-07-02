"use client";

import { useLead } from "./LeadProvider";

export function QuoteButton({
  children,
  variant = "dark",
  size,
  service,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "dark" | "green" | "outline";
  size?: "lg";
  service?: string;
  className?: string;
}) {
  const { open } = useLead();
  return (
    <button
      className={`sf-btn sf-btn-${variant}${size === "lg" ? " sf-btn-lg" : ""} ${className}`}
      onClick={() => open(service)}
    >
      {children}
    </button>
  );
}
