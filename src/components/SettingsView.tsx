import React, { useState } from 'react';
import {
  Account,
  Budget,
  SavingsGoal,
  DebtRecord,
  BillReminder,
  AppSettings,
  Transaction
} from '../types';
import { formatPaise, parseToPaise, paiseToInputString } from '../utils/currency';
import {
  Wallet,
  Target,
  Bell,
  Lock,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileCode,
  DollarSign,
  Smartphone,
  Info
} from 'lucide-react';
import {
  exportCompleteDatabaseJSON,
  restoreCompleteDatabaseJSON,
  resetAllDataToDefault,
  exportTransactionsToCSV
} from '../db/storage';
import { EXPENSE_CATEGORIES } from '../data/constants';

interface SettingsViewProps {
  accounts: Account[];
  accountBalances: Record<string, number>;
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debtRecords: DebtRecord[];
  billReminders: BillReminder[];
  transactions: Transaction[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onAddAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onAddSavingsGoal: (goal: SavingsGoal) => void;
  onDepositToGoal: (goalId: string, amountPaise: number) => void;
  onDeleteSavingsGoal: (id: string) => void;
  onAddDebt: (debt: DebtRecord) => void;
  onToggleSettleDebt: (id: string) => void;
  onDeleteDebt: (id: string) => void;
  onAddBillReminder: (bill: BillReminder) => void;
  onDeleteBillReminder: (id: string) => void;
  onReloadAllData: () => void;
  onOpenApkModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  accounts,
  accountBalances,
  budgets,
  savingsGoals,
  debtRecords,
  billReminders,
  transactions,
  settings,
  onUpdateSettings,
  onAddAccount,
  onDeleteAccount,
  onAddBudget,
  onDeleteBudget,
  onAddSavingsGoal,
  onDepositToGoal,
  onDeleteSavingsGoal,
  onAddDebt,
  onToggleSettleDebt,
  onDeleteDebt,
  onAddBillReminder,
  onDeleteBillReminder,
  onReloadAllData,
  onOpenApkModal
}) => {
  const [activeTab, setActiveTab] = useState<
    'accounts' | 'budgets' | 'bills' | 'security' | 'data'
  >('accounts');

  // Account modal states
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<Account['type']>('bank');
  const [accOpeningPaiseStr, setAccOpeningPaiseStr] = useState('0');

  // Budget modal states
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgetCat, setBudgetCat] = useState(EXPENSE_CATEGORIES[0].name);
  const [budgetLimitStr, setBudgetLimitStr] = useState('5000');

  // Goal modal states
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetStr, setGoalTargetStr] = useState('50000');
  const [goalDate, setGoalDate] = useState('2026-12-31');

  // Debt modal states
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [debtPerson, setDebtPerson] = useState('');
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [debtAmountStr, setDebtAmountStr] = useState('1000');
  const [debtNote, setDebtNote] = useState('');

  // Bill modal states
  const [showAddBill, setShowAddBill] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmountStr, setBillAmountStr] = useState('1500');
  const [billDueDate, setBillDueDate] = useState('2026-11-15');
  const [billCategory, setBillCategory] = useState('Utilities');

  // PIN settings state
  const [pinInput, setPinInput] = useState(settings.appLockPin || '1234');

  // Handlers
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: accName.trim(),
      type: accType,
      openingBalancePaise: parseToPaise(accOpeningPaiseStr),
      color: accType === 'cash' ? '#10b981' : accType === 'wallet' ? '#06b6d4' : accType === 'credit_card' ? '#f97316' : '#2563eb'
    };
    onAddAccount(newAcc);
    setAccName('');
    setAccOpeningPaiseStr('0');
    setShowAddAcc(false);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseToPaise(budgetLimitStr);
    if (limit <= 0) return;
    onAddBudget({
      id: `b_${Date.now()}`,
      period: 'monthly',
      category: budgetCat,
      limitPaise: limit,
      alertThresholdPct: 80
    });
    setShowAddBudget(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseToPaise(goalTargetStr);
    if (!goalName.trim() || target <= 0) return;
    onAddSavingsGoal({
      id: `goal_${Date.now()}`,
      name: goalName.trim(),
      targetAmountPaise: target,
      currentAmountPaise: 0,
      targetDate: goalDate,
      color: '#10b981'
    });
    setGoalName('');
    setShowAddGoal(false);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseToPaise(debtAmountStr);
    if (!debtPerson.trim() || amt <= 0) return;
    onAddDebt({
      id: `debt_${Date.now()}`,
      personName: debtPerson.trim(),
      type: debtType,
      amountPaise: amt,
      date: new Date().toISOString().split('T')[0],
      note: debtNote.trim(),
      isSettled: false
    });
    setDebtPerson('');
    setDebtNote('');
    setShowAddDebt(false);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseToPaise(billAmountStr);
    if (!billTitle.trim() || amt <= 0) return;
    onAddBillReminder({
      id: `bill_${Date.now()}`,
      title: billTitle.trim(),
      category: billCategory,
      amountPaise: amt,
      dueDate: billDueDate,
      frequency: 'monthly',
      isPaidForCurrentCycle: false
    });
    setBillTitle('');
    setShowAddBill(false);
  };

  // Export JSON Backup
  const handleBackupDownload = () => {
    const jsonStr = exportCompleteDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily_life_manager_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore JSON Backup
  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = restoreCompleteDatabaseJSON(content);
          if (success) {
            alert('Database successfully restored from backup file!');
            onReloadAllData();
          } else {
            alert('Error: Invalid backup file format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset database
  const handleResetData = () => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to permanently reset all data? This will erase custom records and restore initial presets.'
      )
    ) {
      resetAllDataToDefault();
      onReloadAllData();
      alert('All application data reset to defaults.');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Manager
          </h1>
          <span className="text-[11px] text-slate-500">
            Accounts, budgets, security & APK
          </span>
        </div>

        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>APK Guide</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
        {[
          { id: 'accounts', label: 'Accounts', icon: Wallet },
          { id: 'budgets', label: 'Budgets', icon: Target },
          { id: 'bills', label: 'Bills', icon: Bell },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'data', label: 'Backup', icon: Database }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-2 flex flex-col items-center justify-center rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="text-[11px] truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ACCOUNTS & WALLETS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Bank Accounts, Wallets & Cash
            </h2>
            <button
              onClick={() => setShowAddAcc(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>

          <div className="space-y-2">
            {accounts.map((acc) => {
              const currentBal = accountBalances[acc.id] ?? 0;
              const isNegative = currentBal < 0;

              return (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.type === 'cash' ? '💵' : acc.type === 'wallet' ? '📱' : acc.type === 'credit_card' ? '💳' : '🏦'}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {acc.accountNumberMasked && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {acc.accountNumberMasked}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Opening: {formatPaise(acc.openingBalancePaise, false, settings)} · Type: {acc.type.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isNegative && acc.type !== 'credit_card'
                            ? 'text-rose-600'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatPaise(currentBal, false, settings)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Available</span>
                    </div>

                    {accounts.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete account "${acc.name}"?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BUDGETS & SAVINGS GOALS */}
      {activeTab === 'budgets' && (
        <div className="space-y-5">
          {/* Overall Monthly Budget Configuration */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Overall Monthly Budget
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-400">{settings.currencySymbol}</span>
              <input
                type="number"
                value={settings.overallMonthlyBudgetPaise / 100}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    overallMonthlyBudgetPaise: (parseFloat(e.target.value) || 0) * 100
                  })
                }
                className="flex-1 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono"
              />
              <span className="text-xs text-slate-500">per month</span>
            </div>
          </div>

          {/* Category Budgets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Category Monthly Budgets
              </h2>
              <button
                onClick={() => setShowAddBudget(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Budget</span>
              </button>
            </div>

            <div className="space-y-2">
              {budgets.filter((b) => b.category).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {b.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Alert at {b.alertThresholdPct}% threshold
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPaise(b.limitPaise, false, settings)}/mo
                    </span>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Savings Goals
              </h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Goal</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {savingsGoals.map((goal) => {
                const pct = Math.min(
                  100,
                  Math.round((goal.currentAmountPaise / (goal.targetAmountPaise || 1)) * 100)
                );

                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {goal.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Target Date: {goal.targetDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const addStr = prompt('Enter amount (in ₹) to deposit toward this goal:');
                            if (addStr) {
                              const p = parseToPaise(addStr);
                              if (p > 0) onDepositToGoal(goal.id, p);
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-semibold rounded-lg text-[11px] hover:bg-emerald-100"
                        >
                          + Deposit
                        </button>
                        <button
                          onClick={() => onDeleteSavingsGoal(goal.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Saved: {formatPaise(goal.currentAmountPaise, false, settings)}</span>
                      <span>Target: {formatPaise(goal.targetAmountPaise, false, settings)} ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Money Owed / Khata Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  Udhar / Khata Ledger
                </h2>
                <span className="text-[10px] text-slate-400">
                  Money owed to others or receivable
                </span>
              </div>
              <button
                onClick={() => setShowAddDebt(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <div className="space-y-2">
              {debtRecords.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {d.personName}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          d.type === 'lent'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {d.type === 'lent' ? 'Receivable (You Lent)' : 'Payable (You Owe)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {d.note || 'No note'} · Due: {d.dueDate || 'Flexible'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPaise(d.amountPaise, false, settings)}
                    </span>
                    <button
                      onClick={() => onToggleSettleDebt(d.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                        d.isSettled
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {d.isSettled ? 'Settled ✓' : 'Settle'}
                    </button>
                    <button
                      onClick={() => onDeleteDebt(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BILL REMINDERS */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Bill Due Dates & Recurring Schedules
            </h2>
            <button
              onClick={() => setShowAddBill(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bill</span>
            </button>
          </div>

          <div className="space-y-2">
            {billReminders.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{bill.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({bill.category})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Due Date: {bill.dueDate} · {bill.frequency.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatPaise(bill.amountPaise, false, settings)}
                  </span>
                  <button
                    onClick={() => onDeleteBillReminder(bill.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & PREFERENCES */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* App Lock PIN Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>4-Digit PIN App Lock</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Protect your financial and diet data from unauthorized access
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.appLockEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, appLockEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            {settings.appLockEnabled && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Current PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setPinInput(v);
                    if (v.length === 4) {
                      onUpdateSettings({ ...settings, appLockPin: v });
                    }
                  }}
                  className="w-24 text-center font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                />
                <span className="text-[11px] text-emerald-600">PIN Active</span>
              </div>
            )}
          </div>

          {/* Regional Settings */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Regional & Formatting Settings
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      currency: e.target.value,
                      currencySymbol: e.target.value === 'INR' ? '₹' : '$'
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Number Formatting</label>
                <select
                  value={settings.numberFormat}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      numberFormat: e.target.value as any
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs"
                >
                  <option value="in">Indian (1,50,000 Lakhs)</option>
                  <option value="intl">International (150,000)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Daily Calorie Goal (kcal)
                </label>
                <input
                  type="number"
                  value={settings.dailyCalorieTarget}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      dailyCalorieTarget: parseInt(e.target.value, 10) || 2000
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Daily Water Goal (ml)
                </label>
                <input
                  type="number"
                  step="250"
                  value={settings.dailyWaterTargetMl}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      dailyWaterTargetMl: parseInt(e.target.value, 10) || 3000
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATA & BACKUP */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* Backup & Restore */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Local Database Backup & Restore
            </h3>
            <p className="text-xs text-slate-500">
              All records are stored locally on your device for absolute privacy. Download a complete JSON snapshot or restore from a previous backup anytime.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleBackupDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* CSV Export All Records */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Export Transactions to Spreadsheet (CSV)
            </h3>
            <p className="text-xs text-slate-500">
              Compatible with Microsoft Excel, Google Sheets, and accounting software.
            </p>
            <button
              onClick={() => {
                const csv = exportTransactionsToCSV(transactions, accounts);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `daily_life_all_transactions_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>

          {/* Reset / Erase */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Reset Application Data
            </h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
              Permanently wipes all custom records and returns the app to its fresh installed state.
            </p>
            <button
              onClick={handleResetData}
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAddAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateAccount}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Account / Wallet
            </h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Account Name</label>
              <input
                type="text"
                placeholder="e.g. Axis Bank, GPay Wallet"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                autoFocus
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Account Type</label>
              <select
                value={accType}
                onChange={(e) => setAccType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash in Hand</option>
                <option value="wallet">Digital Wallet (Paytm/PhonePe)</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Opening Balance ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={accOpeningPaiseStr}
                onChange={(e) => setAccOpeningPaiseStr(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAcc(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateBudget}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Set Category Budget
            </h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={budgetCat}
                onChange={(e) => setBudgetCat(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Monthly Limit ({settings.currencySymbol})
              </label>
              <input
                type="number"
                placeholder="e.g. 8000"
                value={budgetLimitStr}
                onChange={(e) => setBudgetLimitStr(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBudget(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Set Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Savings Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateGoal}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              New Savings Goal
            </h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Emergency Fund, Diwali Gold"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Target Amount ({settings.currencySymbol})
              </label>
              <input
                type="number"
                placeholder="50000"
                value={goalTargetStr}
                onChange={(e) => setGoalTargetStr(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Date</label>
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Debt Modal */}
      {showAddDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateDebt}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Debt / Khata Record
            </h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Person Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={debtPerson}
                onChange={(e) => setDebtPerson(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Transaction Type</label>
              <select
                value={debtType}
                onChange={(e) => setDebtType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              >
                <option value="lent">I Lent (Money Receivable to me)</option>
                <option value="borrowed">I Borrowed (Money Payable by me)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Amount ({settings.currencySymbol})
              </label>
              <input
                type="number"
                placeholder="1000"
                value={debtAmountStr}
                onChange={(e) => setDebtAmountStr(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Note</label>
              <input
                type="text"
                placeholder="e.g. Lunch contribution split"
                value={debtNote}
                onChange={(e) => setDebtNote(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDebt(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bill Reminder Modal */}
      {showAddBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateBill}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Bill Reminder
            </h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bill Title</label>
              <input
                type="text"
                placeholder="e.g. Electricity, WiFi, Rent"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Amount ({settings.currencySymbol})
              </label>
              <input
                type="number"
                placeholder="1500"
                value={billAmountStr}
                onChange={(e) => setBillAmountStr(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Due Date</label>
              <input
                type="date"
                value={billDueDate}
                onChange={(e) => setBillDueDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBill(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
