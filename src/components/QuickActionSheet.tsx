import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Utensils, Droplet, Bell, X } from 'lucide-react';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action: 'add_expense' | 'add_income' | 'transfer' | 'add_meal' | 'quick_water' | 'add_bill'
  ) => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'add_expense' as const,
      title: 'Add Expense',
      desc: 'Groceries, bills, dining out, transport',
      icon: ArrowDownLeft,
      color: 'bg-rose-500 text-white',
      border: 'hover:border-rose-300 dark:hover:border-rose-800'
    },
    {
      id: 'add_income' as const,
      title: 'Add Income',
      desc: 'Salary, freelance, refunds, gifts',
      icon: ArrowUpRight,
      color: 'bg-emerald-500 text-white',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800'
    },
    {
      id: 'transfer' as const,
      title: 'Account Transfer',
      desc: 'Move money between bank & wallet',
      icon: ArrowRightLeft,
      color: 'bg-blue-500 text-white',
      border: 'hover:border-blue-300 dark:hover:border-blue-800'
    },
    {
      id: 'add_meal' as const,
      title: 'Log Meal / Food',
      desc: 'Track calories, carbs, protein & fats',
      icon: Utensils,
      color: 'bg-amber-500 text-white',
      border: 'hover:border-amber-300 dark:hover:border-amber-800'
    },
    {
      id: 'quick_water' as const,
      title: 'Log Glass of Water',
      desc: 'Quickly record +250 ml hydration',
      icon: Droplet,
      color: 'bg-cyan-500 text-white',
      border: 'hover:border-cyan-300 dark:hover:border-cyan-800'
    },
    {
      id: 'add_bill' as const,
      title: 'New Bill Reminder',
      desc: 'Rent, electricity, recharge due dates',
      icon: Bell,
      color: 'bg-purple-500 text-white',
      border: 'hover:border-purple-300 dark:hover:border-purple-800'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Action</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className={`flex flex-col items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-left transition-all active:scale-[0.98] ${act.border}`}
              >
                <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center mb-2 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {act.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
