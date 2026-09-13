import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, FoodEntry, UserProfile, WeightEntry, ReminderSettings } from "./types";
import { loadState, saveState } from "./storage";
import { addFoodEntry as addFoodEntryFn, updateFoodEntry as updateFoodEntryFn, deleteFoodEntry as deleteFoodEntryFn, addWeightEntry as addWeightEntryFn, addWaterGlasses, updateProfile as updateProfileFn, updateReminders as updateRemindersFn } from "./storage";
import { generateId } from "./constants";

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  const addFood = useCallback((entry: Omit<FoodEntry, "id" | "createdAt">) => {
    const full: FoodEntry = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    setState((s) => addFoodEntryFn(s, full));
    return full;
  }, []);

  const updateFood = useCallback((id: string, updates: Partial<FoodEntry>) => {
    setState((s) => updateFoodEntryFn(s, id, updates));
  }, []);

  const removeFood = useCallback((id: string) => {
    setState((s) => deleteFoodEntryFn(s, id));
  }, []);

  const logWeight = useCallback((date: string, weight: number) => {
    const entry: WeightEntry = { id: generateId(), date, weight, createdAt: new Date().toISOString() };
    setState((s) => {
      const isLatest = s.weightEntries.length === 0 || date >= s.weightEntries[s.weightEntries.length - 1].date;
      const withWeight = addWeightEntryFn(s, entry);
      if (isLatest && withWeight.profile) {
        return updateProfileFn(withWeight, { ...withWeight.profile, weight });
      }
      return withWeight;
    });
  }, []);

  const addWater = useCallback((date: string, glasses: number) => {
    setState((s) => addWaterGlasses(s, date, glasses));
  }, []);

  const setProfile = useCallback((profile: UserProfile) => {
    setState((s) => updateProfileFn(s, profile));
  }, []);

  const setReminders = useCallback((reminders: ReminderSettings) => {
    setState((s) => updateRemindersFn(s, reminders));
  }, []);

  return {
    state,
    addFood,
    updateFood,
    removeFood,
    logWeight,
    addWater,
    setProfile,
    setReminders,
  };
}

export type AppContextValue = ReturnType<typeof useAppState>;
