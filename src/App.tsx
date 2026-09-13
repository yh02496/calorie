import { useState } from "react";
import type { FoodEntry, MealType, UserProfile, ReminderSettings } from "./types";
import { useAppState } from "./useAppState";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { ProgressView } from "./components/ProgressView";
import { RemindersView } from "./components/RemindersView";
import { SettingsView } from "./components/SettingsView";
import { LogFood } from "./components/LogFood";
import { EditProfile } from "./components/EditProfile";
import { WeightLogModal } from "./components/WeightLogModal";
import { formatLongDate, todayKey } from "./constants";

type Tab = "dashboard" | "progress" | "reminders" | "settings";

export function App() {
  const {
    state,
    addFood,
    updateFood,
    removeFood,
    logWeight,
    addWater,
    setProfile,
    setReminders,
  } = useAppState();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [showLogFood, setShowLogFood] = useState(false);
  const [logFoodMeal, setLogFoodMeal] = useState<MealType | undefined>(undefined);
  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showWeightLog, setShowWeightLog] = useState(false);

  // Onboarding
  if (!state.profile) {
    return (
      <Onboarding
        onComplete={(profile: UserProfile) => setProfile(profile)}
      />
    );
  }

  const profile = state.profile;

  const handleAddFoodClick = (mealType?: MealType) => {
    setEditEntry(null);
    setLogFoodMeal(mealType);
    setShowLogFood(true);
  };

  const handleEditFood = (entry: FoodEntry) => {
    setEditEntry(entry);
    setLogFoodMeal(entry.mealType);
    setShowLogFood(true);
  };

  const handleLogFoodSubmit = (entry: Omit<FoodEntry, "id" | "createdAt">) => {
    if (editEntry) {
      updateFood(editEntry.id, entry);
    } else {
      addFood(entry);
    }
  };

  const handleResetData = () => {
    if (confirm("This will permanently delete ALL your data — profile, food logs, weight history, and water tracking. This cannot be undone. Are you sure?")) {
      try {
        localStorage.removeItem("nutritrack_state_v1");
      } catch { /* ignore */ }
      window.location.reload();
    }
  };

  const handleToggleReminder = (key: keyof ReminderSettings, value: boolean) => {
    setReminders({ ...state.reminders, [key]: value });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>NutriTrack</h1>
          <div className="date">{formatLongDate(todayKey())}</div>
        </div>
        <div className="row gap-8">
          {tab === "dashboard" && (
            <button
              onClick={() => setShowWeightLog(true)}
              style={{ fontSize: 22, padding: 8 }}
              aria-label="Log weight"
            >⚖️</button>
          )}
          <button
            onClick={() => setTab("settings")}
            style={{ fontSize: 22, padding: 8 }}
            aria-label="Settings"
          >⚙️</button>
        </div>
      </header>

      <div className="app-content">
        {tab === "dashboard" && (
          <Dashboard
            state={state}
            profile={profile}
            onAddFood={handleAddFoodClick}
            onEditFood={handleEditFood}
            onDeleteFood={removeFood}
            onLogWeight={() => setShowWeightLog(true)}
            onAddWater={(g) => addWater(todayKey(), g)}
          />
        )}
        {tab === "progress" && (
          <ProgressView state={state} profile={profile} />
        )}
        {tab === "reminders" && (
          <RemindersView state={state} onToggle={handleToggleReminder} />
        )}
        {tab === "settings" && (
          <SettingsView
            state={state}
            profile={profile}
            onEditProfile={() => setShowEditProfile(true)}
            onResetData={handleResetData}
            onLogWeight={() => setShowWeightLog(true)}
          />
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => handleAddFoodClick()} aria-label="Add food">+</button>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button className={`nav-btn ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>
          <span className="nav-icon">🏠</span>
          <span>Today</span>
        </button>
        <button className={`nav-btn ${tab === "progress" ? "active" : ""}`} onClick={() => setTab("progress")}>
          <span className="nav-icon">📈</span>
          <span>Progress</span>
        </button>
        <button className={`nav-btn ${tab === "reminders" ? "active" : ""}`} onClick={() => setTab("reminders")}>
          <span className="nav-icon">🔔</span>
          <span>Reminders</span>
        </button>
        <button className={`nav-btn ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
          <span className="nav-icon">⚙️</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* Modals */}
      {showLogFood && (
        <LogFood
          onClose={() => { setShowLogFood(false); setEditEntry(null); }}
          onAdd={handleLogFoodSubmit}
          defaultMealType={logFoodMeal}
          editEntry={editEntry}
        />
      )}
      {showEditProfile && (
        <EditProfile
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={setProfile}
        />
      )}
      {showWeightLog && (
        <WeightLogModal
          state={state}
          onClose={() => setShowWeightLog(false)}
          onLog={logWeight}
        />
      )}
    </div>
  );
}

export default App;
