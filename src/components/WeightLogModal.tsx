import { useState } from "react";
import { getLatestWeight } from "../selectors";
import type { AppState } from "../types";

interface WeightLogModalProps {
  state: AppState;
  onClose: () => void;
  onLog: (date: string, weight: number) => void;
}

export function WeightLogModal({ state, onClose, onLog }: WeightLogModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [weight, setWeight] = useState(String(getLatestWeight(state) ?? ""));
  const [date, setDate] = useState(today);

  const handleSave = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 400) return;
    onLog(date, w);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h2>Log Weight</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field-group">
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="label">Weight (kg)</label>
            <div className="weight-log-input">
              <input
                className="input"
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                autoFocus
              />
              <span className="unit">kg</span>
            </div>
          </div>
          <button className="btn" onClick={handleSave} disabled={!parseFloat(weight)}>Save weight</button>
        </div>
      </div>
    </div>
  );
}
