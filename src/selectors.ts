import type { AppState, FoodEntry, UserProfile, DayTotals, PeriodSummary } from "./types";
import { addDays, todayKey } from "./constants";

export function getFoodEntriesForDate(state: AppState, date: string): FoodEntry[] {
  return state.foodEntries.filter((e) => e.date === date);
}

export function getDayTotals(state: AppState, date: string): DayTotals {
  const entries = getFoodEntriesForDate(state, date);
  return entries.reduce(
    (acc, e) => ({
      date,
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      foodCount: acc.foodCount + 1,
    }),
    { date, calories: 0, protein: 0, carbs: 0, fat: 0, foodCount: 0 }
  );
}

export function getWaterForDate(state: AppState, date: string): number {
  const entry = state.waterEntries.find((e) => e.date === date);
  return entry ? entry.glasses : 0;
}

export function getLatestWeight(state: AppState): number | null {
  if (state.weightEntries.length === 0) return state.profile?.weight ?? null;
  return state.weightEntries[state.weightEntries.length - 1].weight;
}

export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = start;
  let count = 0;
  while (current <= end && count < 400) {
    dates.push(current);
    current = addDays(current, 1);
    count++;
  }
  return dates;
}

export function getDayTotalsForRange(state: AppState, start: string, end: string): DayTotals[] {
  const dates = getDateRange(start, end);
  return dates.map((d) => getDayTotals(state, d));
}

export function getPeriodSummary(
  state: AppState,
  start: string,
  end: string,
  label: string,
  profile: UserProfile
): PeriodSummary {
  const totals = getDayTotalsForRange(state, start, end);
  const daysInRange = totals.length;
  const daysTracked = totals.filter((t) => t.foodCount > 0).length;

  const totalCalories = totals.reduce((sum, t) => sum + t.calories, 0);
  const totalProtein = totals.reduce((sum, t) => sum + t.protein, 0);
  const totalCarbs = totals.reduce((sum, t) => sum + t.carbs, 0);
  const totalFat = totals.reduce((sum, t) => sum + t.fat, 0);

  const avgCalories = daysTracked > 0 ? totalCalories / daysTracked : 0;
  const avgProtein = daysTracked > 0 ? totalProtein / daysTracked : 0;
  const avgCarbs = daysTracked > 0 ? totalCarbs / daysTracked : 0;
  const avgFat = daysTracked > 0 ? totalFat / daysTracked : 0;

  const weights = state.weightEntries.filter((w) => w.date >= start && w.date <= end);
  const startWeight = weights.length > 0 ? weights[0].weight : null;
  const endWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const weightChange = startWeight !== null && endWeight !== null ? endWeight - startWeight : null;

  const withinTarget = totals.filter((t) => {
    if (t.foodCount === 0) return false;
    const pct = t.calories / profile.dailyCalorieTarget;
    return pct >= 0.85 && pct <= 1.15;
  }).length;
  const calorieAdherence = daysTracked > 0 ? (withinTarget / daysTracked) * 100 : 0;

  let trend: "up" | "down" | "stable" = "stable";
  if (totals.length >= 4) {
    const half = Math.floor(totals.length / 2);
    const firstHalf = totals.slice(0, half).filter((t) => t.foodCount > 0);
    const secondHalf = totals.slice(half).filter((t) => t.foodCount > 0);
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const avgFirst = firstHalf.reduce((s, t) => s + t.calories, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, t) => s + t.calories, 0) / secondHalf.length;
      const diff = avgSecond - avgFirst;
      if (diff > avgFirst * 0.05) trend = "up";
      else if (diff < -avgFirst * 0.05) trend = "down";
    }
  }

  return {
    label,
    avgCalories: Math.round(avgCalories),
    avgProtein: Math.round(avgProtein),
    avgCarbs: Math.round(avgCarbs),
    avgFat: Math.round(avgFat),
    totalEntries: totals.reduce((s, t) => s + t.foodCount, 0),
    daysTracked,
    daysInRange,
    startWeight,
    endWeight,
    weightChange,
    avgCalorieTarget: profile.dailyCalorieTarget,
    calorieAdherence: Math.round(calorieAdherence),
    trend,
  };
}

export function getTodaySummary(state: AppState, profile: UserProfile) {
  const today = todayKey();
  const totals = getDayTotals(state, today);
  const target = profile.dailyCalorieTarget;
  const consumed = totals.calories;
  const remaining = Math.max(0, target - consumed);
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const over = consumed > target;
  return {
    date: today,
    consumed,
    remaining: over ? 0 : remaining,
    over: over ? consumed - target : 0,
    pct,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    proteinTarget: profile.proteinTarget,
    carbTarget: profile.carbTarget,
    fatTarget: profile.fatTarget,
    proteinPct: profile.proteinTarget > 0 ? Math.min(100, (totals.protein / profile.proteinTarget) * 100) : 0,
    carbPct: profile.carbTarget > 0 ? Math.min(100, (totals.carbs / profile.carbTarget) * 100) : 0,
    fatPct: profile.fatTarget > 0 ? Math.min(100, (totals.fat / profile.fatTarget) * 100) : 0,
    foodCount: totals.foodCount,
  };
}

export function getGoalProgress(state: AppState, profile: UserProfile) {
  const currentWeight = getLatestWeight(state) ?? profile.weight;
  const startWeight = profile.weight;
  const targetWeight = profile.targetWeight;
  const totalToLose = Math.abs(startWeight - targetWeight);
  const lostSoFar = Math.abs(startWeight - currentWeight);
  const direction = profile.goal === "lose" ? "lose" : profile.goal === "gain" ? "gain" : "maintain";
  const pct = totalToLose > 0 ? Math.min(100, (lostSoFar / totalToLose) * 100) : 100;
  return { startWeight, currentWeight, targetWeight, totalToLose, lostSoFar, pct, direction };
}

export function getWeightChartData(state: AppState) {
  return state.weightEntries.map((w) => ({
    date: w.date,
    weight: w.weight,
    label: new Date(w.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
}

export function getCalorieChartData(state: AppState, days: number = 7) {
  const today = todayKey();
  const start = addDays(today, -(days - 1));
  const totals = getDayTotalsForRange(state, start, today);
  return totals.map((t) => ({
    date: t.date,
    calories: t.calories,
    label: new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
  }));
}
