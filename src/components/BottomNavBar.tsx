import React from 'react';
import { Home, Receipt, BarChart3, Apple, Settings, Plus } from 'lucide-react';

export type NavTab = 'home' | 'transactions' | 'reports' | 'diet' | 'settings';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickAction: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onQuickAction
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'transactions' as NavTab, label: 'Passbook', icon: Receipt },
    { id: 'plus' as const, label: 'Add', isAction: true },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
    { id: 'diet' as NavTab, label: 'Diet', icon: Apple },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-lg select-none no-print">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="action-plus" className="flex items-center justify-center -mt-5">
                <button
                  onClick={onQuickAction}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95 transition-transform ring-4 ring-white dark:ring-slate-900"
                  title="Add Income / Expense / Meal"
                  aria-label="Quick Add"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const IconComponent = tab.icon!;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center w-full py-1 min-h-[46px] rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-transparent'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
