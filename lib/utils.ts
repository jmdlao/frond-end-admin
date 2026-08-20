import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numbers into Philippine Peso currency string with thousand separators and 2 decimal places.
 * Example: 115390 -> "₱115,390.00"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const numericAmount = Number(amount) || 0;
  return `₱${numericAmount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
