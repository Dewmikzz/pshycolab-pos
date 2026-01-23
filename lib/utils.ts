import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
    }).format(amount).replace("MYR", "RM");
}

export function roundToNearestFiveCents(amount: number): number {
    return Math.round(amount * 20) / 20;
}

export function calculateRoundingAdjustment(rawTotal: number): number {
    const rounded = roundToNearestFiveCents(rawTotal);
    return rounded - rawTotal;
}
