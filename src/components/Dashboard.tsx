import type { AppState, FoodEntry, UserProfile, MealType } from "../types";
import { CalorieRing } from "./CalorieRing";
import { getTodaySummary, getGoalProgress, getWaterForDate, getLatestWeight } from "../selectors";
import { MEAL_LABELS, MEAL_ICONS, MEAL_ORDER, todayKey, formatLongDate } from "../constants";

interface DashboardProps {
  state: AppState;
  profile: UserProfile;
  onAddFood: (mealType?: MealType) => void;
  onEditFood: (entry: FoodEntry) => void;
  onDeleteFood: (id: string) => void;
  onLogWeight: () => void;
  onAddWater: (glasses: number) => void;
}

export function Dashboard({ state, profile, onAddFood, onEditFood, onDeleteFood, onLogWeight, onAddWater }: DashboardProps) {
  const summary = getTodaySummary(state, profile);
  const goalProgress = getGoalProgress(state, profile);
  const waterCount = getWaterForDate(state, todayKey());
  const latestWeight = getLatestWeight(state);
  const todayEntries = state.foodEntries.filter((e) => e.date === todayKey());

  // Group entries by meal
  const mealsByType: Record<MealType, FoodEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  todayEntries.forEach((e) => {
    if (mealsByType[e.mealType]) mealsByType[e.mealType].push(e);
  });

  // Weight change from start
  const weightChange = (latestWeight ?? profile.weight) - profile.weight;

  return (
    <div className="dash">
      {/* Calorie ring */}
      <div className="card calorie-ring-card">
        <CalorieRing consumed={summary.consumed} target={profile.dailyCalorieTarget} />
        <div className="macro-bars">
          <div className="macro-bar">
            <div className="macro-bar-header">
              <span className="macro-name" style={{ color: "var(--protein)" }}>Protein</span>
              <span className="macro-val">{summary.protein} / {profile.proteinTarget}g</span>
            </div>
            <div className="macro-track"><div className="macro-fill protein" style={{ width: `${summary.proteinPct}%` }} /></div>
          </div>
          <div className="macro-bar">
            <div className="macro-bar-header">
              <span className="macro-name" style={{ color: "var(--carbs)" }}>Carbs</span>
              <span className="macro-val">{summary.carbs} / {profile.carbTarget}g</span>
            </div>
            <div className="macro-track"><div className="macro-fill carbs" style={{ width: `${summary.carbPct}%` }} /></div>
          </div>
          <div className="macro-bar">
            <div className="macro-bar-header">
              <span className="macro-name" style={{ color: "var(--fat)" }}>Fat</span>
              <span className="macro-val">{summary.fat} / {profile.fatTarget}g</span>
            </div>
            <div className="macro-track"><div className="macro-fill fat" style={{ width: `${summary.fatPct}%` }} /></div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 16, width: "100%", justifyContent: "space-between", fontSize: 13 }}>
          <span className="text-secondary">{summary.foodCount} foods logged · {Math.round(summary.pct)}% of target</span>
          <span className="fw-600">{summary.remaining > 0 ? `${summary.remaining} cal left` : summary.over > 0 ? `${summary.over} cal over` : "On target"}</span>
        </div>
      </div>

      {/* Weight & Goal */}
      <div className="card">
        <div className="section-title">Weight & Goal</div>
        <div className="weight-display">
          <span className="weight-num">{(latestWeight ?? profile.weight).toFixed(1)}</span>
          <span className="weight-unit">kg</span>
          {weightChange !== 0 && (
            <span className={`weight-change ${weightChange < 0 ? "down" : "up"}`}>
              {weightChange < 0 ? "↓" : "↑"} {Math.abs(weightChange).toFixed(1)} kg
            </span>
          )}
        </div>
        <div className="row" style={{ marginTop: 8, fontSize: 12 }}>
          <span className="text-secondary">Goal: {profile.targetWeight.toFixed(1)} kg</span>
          <span className="spacer"></span>
          <span className="fw-600">{goalProgress.pct.toFixed(0)}% there</span>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-progress-fill" style={{ width: `${goalProgress.pct}%` }} />
        </div>
        <button className="btn btn-secondary mt-12" onClick={onLogWeight}>Log today's weight</button>
      </div>

      {/* Water */}
      <div className="card">
        <div className="section-title">Water · {waterCount} / {profile.waterTarget} glasses</div>
        <div className="water-cups">
          {Array.from({ length: profile.waterTarget }, (_, i) => (
            <button
              key={i}
              className={`water-cup ${i < waterCount ? "filled" : ""}`}
              onClick={() => onAddWater(i < waterCount ? -1 : 1)}
            >
              {i < waterCount ? "💧" : "🥛"}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onAddWater(1)}>+1 glass</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onAddWater(-1)}>−1 glass</button>
        </div>
      </div>

      {/* Meals */}
      <div className="card">
        <div className="section-title">Today's Meals · {formatLongDate(todayKey())}</div>
        {MEAL_ORDER.map((mealType) => {
          const items = mealsByType[mealType];
          const mealCal = items.reduce((s, e) => s + e.calories, 0);
          return (
            <div key={mealType} className="meal-section">
              <div className="meal-header">
                <span className="meal-title">{MEAL_ICONS[mealType]} {MEAL_LABELS[mealType]}</span>
                {mealCal > 0 && <span className="meal-cal">{mealCal} cal</span>}
                <button className="meal-add-btn" onClick={() => onAddFood(mealType)}>+ Add</button>
              </div>
              {items.length === 0 ? (
                <div className="fs-12 text-secondary" style={{ padding: "8px 0" }}>No items logged</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="food-item" onClick={() => onEditFood(item)} style={{ cursor: "pointer" }}>
                    <div className="food-info">
                      <div className="food-name">{item.name}</div>
                      <div className="food-detail">{item.portion} · {item.protein}p {item.carbs}c {item.fat}f {item.imageUrl ? "· 📷" : ""}</div>
                    </div>
                    <div className="food-cal">{item.calories}<span className="unit"> cal</span></div>
                    <button className="food-delete" onClick={(e) => { e.stopPropagation(); onDeleteFood(item.id); }}>×</button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
