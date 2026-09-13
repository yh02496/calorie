import { useState } from "react";
import type { ActivityLevel, Goal, Sex } from "../types";
import { createProfile } from "../calculations";
import { ACTIVITY_LABELS, ACTIVITY_ORDER, GOAL_LABELS } from "../constants";
import type { CalcResults } from "../types";
import { calculateAll } from "../calculations";

type Step = "basics" | "body" | "activity" | "goal" | "results";

export function Onboarding({ onComplete }: { onComplete: (profile: ReturnType<typeof createProfile>) => void }) {
  const [step, setStep] = useState<Step>("basics");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [targetWeight, setTargetWeight] = useState("");

  const ageNum = parseInt(age) || 0;
  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const targetWeightNum = parseFloat(targetWeight) || 0;

  let results: CalcResults | null = null;
  if (weightNum > 0 && heightNum > 0 && ageNum > 0 && sex && activityLevel && goal) {
    results = calculateAll(weightNum, heightNum, ageNum, sex, activityLevel, goal);
  }

  const handleFinish = () => {
    if (!sex || !activityLevel || !goal || !results) return;
    const profile = createProfile({
      name: name || "User",
      age: ageNum,
      sex,
      height: heightNum,
      weight: weightNum,
      activityLevel,
      goal,
      targetWeight: targetWeightNum || weightNum,
    });
    onComplete(profile);
  };

  const canBasics = name.trim() && ageNum >= 5 && ageNum <= 120 && sex !== "";
  const canBody = heightNum >= 80 && heightNum <= 250 && weightNum >= 20 && weightNum <= 400;
  const canActivity = activityLevel !== "";
  const canGoal = goal !== "" && (goal === "maintain" || targetWeightNum >= 20);

  return (
    <div className="app-shell">
      <div className="app-content onboarding">
        <div className="onboarding-logo">
          <div className="logo-icon">🍎</div>
          <h1>NutriTrack</h1>
          <p>Your smart calorie & nutrition companion</p>
        </div>

        {step === "basics" && (
          <>
            <div className="onboarding-step">Step 1 of 4</div>
            <h2>Let's get to know you</h2>
            <p className="subtitle">Tell us a bit about yourself to get started.</p>
            <div className="field-group">
              <label className="label">Your name</label>
              <input className="input" type="text" placeholder="e.g. Alex" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="label">Age</label>
              <input className="input" type="number" inputMode="numeric" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="label">Sex (for BMR calculation)</label>
              <div className="option-grid">
                <button className={`option-card ${sex === "male" ? "selected" : ""}`} onClick={() => setSex("male")}>
                  <span className="opt-icon">👨</span>
                  Male
                </button>
                <button className={`option-card ${sex === "female" ? "selected" : ""}`} onClick={() => setSex("female")}>
                  <span className="opt-icon">👩</span>
                  Female
                </button>
              </div>
            </div>
            <button className="btn" disabled={!canBasics} onClick={() => setStep("body")}>Continue</button>
          </>
        )}

        {step === "body" && (
          <>
            <div className="onboarding-step">Step 2 of 4</div>
            <h2>Your measurements</h2>
            <p className="subtitle">We use these to calculate your calorie needs.</p>
            <div className="field-group">
              <label className="label">Height (cm)</label>
              <input className="input" type="number" inputMode="decimal" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="label">Current weight (kg)</label>
              <input className="input" type="number" inputMode="decimal" placeholder="e.g. 72.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="row gap-12 mt-16">
              <button className="btn btn-secondary" onClick={() => setStep("basics")}>Back</button>
              <button className="btn" disabled={!canBody} onClick={() => setStep("activity")}>Continue</button>
            </div>
          </>
        )}

        {step === "activity" && (
          <>
            <div className="onboarding-step">Step 3 of 4</div>
            <h2>Activity level</h2>
            <p className="subtitle">How active are you on a typical day?</p>
            <div className="flex-col gap-8">
              {ACTIVITY_ORDER.map((lvl) => (
                <button
                  key={lvl}
                  className={`option-card ${activityLevel === lvl ? "selected" : ""}`}
                  style={{ flexDirection: "row", justifyContent: "space-between", textAlign: "left" }}
                  onClick={() => setActivityLevel(lvl)}
                >
                  <span>{ACTIVITY_LABELS[lvl]}</span>
                  <span className="fs-12 text-secondary">×{({ sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[lvl])}</span>
                </button>
              ))}
            </div>
            <div className="row gap-12 mt-24">
              <button className="btn btn-secondary" onClick={() => setStep("body")}>Back</button>
              <button className="btn" disabled={!canActivity} onClick={() => setStep("goal")}>Continue</button>
            </div>
          </>
        )}

        {step === "goal" && (
          <>
            <div className="onboarding-step">Step 4 of 4</div>
            <h2>What's your goal?</h2>
            <p className="subtitle">Choose your primary health goal.</p>
            <div className="option-grid" style={{ gridTemplateColumns: "1fr" }}>
              {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                <button
                  key={g}
                  className={`option-card ${goal === g ? "selected" : ""}`}
                  style={{ flexDirection: "row", textAlign: "left" }}
                  onClick={() => setGoal(g)}
                >
                  <span className="opt-icon">{g === "lose" ? "📉" : g === "maintain" ? "⚖️" : "📈"}</span>
                  <div>
                    <div>{GOAL_LABELS[g]}</div>
                    <div className="fs-12 text-secondary">{g === "lose" ? "500 cal/day deficit · ~0.5 kg/week" : g === "maintain" ? "Balance intake with expenditure" : "500 cal/day surplus · ~0.5 kg/week"}</div>
                  </div>
                </button>
              ))}
            </div>
            {goal && goal !== "maintain" && (
              <div className="field-group mt-16">
                <label className="label">Target weight (kg)</label>
                <input className="input" type="number" inputMode="decimal" placeholder="e.g. 68" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
              </div>
            )}
            <div className="row gap-12 mt-24">
              <button className="btn btn-secondary" onClick={() => setStep("activity")}>Back</button>
              <button className="btn" disabled={!canGoal} onClick={() => setStep("results")}>See my plan</button>
            </div>
          </>
        )}

        {step === "results" && results && (
          <>
            <div className="onboarding-step">Your personalized plan</div>
            <h2>Here's your daily target</h2>
            <p className="subtitle">Based on the Mifflin-St Jeor equation and your activity level.</p>
            <div className="calc-results">
              <h3>📊 Your Daily Nutrition Goals</h3>
              <div className="calc-row">
                <span className="label-text">BMR (at rest)</span>
                <span className="value">{results.bmr}<span className="unit"> cal</span></span>
              </div>
              <div className="calc-row">
                <span className="label-text">TDEE (total burn)</span>
                <span className="value">{results.tdee}<span className="unit"> cal</span></span>
              </div>
              <div className="calc-row">
                <span className="label-text">Daily calorie target</span>
                <span className="value" style={{ color: "var(--primary)" }}>{results.calorieTarget}<span className="unit"> cal</span></span>
              </div>
              <div className="calc-row">
                <span className="label-text">{results.deficit < 0 ? "Calorie deficit" : results.deficit > 0 ? "Calorie surplus" : "Maintenance"}</span>
                <span className="value" style={{ color: results.deficit < 0 ? "var(--success)" : results.deficit > 0 ? "var(--warning)" : "var(--textSecondary)" }}>
                  {results.deficit < 0 ? `${Math.abs(results.deficit)}` : results.deficit > 0 ? `+${results.deficit}` : "0"}<span className="unit"> cal/day</span>
                </span>
              </div>
              <div className="calc-row">
                <span className="label-text">Protein target</span>
                <span className="value">{results.proteinTarget}<span className="unit"> g</span></span>
              </div>
              <div className="calc-row">
                <span className="label-text">Carbs target</span>
                <span className="value">{results.carbTarget}<span className="unit"> g</span></span>
              </div>
              <div className="calc-row">
                <span className="label-text">Fat target</span>
                <span className="value">{results.fatTarget}<span className="unit"> g</span></span>
              </div>
            </div>
            <button className="btn" onClick={handleFinish}>Start tracking →</button>
            <button className="btn btn-ghost mt-8" onClick={() => setStep("goal")}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}
