import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable unique id (falls back when crypto.randomUUID is unavailable). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Current epoch milliseconds. */
export function now(): number {
  return Date.now();
}

/** Start of the local day for a given date/epoch. */
export function startOfDay(d: Date | number = Date.now()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

