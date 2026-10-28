import React from 'react';
import {
  Transaction,
  Account,
  MealRecord,
  BillReminder,
  AppSettings
} from '../types';
import { formatPaise, formatPaiseCompact } from '../utils/currency';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Utensils,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  Droplet,
  ChevronRight,
  Flame,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { AppIcon } from './Icon';

interface HomeDashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  accountBalances: Record<string, number>;
  meals: MealRecord[];
  billReminders: BillReminder[];
  waterAmountMl: number;
  settings: AppSettings;
  onNavigateTab: (tab: 'home' | 'transactions' | 'reports' | 'diet' | 'settings') => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenAddMeal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onPayBillReminder: (reminder: BillReminder) => void;
  onQuickWaterAdd: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  transactions,
  accounts,
  accountBalances,
  meals,
  billReminders,
  waterAmountMl,
  settings,
  onNavigateTab,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenAddMeal,
  onSelectTransaction,
  onPayBillReminder,
  onQuickWaterAdd
}) => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = today.slice(0, 7); // YYYY-MM

  // Today's metrics
  const todayTx = transactions.filter((t) => t.date === today);
  const todayIncomePaise = todayTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountPaise, 0);
  const todayExpensePaise = todayTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  // Month metrics
  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  const monthIncomePaise = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountPaise, 0);
  const monthExpensePaise = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountPaise, 0);
  const monthSavingsPaise = monthIncomePaise - monthExpensePaise;
  const savingsRate =
    monthIncomePaise > 0
      ? Math.max(0, Math.round((monthSavingsPaise / monthIncomePaise) * 100))
      : 0;

  // Total available net balance
  const totalNetBalancePaise = accounts.reduce((sum, acc) => {
    const bal = accountBalances[acc.id] ?? 0;
    return sum + bal;
  }, 0);

  // Budget calculations
  const monthlyBudgetPaise = settings.overallMonthlyBudgetPaise || 4500000;
  const remainingBudgetPaise = monthlyBudgetPaise - monthExpensePaise;
  const budgetUsedPct = Math.min(100, Math.round((monthExpensePaise / monthlyBudgetPaise) * 100));

  // Today's calories
  const todayMeals = meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const calorieTarget = settings.dailyCalorieTarget || 2000;
  const caloriePct = Math.min(100, Math.round((todayCalories / calorieTarget) * 100));
  const remainingCalories = Math.max(0, calorieTarget - todayCalories);

  // Upcoming unpaid bills
  const unpaidBills = billReminders.filter((b) => !b.isPaidForCurrentCycle).slice(0, 3);

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
        </div>

        <button
          onClick={() => onNavigateTab('settings')}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          title="Account Settings"
        >
          <span className="font-bold text-xs">DL</span>
        </button>
      </div>

      {/* Main Net Worth / Balance Hero Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        {/* Subtle decorative geometric overlay */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 -top-12 w-28 h-28 rounded-full bg-blue-400/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
            <span className="font-medium">Total Available Balance</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs font-mono">
              {accounts.length} Accounts
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-4">
            {formatPaise(totalNetBalancePaise, true, settings)}
          </div>

          {/* Today's Income vs Expense Split */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-blue-200 block uppercase font-medium">
                  Today's Income
                </span>
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {formatPaise(todayIncomePaise, false, settings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-blue-200 block uppercase font-medium">
                  Today's Spent
                </span>
                <span className="text-sm font-bold font-mono text-rose-300">
                  {formatPaise(todayExpensePaise, false, settings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 hover:border-rose-300 dark:hover:border-rose-700 shadow-xs active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Expense
          </span>
        </button>

        <button
          onClick={onOpenAddIncome}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
            <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Income
          </span>
        </button>

        <button
          onClick={onOpenAddMeal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 hover:border-amber-300 dark:hover:border-amber-700 shadow-xs active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Add Meal
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Reports
          </span>
        </button>
      </div>

      {/* Monthly Budget & Savings Progress Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">This Month's Budget</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
              Spent {formatPaise(monthExpensePaise, false, settings)} of{' '}
              {formatPaise(monthlyBudgetPaise, false, settings)}
            </span>
          </div>
          <div className="text-right">
            <span className={`font-bold font-mono text-xs ${remainingBudgetPaise < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {remainingBudgetPaise >= 0
                ? `${formatPaise(remainingBudgetPaise, false, settings)} left`
                : `${formatPaise(Math.abs(remainingBudgetPaise), false, settings)} over`}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">{budgetUsedPct}% used</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUsedPct > 90
                ? 'bg-rose-500'
                : budgetUsedPct > 70
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
          />
        </div>

        {/* Savings & Cash Flow Substrip */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 block">Monthly Income</span>
            <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              {formatPaise(monthIncomePaise, false, settings)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Total Spent</span>
            <span className="font-semibold font-mono text-rose-600 dark:text-rose-400">
              {formatPaise(monthExpensePaise, false, settings)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Savings ({savingsRate}%)</span>
            <span className={`font-semibold font-mono ${monthSavingsPaise >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
              {formatPaise(monthSavingsPaise, false, settings)}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Diet & Nutrition Snapshot Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Today's Nutrition & Water
              </h2>
              <span className="text-[10px] text-slate-400">
                {todayMeals.length} meals logged
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('diet')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Calorie Dial Representation */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeDasharray={`${caloriePct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-slate-800 dark:text-slate-100 font-mono">
                {caloriePct}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Calories</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {todayCalories} / {calorieTarget}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {remainingCalories} kcal left
              </span>
            </div>
          </div>

          {/* Water Intake Quick Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Water</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {waterAmountMl} ml
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Goal: {settings.dailyWaterTargetMl}ml
                </span>
              </div>
            </div>

            <button
              onClick={onQuickWaterAdd}
              className="px-2 py-1 text-[11px] font-bold bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 active:scale-95 transition-all shadow-xs"
              title="Add 250ml glass of water"
            >
              +250ml
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Bill Reminders */}
      {unpaidBills.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Upcoming Bill Reminders
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {unpaidBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {bill.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Due: {bill.dueDate} {bill.billerName ? `· ${bill.billerName}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatPaise(bill.amountPaise, false, settings)}
                  </span>
                  <button
                    onClick={() => onPayBillReminder(bill)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-[11px] hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Pay & Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/40"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : isTransfer ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{tx.note || tx.category}</span>
                      {tx.receiptUrl && (
                        <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-blue-600 rounded">
                          Bill
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.date} · {tx.time} · {tx.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold font-mono text-xs ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '-'}
                    {formatPaise(tx.amountPaise, false, settings)}
                  </span>
                  <span className="text-[10px] text-slate-400 block capitalize">
                    {tx.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
