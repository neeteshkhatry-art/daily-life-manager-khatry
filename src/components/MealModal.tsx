import React, { useState, useEffect } from 'react';
import { MealRecord, MealType, FoodDatabaseItem } from '../types';
import { X, Search, Plus, Trash2, Sparkles, Check, Info } from 'lucide-react';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealRecord, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  onSaveCustomFood?: (food: FoodDatabaseItem) => void;
  editingMeal?: MealRecord | null;
  foodDatabase: FoodDatabaseItem[];
  defaultMealType?: MealType;
}

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onSaveCustomFood,
  editingMeal,
  foodDatabase,
  defaultMealType = 'breakfast'
}) => {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [tab, setTab] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);

  // Custom/Manual fields
  const [foodName, setFoodName] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servings, setServings] = useState(1);
  const [calories, setCalories] = useState(200);
  const [proteinG, setProteinG] = useState(5);
  const [carbsG, setCarbsG] = useState(25);
  const [fatG, setFatG] = useState(5);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(true);

  useEffect(() => {
    if (editingMeal) {
      setMealType(editingMeal.mealType);
      setFoodName(editingMeal.foodName);
      setServingSize(editingMeal.servingSize);
      setServings(editingMeal.servings || 1);
      setCalories(editingMeal.calories);
      setProteinG(editingMeal.proteinG);
      setCarbsG(editingMeal.carbsG);
      setFatG(editingMeal.fatG);
      setDate(editingMeal.date);
      setTime(editingMeal.time);
      setNotes(editingMeal.notes || '');
      setTab('custom');
    } else {
      setMealType(defaultMealType);
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setServings(1);
      setNotes('');
      setTab('search');
      setSelectedFood(null);
      // Pre-select first food
      if (foodDatabase.length > 0) {
        selectFoodItem(foodDatabase[0]);
      }
    }
  }, [editingMeal, isOpen, defaultMealType, foodDatabase]);

  if (!isOpen) return null;

  const selectFoodItem = (item: FoodDatabaseItem) => {
    setSelectedFood(item);
    setFoodName(item.name);
    setServingSize(item.servingSize);
    setCalories(Math.round(item.caloriesPerServing * servings));
    setProteinG(Number((item.proteinG * servings).toFixed(1)));
    setCarbsG(Number((item.carbsG * servings).toFixed(1)));
    setFatG(Number((item.fatG * servings).toFixed(1)));
  };

  const handleServingMultiplier = (newServings: number) => {
    if (newServings <= 0) return;
    setServings(newServings);
    if (selectedFood) {
      setCalories(Math.round(selectedFood.caloriesPerServing * newServings));
      setProteinG(Number((selectedFood.proteinG * newServings).toFixed(1)));
      setCarbsG(Number((selectedFood.carbsG * newServings).toFixed(1)));
      setFatG(Number((selectedFood.fatG * newServings).toFixed(1)));
    }
  };

  const filteredFoods = foodDatabase.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    if (tab === 'custom' && saveToLibrary && onSaveCustomFood) {
      onSaveCustomFood({
        id: `custom_${Date.now()}`,
        name: foodName.trim(),
        category: 'Custom Foods',
        servingSize: servingSize || '1 serving',
        defaultServings: 1,
        caloriesPerServing: Math.round(calories / (servings || 1)),
        proteinG: Number((proteinG / (servings || 1)).toFixed(1)),
        carbsG: Number((carbsG / (servings || 1)).toFixed(1)),
        fatG: Number((fatG / (servings || 1)).toFixed(1)),
        isCustom: true
      });
    }

    onSave(
      {
        mealType,
        foodName: foodName.trim(),
        servingSize: servingSize || '1 serving',
        servings,
        calories,
        proteinG,
        carbsG,
        fatG,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '12:00',
        notes: notes.trim()
      },
      editingMeal?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingMeal ? 'Edit Meal Log' : 'Log Meal & Nutrition'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meal Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'morning_snack', label: 'Morning Snack' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'evening_snack', label: 'Evening Snack' },
              { id: 'dinner', label: 'Dinner' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMealType(m.id as MealType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  mealType === m.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`pb-2 border-b-2 transition-all ${
              tab === 'search'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Indian Food Library
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`pb-2 border-b-2 transition-all ${
              tab === 'custom'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Meal / Quick Entry
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === 'search' ? (
            <>
              {/* Search Food */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Roti, Dal, Rice, Paneer, Idli, Poha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Food List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-800/30">
                {filteredFoods.map((item) => {
                  const isSelected = selectedFood?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectFoodItem(item)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 font-medium'
                          : 'bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isCustom && (
                            <span className="text-[10px] text-blue-500 font-normal">Custom</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.servingSize} · P: {item.proteinG}g · C: {item.carbsG}g · F: {item.fatG}g
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {item.caloriesPerServing}
                        </span>
                        <span className="text-[10px] text-slate-400 block">kcal</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Servings Adjuster */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    Number of Servings
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {servingSize || '1 portion'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleServingMultiplier(Math.max(0.5, servings - 0.5))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[28px] text-center">
                    {servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleServingMultiplier(servings + 0.5)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Custom Food Form
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oats with Almond Milk, Aloo Paratha"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 bowl (150g)"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Servings
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value) || 1)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Nutritional Breakdown (Total)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Calories</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value) || 0)}
                      className="w-full text-xs font-bold text-amber-600 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={proteinG}
                      onChange={(e) => setProteinG(Number(e.target.value) || 0)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={carbsG}
                      onChange={(e) => setCarbsG(Number(e.target.value) || 0)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatG}
                      onChange={(e) => setFatG(Number(e.target.value) || 0)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveCustom"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="saveCustom" className="text-xs text-slate-700 dark:text-slate-300">
                  Save to my food library for one-tap future reuse
                </label>
              </div>
            </div>
          )}

          {/* Calorie & Macro Preview Card */}
          <div className="p-3 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Intake</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {calories} kcal
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
              <span>P: <strong>{proteinG}g</strong></span>
              <span>C: <strong>{carbsG}g</strong></span>
              <span>F: <strong>{fatG}g</strong></span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. cooked with minimal ghee, post-workout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Clear Disclaimer */}
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Nutrition values are estimates for general health & wellness logging. Not intended as medical diagnosis or prescription.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          {editingMeal && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this meal entry?')) {
                  onDelete(editingMeal.id);
                  onClose();
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              Save Meal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
