import { useRef, useState } from "react";
import type { FoodEntry, FoodSuggestion, MealType } from "../types";
import { findFoods, analyzePhoto, detectMealType, suggestMealFoods, MEAL_TYPES } from "../foodSearch";
import { MEAL_LABELS, MEAL_ICONS, todayKey } from "../constants";

interface LogFoodProps {
  onClose: () => void;
  onAdd: (entry: Omit<FoodEntry, "id" | "createdAt">) => void;
  defaultMealType?: MealType;
  editEntry?: FoodEntry | null;
}

type Mode = "search" | "photo" | "edit";

export function LogFood({ onClose, onAdd, defaultMealType, editEntry }: LogFoodProps) {
  const [mode, setMode] = useState<Mode>(editEntry ? "edit" : "search");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType || detectMealType());
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [photoSuggestions, setPhotoSuggestions] = useState<FoodSuggestion[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editName, setEditName] = useState(editEntry?.name || "");
  const [editCalories, setEditCalories] = useState(editEntry ? String(editEntry.calories) : "");
  const [editProtein, setEditProtein] = useState(editEntry ? String(editEntry.protein) : "");
  const [editCarbs, setEditCarbs] = useState(editEntry ? String(editEntry.carbs) : "");
  const [editFat, setEditFat] = useState(editEntry ? String(editEntry.fat) : "");
  const [editPortion, setEditPortion] = useState(editEntry?.portion || "");
  const [editServings, setEditServings] = useState(editEntry?.servings ?? 1);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const results = await findFoods(searchText);
      setSuggestions(results);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed. Please try again.");
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setAnalyzing(true);
    setPhotoSuggestions([]);
    setPhotoError(null);
    try {
      const results = await analyzePhoto(file);
      if (results.length === 0) {
        setPhotoError("Could not identify any food in the photo. Try logging manually.");
      }
      setPhotoSuggestions(results);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Photo analysis failed. Please try logging manually.");
      setPhotoSuggestions([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const selectSuggestion = (sug: FoodSuggestion, source: "text" | "photo") => {
    setMode("edit");
    setEditName(sug.food.name);
    setEditCalories(String(sug.food.calories));
    setEditProtein(String(sug.food.protein));
    setEditCarbs(String(sug.food.carbs));
    setEditFat(String(sug.food.fat));
    setEditPortion(sug.food.servingSize);
    setEditServings(1);
    if (source === "photo" && photoUrl) {
      // keep photoUrl for potential attachment
    }
  };

  const handleSave = () => {
    const cal = parseFloat(editCalories) || 0;
    const pro = parseFloat(editProtein) || 0;
    const carb = parseFloat(editCarbs) || 0;
    const fat = parseFloat(editFat) || 0;
    onAdd({
      date: editEntry?.date || todayKey(),
      mealType: editEntry?.mealType || mealType,
      name: editName.trim() || "Food",
      calories: Math.round(cal * editServings),
      protein: Math.round(pro * editLogValue(editServings)),
      carbs: Math.round(carb * editLogValue(editServings)),
      fat: Math.round(fat * editLogValue(editServings)),
      portion: editPortion || "1 serving",
      servings: editServings,
      imageUrl: photoUrl || undefined,
      source: editEntry?.source || (mode === "photo" ? "photo" : "text"),
    });
    onClose();
  };

  // helper to avoid serving multiplication rounding issues
  function editLogValue(v: number): number {
    return Math.round(v * 100) / 100;
  }

  const quickAdd = (sug: FoodSuggestion) => {
    onAdd({
      date: todayKey(),
      mealType,
      name: sug.food.name,
      calories: sug.food.calories,
      protein: sug.food.protein,
      carbs: sug.food.carbs,
      fat: sug.food.fat,
      portion: sug.food.servingSize,
      servings: 1,
      source: "text",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h2>{editEntry ? "Edit Food" : "Log Food"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Meal type selector */}
          <div className="meal-type-selector">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt}
                className={`meal-type-btn ${mealType === mt ? "active" : ""}`}
                onClick={() => setMealType(mt)}
                disabled={!!editEntry}
              >
                <span className="mt-icon">{MEAL_ICONS[mt]}</span>
                {MEAL_LABELS[mt]}
              </button>
            ))}
          </div>

          {mode === "search" && !editEntry && (
            <>
              <div className="log-method-tabs">
                <button className={`log-method-tab active`}>
                  <span className="tab-icon">🔍</span>
                  Search
                </button>
                <button className="log-method-tab" onClick={() => setMode("photo")}>
                  <span className="tab-icon">📷</span>
                  Photo
                </button>
              </div>

              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  className="input"
                  type="text"
                  placeholder="What did you eat? e.g. grilled chicken salad"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="btn" onClick={handleSearch} disabled={!searchText.trim() || searchLoading}>
                {searchLoading ? "Searching…" : "Identify food"}
              </button>

              {/* Quick suggestions for this meal */}
              {!hasSearched && !searchLoading && (
                <div className="mt-16">
                  <div className="section-title">Quick add for {MEAL_LABELS[mealType]}</div>
                  <div className="suggestion-list">
                    {suggestMealFoods(mealType).slice(0, 6).map((food) => (
                      <div key={food.id} className="suggestion-card" style={{ cursor: "pointer" }} onClick={() => quickAdd({ food, confidence: 1 })}>
                        <div className="sug-info">
                          <div className="sug-name">{food.name}</div>
                          <div className="sug-detail">{food.servingSize} · {food.protein}p {food.carbs}c {food.fat}f</div>
                        </div>
                        <div className="sug-cal">{food.calories} cal</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {searchLoading && (
                <div className="ai-loading">
                  <div className="spinner-large"></div>
                  <div className="ai-loading-text">
                    Searching database…
                  </div>
                </div>
              )}

              {/* Error state */}
              {searchError && !searchLoading && (
                <div className="card text-center mt-16">
                  <p className="fs-14 text-secondary">{searchError}</p>
                  <button className="btn btn-ghost mt-12" onClick={handleSearch}>Retry search</button>
                </div>
              )}

              {/* Search results */}
              {hasSearched && !searchLoading && !searchError && (
                <div className="mt-16">
                  {suggestions.length === 0 ? (
                    <div className="card text-center">
                      <p className="fs-14 text-secondary">No matches found. Try a more general term, or log manually.</p>
                      <button className="btn mt-12" onClick={() => {
                        setEditName(searchText);
                        setMode("edit");
                      }}>Log "{searchText}" manually</button>
                    </div>
                  ) : (
                    <>
                      <div className="section-title">
                        Matches · Tap to review
                      </div>
                      <div className="suggestion-list">
                        {suggestions.map((sug, i) => (
                          <div key={sug.food.id} className="suggestion-card" style={{ cursor: "pointer" }} onClick={() => selectSuggestion(sug, "text")}>
                            <div className="sug-info">
                              <div className="sug-name">{sug.food.name}</div>
                              <div className="sug-detail">{sug.food.servingSize} · {sug.food.protein}p {sug.food.carbs}c {sug.food.fat}f</div>
                              {i === 0 && <div className="sug-conf" style={{ display: "inline-block", marginTop: 4 }}>{Math.round(sug.confidence * 100)}% match</div>}
                            </div>
                            <div className="sug-cal">{sug.food.calories} cal</div>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost mt-12" onClick={() => {
                        setEditName(searchText);
                        setMode("edit");
                      }}>None of these — log manually</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {mode === "photo" && !editEntry && (
            <>
              <div className="log-method-tabs">
                <button className="log-method-tab" onClick={() => setMode("search")}>
                  <span className="tab-icon">🔍</span>
                  Search
                </button>
                <button className={`log-method-tab active`}>
                  <span className="tab-icon">📷</span>
                  Photo
                </button>
              </div>

              {!photoUrl && (
                <div className="photo-upload-area">
                  <div className="upload-icon">📸</div>
                  <p>
                    "Snap a photo or upload an image of your meal, then search or log the details manually."
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoSelect} />
                  <button className="btn" onClick={() => fileRef.current?.click()}>Take or upload photo</button>
                </div>
              )}

              {photoUrl && (
                <>
                  <div className="photo-preview">
                    <img src={photoUrl} alt="Meal" />
                    {analyzing && (
                      <div className="analyzing">
                        <div className="spinner"></div>
                        <span className="fs-14">
                          Checking filename for a quick match…
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Error state */}
                  {photoError && !analyzing && (
                    <div className="card text-center">
                      <p className="fs-14 text-secondary">{photoError}</p>
                      <button className="btn btn-ghost mt-12" onClick={() => {
                        setPhotoUrl(null);
                        setPhotoError(null);
                        setPhotoSuggestions([]);
                        if (fileRef.current) fileRef.current.value = "";
                      }}>Try another photo</button>
                      <button className="btn mt-8" onClick={() => {
                        setEditName("");
                        setMode("edit");
                      }}>Log manually</button>
                    </div>
                  )}

                  {/* Results */}
                  {!analyzing && photoSuggestions.length > 0 && (
                    <div>
                      <div className="section-title">
                        Matches · Tap to review
                      </div>
                      <div className="suggestion-list">
                        {photoSuggestions.map((sug, i) => (
                          <div key={sug.food.id} className="suggestion-card" style={{ cursor: "pointer" }} onClick={() => selectSuggestion(sug, "photo")}>
                            <div className="sug-info">
                              <div className="sug-name">{sug.food.name}</div>
                              <div className="sug-detail">{sug.food.servingSize} · {sug.food.protein}p {sug.food.carbs}c {sug.food.fat}f</div>
                              {i === 0 && <div className="sug-conf" style={{ display: "inline-block", marginTop: 4 }}>{Math.round(sug.confidence * 100)}% match</div>}
                            </div>
                            <div className="sug-cal">{sug.food.calories} cal</div>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost mt-12" onClick={() => {
                        setEditName("");
                        setMode("edit");
                      }}>None of these — log manually</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {mode === "edit" && (
            <>
              <div className="section-title">Review & adjust</div>
              <p className="fs-12 text-secondary mb-16">
                Adjust the details below before logging.
              </p>
              <div className="edit-fields">
                <div className="nutrition-input-group">
                  <label className="label">Food name</label>
                  <input className="input" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Food name" />
                </div>
                <div className="nutrition-input-group">
                  <label className="label">Portion description</label>
                  <input className="input" type="text" value={editPortion} onChange={(e) => setEditPortion(e.target.value)} placeholder="e.g. 1 cup, 200g" />
                </div>
                <div className="nutrition-input-group">
                  <label className="label">Servings</label>
                  <div className="servings-control">
                    <button className="servings-btn" onClick={() => setEditServings(Math.max(0.25, editServings - 0.25))}>−</button>
                    <span className="servings-val">{editServings}</span>
                    <button className="servings-btn" onClick={() => setEditServings(editServings + 0.25)}>+</button>
                  </div>
                </div>
                <div className="nutrition-grid">
                  <div className="nutrition-input-group">
                    <label className="label" style={{ color: "var(--protein)" }}>Calories</label>
                    <input className="input" type="number" inputMode="decimal" value={editCalories} onChange={(e) => setEditCalories(e.target.value)} />
                  </div>
                  <div className="nutrition-input-group">
                    <label className="label" style={{ color: "var(--protein)" }}>Protein (g)</label>
                    <input className="input" type="number" inputMode="decimal" value={editProtein} onChange={(e) => setEditProtein(e.target.value)} />
                  </div>
                  <div className="nutrition-input-group">
                    <label className="label" style={{ color: "var(--carbs)" }}>Carbs (g)</label>
                    <input className="input" type="number" inputMode="decimal" value={editCarbs} onChange={(e) => setEditCarbs(e.target.value)} />
                  </div>
                  <div className="nutrition-input-group">
                    <label className="label" style={{ color: "var(--fat)" }}>Fat (g)</label>
                    <input className="input" type="number" inputMode="decimal" value={editFat} onChange={(e) => setEditFat(e.target.value)} />
                  </div>
                </div>
              </div>
              <button className="btn mt-24" onClick={handleSave} disabled={!editName.trim()}>
                {editEntry ? "Update entry" : "Add to diary"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
