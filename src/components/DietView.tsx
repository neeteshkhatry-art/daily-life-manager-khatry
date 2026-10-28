import React, { useState, useMemo } from 'react';
import {
  MealRecord,
  MealType,
  WaterLog,
  WeightLog,
  AppSettings,
  FoodDatabaseItem
} from '../types';
import {
  Flame,
  Droplet,
  Scale,
  Plus,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Calendar,
  Info,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface DietViewProps {
  meals: MealRecord[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  foodDatabase: FoodDatabaseItem[];
  settings: AppSettings;
  onOpenAddMeal: (defaultType?: MealType) => void;
  onEditMeal: (meal: MealRecord) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateWater: (date: string, deltaMl: number) => void;
  onAddWeight: (weightKg: number, date: string, notes?: string) => void;
  onDeleteWeight: (id: string) => void;
}

export const DietView: React.FC<DietViewProps> = ({
  meals,
  waterLogs,
  weightLogs,
  foodDatabase,
  settings,
  onOpenAddMeal,
  onEditMeal,
  onDeleteMeal,
  onUpdateWater,
  onAddWeight,
  onDeleteWeight
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Meals for selected date
  const dayMeals = useMemo(() => {
    return meals.filter((m) => m.date === selectedDate);
  }, [meals, selectedDate]);

  // Calories & Macros for day
  const dayCalories = useMemo(
    () => dayMeals.reduce((sum, m) => sum + m.calories, 0),
    [dayMeals]
  );
  const dayProtein = useMemo(
    () => dayMeals.reduce((sum, m) => sum + m.proteinG, 0),
    [dayMeals]
  );
  const dayCarbs = useMemo(
    () => dayMeals.reduce((sum, m) => sum + m.carbsG, 0),
    [dayMeals]
  );
  const dayFat = useMemo(
    () => dayMeals.reduce((sum, m) => sum + m.fatG, 0),
    [dayMeals]
  );

  const calorieTarget = settings.dailyCalorieTarget || 2000;
  const remainingCalories = Math.max(0, calorieTarget - dayCalories);
  const caloriePct = Math.min(100, Math.round((dayCalories / calorieTarget) * 100));

  // Water for day
  const currentWater = useMemo(() => {
    const log = waterLogs.find((w) => w.date === selectedDate);
    return log ? log.amountMl : 0;
  }, [waterLogs, selectedDate]);
  const waterTarget = settings.dailyWaterTargetMl || 3000;
  const waterPct = Math.min(100, Math.round((currentWater / waterTarget) * 100));

  // Macro percentages for visual ratio bar
  const totalMacroGrams = dayProtein + dayCarbs + dayFat;
  const proteinPct = totalMacroGrams > 0 ? Math.round((dayProtein / totalMacroGrams) * 100) : 0;
  const carbsPct = totalMacroGrams > 0 ? Math.round((dayCarbs / totalMacroGrams) * 100) : 0;
  const fatPct = totalMacroGrams > 0 ? Math.round((dayFat / totalMacroGrams) * 100) : 0;

  // Group meals by meal type
  const mealTypes: { id: MealType; label: string; iconTime: string }[] = [
    { id: 'breakfast', label: 'Breakfast', iconTime: '08:00 AM' },
    { id: 'morning_snack', label: 'Morning Snack', iconTime: '11:00 AM' },
    { id: 'lunch', label: 'Lunch', iconTime: '01:30 PM' },
    { id: 'evening_snack', label: 'Evening Snack', iconTime: '05:30 PM' },
    { id: 'dinner', label: 'Dinner', iconTime: '08:30 PM' }
  ];

  // Past 7 Days Calorie History
  const weeklyCalorieData = useMemo(() => {
    const list = [];
    const base = new Date(selectedDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const cals = meals
        .filter((m) => m.date === dStr)
        .reduce((sum, m) => sum + m.calories, 0);

      list.push({
        date: dStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        cals,
        isTargetMet: cals <= calorieTarget && cals >= calorieTarget * 0.7
      });
    }
    return list;
  }, [meals, selectedDate, calorieTarget]);

  // Weight sorted by date
  const sortedWeightLogs = useMemo(() => {
    return [...weightLogs].sort((a, b) => b.date.localeCompare(a.date));
  }, [weightLogs]);

  const latestWeight = sortedWeightLogs[0]?.weightKg ?? null;
  const previousWeight = sortedWeightLogs[1]?.weightKg ?? null;
  const weightChange =
    latestWeight && previousWeight ? Number((latestWeight - previousWeight).toFixed(1)) : null;

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weightInput);
    if (!kg || isNaN(kg) || kg <= 20 || kg >= 300) {
      alert('Please enter a valid weight in kg.');
      return;
    }
    onAddWeight(kg, selectedDate, weightNote.trim());
    setWeightInput('');
    setWeightNote('');
    setShowWeightModal(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diet & Nutrition
          </h1>
          <span className="text-[11px] text-slate-500">
            Wellness tracker & calorie counter
          </span>
        </div>

        <button
          onClick={() => onOpenAddMeal('breakfast')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Food</span>
        </button>
      </div>

      {/* Date Navigation Strip */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          {selectedDate === new Date().toISOString().split('T')[0] && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-md">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Calorie & Macronutrient Summary Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Daily Calorie Target
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {dayCalories} <span className="text-xs text-slate-400 font-normal">/ {calorieTarget} kcal</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono block">
              {remainingCalories} kcal
            </span>
            <span className="text-[10px] text-slate-400">Remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              caloriePct > 100 ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, caloriePct)}%` }}
          />
        </div>

        {/* Macro Nutrient Split */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Macronutrients</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-blue-600">P: {dayProtein.toFixed(1)}g ({proteinPct}%)</span>
              <span className="text-amber-600">C: {dayCarbs.toFixed(1)}g ({carbsPct}%)</span>
              <span className="text-rose-600">F: {dayFat.toFixed(1)}g ({fatPct}%)</span>
            </div>
          </div>

          {/* Macro Ratio Stacked Bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
            {proteinPct > 0 && (
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${proteinPct}%` }} />
            )}
            {carbsPct > 0 && (
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${carbsPct}%` }} />
            )}
            {fatPct > 0 && (
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${fatPct}%` }} />
            )}
          </div>
        </div>
      </div>

      {/* Water Intake Tracker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Droplet className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Daily Water Intake
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentWater} ml / {waterTarget} ml ({waterPct}%)
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateWater(selectedDate, -250)}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
              title="Remove 250ml"
            >
              -
            </button>
            <button
              onClick={() => onUpdateWater(selectedDate, 250)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 active:scale-95 transition-all shadow-xs"
              title="Add 250ml glass"
            >
              +250 ml
            </button>
          </div>
        </div>

        {/* Water Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, waterPct)}%` }}
          />
        </div>
      </div>

      {/* Meals by Type (Breakfast, Lunch, Dinner, Snacks) */}
      <div className="space-y-3">
        {mealTypes.map((mt) => {
          const typeMeals = dayMeals.filter((m) => m.mealType === mt.id);
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div
              key={mt.id}
              className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-xs"
            >
              <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {mt.label}
                  </span>
                  <span className="text-[10px] text-slate-400">· {mt.iconTime}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                    {typeCalories} kcal
                  </span>
                  <button
                    onClick={() => onOpenAddMeal(mt.id)}
                    className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors"
                    title={`Add food to ${mt.label}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              {typeMeals.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No food logged for {mt.label}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{meal.foodName}</span>
                          {meal.servings && meal.servings !== 1 && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({meal.servings}x)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {meal.servingSize} · P: {meal.proteinG}g · C: {meal.carbsG}g · F: {meal.fatG}g
                        </div>
                        {meal.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            {meal.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold font-mono text-xs text-slate-800 dark:text-slate-200 mr-1">
                          {meal.calories} kcal
                        </span>
                        <button
                          onClick={() => onEditMeal(meal)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this food entry?')) {
                              onDeleteMeal(meal.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Nutrition Chart */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h2 className="font-bold text-slate-900 dark:text-white">Past 7 Days Calories</h2>
          <span className="text-[11px] text-slate-400">Target: {calorieTarget} kcal/day</span>
        </div>

        <div className="h-32 w-full flex items-end gap-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700">
          {weeklyCalorieData.map((d) => {
            const height = Math.min(100, Math.round((d.cals / (calorieTarget * 1.3)) * 100));
            const isToday = d.date === selectedDate;

            return (
              <div
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                <div
                  className={`w-full max-w-[24px] rounded-t-md transition-all ${
                    isToday
                      ? 'bg-amber-600 ring-2 ring-amber-300'
                      : d.cals > calorieTarget
                      ? 'bg-rose-400'
                      : 'bg-amber-400 group-hover:bg-amber-500'
                  }`}
                  style={{ height: `${Math.max(6, height)}%` }}
                />
                <span
                  className={`text-[10px] mt-1 font-semibold ${
                    isToday ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weight History Tracker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Body Weight Tracker
            </h2>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
        </div>

        {latestWeight ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latest Weight</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {latestWeight} kg
              </span>
            </div>
            {weightChange !== null && (
              <div className="text-right">
                <span
                  className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                    weightChange <= 0 ? 'text-emerald-600' : 'text-slate-600'
                  }`}
                >
                  {weightChange <= 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {weightChange > 0 ? `+${weightChange}` : weightChange} kg
                </span>
                <span className="text-[10px] text-slate-400">Since last entry</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">
            No weight entries recorded yet.
          </p>
        )}
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-semibold block">Wellness Information Notice</span>
          <span>
            Nutritional estimates and calorie goals are intended for general lifestyle awareness and fitness tracking. They do not constitute medical, clinical, or dietary advice.
          </span>
        </div>
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Body Weight
            </h3>
            <form onSubmit={handleSaveWeight} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (in Kilograms)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 68.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  autoFocus
                  className="w-full text-base font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. morning fasting, post workout"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
