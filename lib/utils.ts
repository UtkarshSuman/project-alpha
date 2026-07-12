// FEATURE: cn() helper — merges Tailwind classes safely (avoids conflicting
// classes like "px-2 px-4" both applying). Used by every component.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}