import type { AppState, ReminderSettings } from "../types";

interface RemindersViewProps {
  state: AppState;
  onToggle: (key: keyof ReminderSettings, value: boolean) => void;
}

const REMINDER_CONFIG = [
  { key: "meals" as const, icon: "🍽️", name: "Meal reminders", desc: "Get reminded to log breakfast, lunch, and dinner" },
  { key: "water" as const, icon: "💧", name: "Water reminders", desc: "Stay hydrated with regular water check-ins" },
  { key: "weight" as const, icon: "⚖️", name: "Weight reminders", desc: "Daily nudge to step on the scale" },
  { key: "dailyTracking" as const, icon: "📊", name: "Daily tracking summary", desc: "End-of-day summary of your progress" },
];

export function RemindersView({ state, onToggle }: RemindersViewProps) {
  return (
    <div className="reminders-view">
      <div className="card">
        <div className="section-title">Reminders</div>
        <p className="fs-14 text-secondary mb-16">
          Stay on track with gentle reminders. Toggle the types of notifications you'd like to receive.
        </p>
        {REMINDER_CONFIG.map((cfg) => (
          <div key={cfg.key} className="reminder-item" style={{ boxShadow: "none", marginBottom: 0, borderRadius: 0, borderBottom: "1px solid var(--border)" }}>
            <div className="reminder-info">
              <span className="reminder-icon">{cfg.icon}</span>
              <div>
                <div className="reminder-name">{cfg.name}</div>
                <div className="reminder-desc">{cfg.desc}</div>
              </div>
            </div>
            <button
              className={`toggle ${state.reminders[cfg.key] ? "on" : ""}`}
              onClick={() => onToggle(cfg.key, !state.reminders[cfg.key])}
              aria-label={`Toggle ${cfg.name}`}
            >
              <span className="knob"></span>
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-16">
        <div className="section-title">Today's Check-ins</div>
        <ReminderChecklist state={state} />
      </div>
    </div>
  );
}

function ReminderChecklist({ state }: { state: AppState }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayFood = state.foodEntries.filter((e) => e.date === today);
  const todayWater = state.waterEntries.find((e) => e.date === today);
  const todayWeight = state.weightEntries.find((e) => e.date === today);

  const items = [
    { label: "Log breakfast", done: todayFood.some((e) => e.mealType === "breakfast"), icon: "🍳" },
    { label: "Log lunch", done: todayFood.some((e) => e.mealType === "lunch"), icon: "🥗" },
    { label: "Log dinner", done: todayFood.some((e) => e.mealType === "dinner"), icon: "🍽️" },
    { label: "Drink 8 glasses of water", done: (todayWater?.glasses ?? 0) >= 8, icon: "💧" },
    { label: "Log your weight", done: !!todayWeight, icon: "⚖️" },
  ];

  return (
    <div className="flex-col gap-12">
      {items.map((item) => (
        <div key={item.label} className="row gap-12">
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span className={`fs-14 ${item.done ? "fw-600" : "text-secondary"}`} style={{ flex: 1 }}>
            {item.label}
          </span>
          <span style={{ fontSize: 20 }}>{item.done ? "✅" : "⬜"}</span>
        </div>
      ))}
    </div>
  );
}
