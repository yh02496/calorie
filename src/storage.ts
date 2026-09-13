import type { AppState, FoodEntry, UserProfile, WeightEntry, WaterEntry, ReminderSettings } from "./types";

const STORAGE_KEY = "nutritrack_state_v1";

const DEFAULT_REMINDERS: ReminderSettings = {
  meals: true,
  water: true,
  weight: true,
  dailyTracking: true,
};

const DEFAULT_STATE: AppState = {
  profile: null,
  foodEntries: [],
  weightEntries: [],
  waterEntries: [],
  reminders: DEFAULT_REMINDERS,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      reminders: { ...DEFAULT_REMINDERS, ...parsed.reminders },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable in some sandbox environments
  }
}

export function addFoodEntry(state: AppState, entry: FoodEntry): AppState {
  return { ...state, foodEntries: [...state.foodEntries, entry] };
}

export function updateFoodEntry(state: AppState, id: string, updates: Partial<FoodEntry>): AppState {
  return {
    ...state,
    foodEntries: state.foodEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  };
}

export function deleteFoodEntry(state: AppState, id: string): AppState {
  return { ...state, foodEntries: state.foodEntries.filter((e) => e.id !== id) };
}

export function addWeightEntry(state: AppState, entry: WeightEntry): AppState {
  const filtered = state.weightEntries.filter((e) => e.date !== entry.date);
  return {
    ...state,
    weightEntries: [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export function addWaterGlasses(state: AppState, date: string, glasses: number): AppState {
  const existing = state.waterEntries.find((e) => e.date === date);
  if (existing) {
    return {
      ...state,
      waterEntries: state.waterEntries.map((e) =>
        e.date === date ? { ...e, glasses: Math.max(0, e.glasses + glasses) } : e
      ),
    };
  }
  const newEntry: WaterEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    date,
    glasses: Math.max(0, glasses),
    createdAt: new Date().toISOString(),
  };
  return { ...state, waterEntries: [...state.waterEntries, newEntry] };
}

export function updateProfile(state: AppState, profile: UserProfile): AppState {
  return { ...state, profile };
}

export function updateReminders(state: AppState, reminders: ReminderSettings): AppState {
  return { ...state, reminders };
}
