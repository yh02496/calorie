import type {
  ActivityLevel,
  CalcResults,
  Goal,
  Sex,
  UserProfile,
} from "./types";
import {
  ACTIVITY_FACTORS,
  DAILY_CALORIE_MIN,
  GOAL_ADJUSTMENTS,
  DEFAULT_WATER_TARGET,
} from "./constants";

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const sexAdjust = sex === "male" ? 5 : -161;
  return Math.round(base + sexAdjust);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  const adj = GOAL_ADJUSTMENTS[goal].deficit;
  let target = tdee + adj;
  if (target < DAILY_CALORIE_MIN) target = DAILY_CALORIE_MIN;
  return Math.round(target / 10) * 10;
}

export function calculateMacroTargets(
  calorieTarget: number,
  weight: number
): { proteinTarget: number; carbTarget: number; fatTarget: number } {
  const proteinTarget = Math.max(Math.round((weight * 1.6) / 5) * 5, 50);
  const fatCalories = calorieTarget * 0.25;
  const fatTarget = Math.round(fatCalories / 9 / 5) * 5;
  const proteinCalories = proteinTarget * 4;
  const fatCals = fatTarget * 9;
  const carbCalories = calorieTarget - proteinCalories - fatCals;
  const carbTarget = Math.round(carbCalories / 4 / 5) * 5;
  return { proteinTarget, carbTarget, fatTarget };
}

export function calculateAll(
  weight: number,
  height: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel,
  goal: Goal
): CalcResults {
  const bmr = calculateBMR(weight, height, age, sex);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);
  const { proteinTarget, carbTarget, fatTarget } = calculateMacroTargets(
    calorieTarget,
    weight
  );
  return {
    bmr,
    tdee,
    calorieTarget,
    deficit: calorieTarget - tdee,
    proteinTarget,
    carbTarget,
    fatTarget,
  };
}

export function createProfile(data: {
  name: string;
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeight: number;
}): UserProfile {
  const results = calculateAll(
    data.weight,
    data.height,
    data.age,
    data.sex,
    data.activityLevel,
    data.goal
  );
  return {
    name: data.name,
    age: data.age,
    sex: data.sex,
    height: data.height,
    weight: data.weight,
    activityLevel: data.activityLevel,
    goal: data.goal,
    targetWeight: data.targetWeight,
    createdAt: new Date().toISOString(),
    dailyCalorieTarget: results.calorieTarget,
    proteinTarget: results.proteinTarget,
    carbTarget: results.carbTarget,
    fatTarget: results.fatTarget,
    waterTarget: DEFAULT_WATER_TARGET,
  };
}

export function recalculateProfile(profile: UserProfile): UserProfile {
  const results = calculateAll(
    profile.weight,
    profile.height,
    profile.age,
    profile.sex,
    profile.activityLevel,
    profile.goal
  );
  return {
    ...profile,
    dailyCalorieTarget: results.calorieTarget,
    proteinTarget: results.proteinTarget,
    carbTarget: results.carbTarget,
    fatTarget: results.fatTarget,
  };
}
