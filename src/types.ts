export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface UserProfile {
  name: string;
  age: number;
  sex: Sex;
  height: number; // cm
  weight: number; // kg (starting weight)
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeight: number; // kg
  createdAt: string;
  dailyCalorieTarget: number;
  proteinTarget: number; // grams
  carbTarget: number; // grams
  fatTarget: number; // grams
  waterTarget: number; // glasses
}

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  portion: string;
  servings: number;
  imageUrl?: string;
  source: "text" | "photo" | "manual";
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  glasses: number;
  createdAt: string;
}

export interface ReminderSettings {
  meals: boolean;
  water: boolean;
  weight: boolean;
  dailyTracking: boolean;
}

export interface AppState {
  profile: UserProfile | null;
  foodEntries: FoodEntry[];
  weightEntries: WeightEntry[];
  waterEntries: WaterEntry[];
  reminders: ReminderSettings;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  keywords: string[];
}

export interface FoodSuggestion {
  food: FoodItem;
  confidence: number;
}

export interface CalcResults {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  deficit: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export interface DayTotals {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodCount: number;
}

export interface PeriodSummary {
  label: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  totalEntries: number;
  daysTracked: number;
  daysInRange: number;
  startWeight: number | null;
  endWeight: number | null;
  weightChange: number | null;
  avgCalorieTarget: number;
  calorieAdherence: number;
  trend: "up" | "down" | "stable";
}
