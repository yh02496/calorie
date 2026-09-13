import type { FoodItem, FoodSuggestion, MealType, FoodEntry } from "./types";
import { FOOD_DATABASE } from "./foodDatabase";
import { MEAL_ORDER, todayKey } from "./constants";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter((w) => w.length > 1);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function scoreFood(food: FoodItem, inputText: string, tokens: string[]): number {
  let score = 0;
  const normalizedInput = normalize(inputText);

  if (normalizedInput === normalize(food.name)) score += 100;

  for (const kw of food.keywords) {
    const normKw = normalize(kw);
    if (normalizedInput.includes(normKw)) score += 30;
    for (const tok of tokens) {
      if (normKw === tok) score += 15;
      else if (normKw.includes(tok) && tok.length > 2) score += 8;
      else if (tok.includes(normKw) && normKw.length > 2) score += 6;
      else if (tok.length > 3 && normKw.length > 3) {
        const dist = levenshtein(tok, normKw);
        if (dist === 1) score += 5;
        else if (dist === 2 && tok.length > 4) score += 2;
      }
    }
  }
  return score;
}

/* ---------- database search ---------- */

function searchDatabase(input: string): FoodSuggestion[] {
  const tokens = tokenize(input);
  if (tokens.length === 0) return [];

  const scored = FOOD_DATABASE.map((food) => ({
    food,
    confidence: scoreFood(food, input, tokens),
  }));

  const matched = scored.filter((s) => s.confidence > 0);
  matched.sort((a, b) => b.confidence - a.confidence);

  if (matched.length === 0) return [];
  const maxScore = matched[0].confidence;
  return matched.slice(0, 8).map((s) => ({
    food: s.food,
    confidence: Math.min(0.98, Math.max(0.3, (s.confidence / maxScore) * 0.95)),
  }));
}

/* ---------- public API: text search ---------- */

export async function findFoods(input: string): Promise<FoodSuggestion[]> {
  return searchDatabase(input);
}

/* ---------- public API: photo attachment ---------- */
// No AI photo recognition — the filename is used as a best-effort search hint,
// otherwise the user just logs the food manually with the photo attached.

export async function analyzePhoto(file: File): Promise<FoodSuggestion[]> {
  const baseName = file.name
    .replace(/\.(jpg|jpeg|png|webp|heic|gif|bmp)$/i, "")
    .replace(/^(IMG_|photo_|image_)/i, "")
    .replace(/[_-]/g, " ");
  if (!baseName.trim()) return [];
  return searchDatabase(baseName);
}

/* ---------- helpers ---------- */

export function detectMealType(date: Date = new Date()): MealType {
  const hour = date.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export function suggestMealFoods(mealType: MealType): FoodItem[] {
  return FOOD_DATABASE.filter((f) => {
    if (mealType === "breakfast") return ["Breakfast", "Dairy", "Fruit"].includes(f.category);
    if (mealType === "lunch") return ["Lunch", "Salad", "Snack", "Legumes", "Soups", "Seafood"].includes(f.category);
    if (mealType === "dinner") return ["Dinner", "Sides", "Fast Food", "Legumes", "International", "Seafood"].includes(f.category);
    return ["Snack", "Produce", "Fruit", "Nuts & Seeds", "Supplements"].includes(f.category);
  }).slice(0, 12);
}

export function createDraftFromFood(
  food: FoodItem,
  mealType: MealType,
  servings: number = 1,
  source: "text" | "photo" | "manual" = "text"
): Omit<FoodEntry, "id" | "createdAt"> {
  return {
    date: todayKey(),
    mealType,
    name: food.name,
    calories: Math.round(food.calories * servings),
    protein: Math.round(food.protein * servings),
    carbs: Math.round(food.carbs * servings),
    fat: Math.round(food.fat * servings),
    portion: food.servingSize,
    servings,
    source,
  };
}

export const MEAL_TYPES: MealType[] = MEAL_ORDER;
