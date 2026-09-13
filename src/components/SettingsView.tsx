import type { AppState, UserProfile } from "../types";
import { ACTIVITY_LABELS, GOAL_LABELS } from "../constants";
import { getLatestWeight } from "../selectors";

interface SettingsViewProps {
  state: AppState;
  profile: UserProfile;
  onEditProfile: () => void;
  onResetData: () => void;
  onLogWeight: () => void;
}

export function SettingsView({ state, profile, onEditProfile, onResetData, onLogWeight }: SettingsViewProps) {
  const latestWeight = getLatestWeight(state) ?? profile.weight;

  return (
    <div className="settings-view">
      <div className="profile-info">
        <div className="profile-name">{profile.name}</div>
        <div className="profile-goal">{GOAL_LABELS[profile.goal]}</div>
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="ps-val">{profile.age}</div>
            <div className="ps-label">Age</div>
          </div>
          <div className="profile-stat">
            <div className="ps-val">{profile.height}</div>
            <div className="ps-label">cm</div>
          </div>
          <div className="profile-stat">
            <div className="ps-val">{latestWeight.toFixed(1)}</div>
            <div className="ps-label">kg</div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-row" onClick={onEditProfile} style={{ cursor: "pointer" }}>
          <span className="sr-label">Edit profile</span>
          <span className="sr-value">→</span>
        </div>
        <div className="settings-row" onClick={onLogWeight} style={{ cursor: "pointer" }}>
          <span className="sr-label">Log weight</span>
          <span className="sr-value">→</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-row">
          <span className="sr-label">Activity level</span>
          <span className="sr-value">{ACTIVITY_LABELS[profile.activityLevel].split(" (")[0]}</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Daily calorie target</span>
          <span className="sr-value">{profile.dailyCalorieTarget} cal</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Protein target</span>
          <span className="sr-value">{profile.proteinTarget} g</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Carbs target</span>
          <span className="sr-value">{profile.carbTarget} g</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Fat target</span>
          <span className="sr-value">{profile.fatTarget} g</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Target weight</span>
          <span className="sr-value">{profile.targetWeight.toFixed(1)} kg</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-row">
          <span className="sr-label">Foods logged</span>
          <span className="sr-value">{state.foodEntries.length}</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Weight entries</span>
          <span className="sr-value">{state.weightEntries.length}</span>
        </div>
        <div className="settings-row">
          <span className="sr-label">Tracking since</span>
          <span className="sr-value">{new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={onEditProfile}>Edit Profile</button>
      <button className="btn btn-ghost mt-8" style={{ color: "var(--error)" }} onClick={onResetData}>
        Reset all data
      </button>

      <div className="text-center fs-12 text-secondary mt-24">
        NutriTrack · Your data is stored locally on this device.
      </div>
    </div>
  );
}
