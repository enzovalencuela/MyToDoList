"use client";

interface NexgenLogoProps {
  className?: string;
}

export default function NexgenLogo({ className = "" }: NexgenLogoProps) {
  return <img src="/nexgen-logo-icon.png" alt="Nexgen" className={className} />;
}
