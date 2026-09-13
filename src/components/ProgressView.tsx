import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from "recharts";
import type { AppState, UserProfile } from "../types";
import { getCalorieChartData, getWeightChartData, getPeriodSummary, getGoalProgress } from "../selectors";
import { addDays, todayKey, formatShortDate } from "../constants";

interface ProgressViewProps {
  state: AppState;
  profile: UserProfile;
}

type Period = "week" | "month" | "all";

export function ProgressView({ state, profile }: ProgressViewProps) {
  const [period, setPeriod] = useState<Period>("week");

  const today = todayKey();
  const start = period === "week" ? addDays(today, -6) : period === "month" ? addDays(today, -29) : addDays(today, -89);
  const days = period === "week" ? 7 : period === "month" ? 30 : 90;

  const calorieData = getCalorieChartData(state, days);
  const weightData = getWeightChartData(state).slice(-days);
  const summary = getPeriodSummary(state, start, today, period, profile);
  const goalProgress = getGoalProgress(state, profile);

  const periodLabel = period === "week" ? "7 days" : period === "month" ? "30 days" : "90 days";

  return (
    <div className="progress-view">
      <div className="period-tabs">
        <button className={`period-tab ${period === "week" ? "active" : ""}`} onClick={() => setPeriod("week")}>Week</button>
        <button className={`period-tab ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>Month</button>
        <button className={`period-tab ${period === "all" ? "active" : ""}`} onClick={() => setPeriod("all")}>3 Months</button>
      </div>

      {/* Calorie chart */}
      <div className="chart-card">
        <h3>Calorie Intake</h3>
        <div className="chart-sub">Last {periodLabel} · Target: {profile.dailyCalorieTarget} cal/day</div>
        {calorieData.every((d) => d.calories === 0) ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No food logged in this period yet.</p>
          </div>
        ) : (
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={period === "all" ? 6 : 0} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
                  formatter={(v: number) => [`${v} cal`, "Calories"]}
                />
                <ReferenceLine y={profile.dailyCalorieTarget} stroke="#000" strokeDasharray="4 4" strokeOpacity={0.3} />
                <Bar dataKey="calories" fill="#000" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weight chart */}
      <div className="chart-card">
        <h3>Weight Progress</h3>
        <div className="chart-sub">
          Current: {(goalProgress.currentWeight ?? profile.weight).toFixed(1)} kg → Goal: {profile.targetWeight.toFixed(1)} kg
        </div>
        {weightData.length < 2 ? (
          <div className="empty-state">
            <div className="empty-icon">⚖️</div>
            <p>Log your weight regularly to see progress.<br />You need at least 2 entries.</p>
          </div>
        ) : (
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(weightData.length / 5))} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13 }}
                  formatter={(v: number) => [`${v} kg`, "Weight"]}
                />
                <ReferenceLine y={profile.targetWeight} stroke="#16A34A" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Line type="monotone" dataKey="weight" stroke="#000" strokeWidth={2.5} dot={{ r: 3, fill: "#000" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="chart-card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h3>{period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Quarterly"} Summary</h3>
          {summary.trend !== "stable" && (
            <span className={`trend-badge ${summary.trend}`}>
              {summary.trend === "up" ? "↑ Trending up" : "↓ Trending down"}
            </span>
          )}
        </div>
        <div className="chart-sub">{formatShortDate(start)} – {formatShortDate(today)}</div>
        <div className="summary-grid mt-12">
          <div className="summary-stat">
            <div className="stat-label">Avg calories</div>
            <div className="stat-value">{summary.avgCalories}<span className="stat-unit"> cal</span></div>
            <div className="stat-extra">Target: {summary.avgCalorieTarget}</div>
          </div>
          <div className="summary-stat">
            <div className="stat-label">Adherence</div>
            <div className="stat-value">{summary.calorieAdherence}<span className="stat-unit">%</span></div>
            <div className="stat-extra">Days on target</div>
          </div>
          <div className="summary-stat">
            <div className="stat-label">Avg protein</div>
            <div className="stat-value">{summary.avgProtein}<span className="stat-unit"> g</span></div>
            <div className="stat-extra">Target: {profile.proteinTarget}g</div>
          </div>
          <div className="summary-stat">
            <div className="stat-label">Avg carbs</div>
            <div className="stat-value">{summary.avgCarbs}<span className="stat-unit"> g</span></div>
            <div className="stat-extra">Target: {profile.carbTarget}g</div>
          </div>
          <div className="summary-stat">
            <div className="stat-label">Avg fat</div>
            <div className="stat-value">{summary.avgFat}<span className="stat-unit"> g</span></div>
            <div className="stat-extra">Target: {profile.fatTarget}g</div>
          </div>
          <div className="summary-stat">
            <div className="stat-label">Weight change</div>
            <div className="stat-value" style={{ color: summary.weightChange === null ? "var(--textSecondary)" : summary.weightChange < 0 ? "var(--success)" : summary.weightChange > 0 ? "var(--error)" : "var(--text)" }}>
              {summary.weightChange === null ? "—" : `${summary.weightChange > 0 ? "+" : ""}${summary.weightChange.toFixed(1)}`}
              <span className="stat-unit"> kg</span>
            </div>
            <div className="stat-extra">{summary.daysTracked} of {summary.daysInRange} days tracked</div>
          </div>
        </div>
      </div>

      {/* Goal progress */}
      <div className="chart-card">
        <h3>Goal Progress</h3>
        <div className="chart-sub">
          {goalProgress.direction === "lose" ? "Losing" : goalProgress.direction === "gain" ? "Gaining" : "Maintaining"} weight
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <div className="text-center">
            <div className="fs-12 text-secondary">Start</div>
            <div className="fw-700" style={{ fontSize: 18 }}>{goalProgress.startWeight.toFixed(1)} kg</div>
          </div>
          <div className="text-center">
            <div className="fs-12 text-secondary">Current</div>
            <div className="fw-700" style={{ fontSize: 18 }}>{goalProgress.currentWeight.toFixed(1)} kg</div>
          </div>
          <div className="text-center">
            <div className="fs-12 text-secondary">Goal</div>
            <div className="fw-700" style={{ fontSize: 18 }}>{goalProgress.targetWeight.toFixed(1)} kg</div>
          </div>
        </div>
        <div className="goal-progress-bar mt-16">
          <div className="goal-progress-fill" style={{ width: `${goalProgress.pct}%` }} />
        </div>
        <div className="text-center fs-12 text-secondary mt-8">{goalProgress.pct.toFixed(0)}% of the way to your goal</div>
      </div>
    </div>
  );
}
