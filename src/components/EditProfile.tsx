import { useState } from "react";
import type { ActivityLevel, Goal, Sex, UserProfile } from "../types";
import { ACTIVITY_LABELS, ACTIVITY_ORDER, GOAL_LABELS } from "../constants";
import { recalculateProfile } from "../calculations";

interface EditProfileProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export function EditProfile({ profile, onClose, onSave }: EditProfileProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [height, setHeight] = useState(String(profile.height));
  const [weight, setWeight] = useState(String(profile.weight));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeight));

  const handleSave = () => {
    const updated = recalculateProfile({
      ...profile,
      name: name || "User",
      age: parseInt(age) || profile.age,
      sex,
      height: parseFloat(height) || profile.height,
      weight: parseFloat(weight) || profile.weight,
      activityLevel,
      goal,
      targetWeight: parseFloat(targetWeight) || profile.weight,
    });
    onSave(updated);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field-group">
            <label className="label">Name</label>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="edit-field-row">
            <div className="field-group">
              <label className="label">Age</label>
              <input className="input" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="label">Sex</label>
              <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="edit-field-row">
            <div className="field-group">
              <label className="label">Height (cm)</label>
              <input className="input" type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label className="label">Activity level</label>
            <select className="select" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
              {ACTIVITY_ORDER.map((lvl) => (
                <option key={lvl} value={lvl}>{ACTIVITY_LABELS[lvl]}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="label">Goal</label>
            <select className="select" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                <option key={g} value={g}>{GOAL_LABELS[g]}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="label">Target weight (kg)</label>
            <input className="input" type="number" inputMode="decimal" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          </div>
          <button className="btn mt-16" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
