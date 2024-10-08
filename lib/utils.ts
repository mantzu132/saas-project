import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { eachDayOfInterval, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  console.log(current, "current");
  console.log(previous, "previous");

  return ((current - previous) / previous) * 100;
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function fillMissingDays(
  activeDays: Array<{ date: Date; income: number; expenses: number }>,
  startDate: Date,
  endDate: Date,
): Array<{ date: Date; income: number; expenses: number }> {
  if (activeDays.length === 0) return [];

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const transactionsByDate = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    return found || { date: day, income: 0, expenses: 0 };
  });

  return transactionsByDate;
}
