// Adapted from Toolcraft, Copyright (c) 2026 Pixel Point. MIT; see LICENSE.toolcraft.md.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
