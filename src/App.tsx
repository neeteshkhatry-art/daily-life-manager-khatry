/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Account,
  Budget,
  SavingsGoal,
  DebtRecord,
  BillReminder,
  MealRecord,
  FoodDatabaseItem,
  WaterLog,
  WeightLog,
  AppSettings,
  TransactionType,
  MealType
} from './types';
import {
  loadSettings,
  saveSettings,
  loadAccounts,
  saveAccounts,
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
  loadSavingsGoals,
  saveSavingsGoals,
  loadDebtRecords,
  saveDebtRecords,
  loadBillReminders,
  saveBillReminders,
  loadMeals,
  saveMeals,
  loadCustomFoods,
  saveCustomFoods,
  getAllFoodDatabase,
  loadWaterLogs,
  saveWaterLogs,
  loadWeightLogs,
  saveWeightLogs,
  calculateAccountBalances
} from './db/storage';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { HomeDashboard } from './components/HomeDashboard';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { DietView } from './components/DietView';
import { SettingsView } from './components/SettingsView';
import { QuickActionSheet } from './components/QuickActionSheet';
import { TransactionModal } from './components/TransactionModal';
import { MealModal } from './components/MealModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { AppLockScreen } from './components/AppLockScreen';

export default function App() {
  // Core Domain State
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadSavingsGoals);
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>(loadDebtRecords);
  const [billReminders, setBillReminders] = useState<BillReminder[]>(loadBillReminders);
  const [meals, setMeals] = useState<MealRecord[]>(loadMeals);
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabaseItem[]>(getAllFoodDatabase);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(loadWaterLogs);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(loadWeightLogs);

  // App Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [viewMode, setViewMode] = useState<'phone' | 'responsive'>(settings.viewMode || 'phone');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!settings.appLockEnabled);

  // Modals
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [txModalInitialType, setTxModalInitialType] = useState<TransactionType>('expense');

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [mealModalDefaultType, setMealModalDefaultType] = useState<MealType>('breakfast');

  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reactive Account Balances
  const accountBalances = useMemo(
    () => calculateAccountBalances(accounts, transactions),
    [accounts, transactions]
  );

  // Today's water amount
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWaterAmount = useMemo(() => {
    const log = waterLogs.find((w) => w.date === todayStr);
    return log ? log.amountMl : 0;
  }, [waterLogs, todayStr]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReloadAll = () => {
    setSettings(loadSettings());
    setAccounts(loadAccounts());
    setTransactions(loadTransactions());
    setBudgets(loadBudgets());
    setSavingsGoals(loadSavingsGoals());
    setDebtRecords(loadDebtRecords());
    setBillReminders(loadBillReminders());
    setMeals(loadMeals());
    setFoodDatabase(getAllFoodDatabase());
    setWaterLogs(loadWaterLogs());
    setWeightLogs(loadWeightLogs());
    showToast('Data refreshed');
  };

  // Transaction CRUD
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];
    if (existingId) {
      updated = transactions.map((t) =>
        t.id === existingId ? { ...t, ...txData } : t
      );
      showToast('Transaction updated');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}`,
        createdAt: Date.now()
      };
      updated = [newTx, ...transactions];
      showToast('Transaction recorded');
    }
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    showToast('Transaction deleted');
  };

  // Meal CRUD
  const handleSaveMeal = (
    mealData: Omit<MealRecord, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: MealRecord[];
    if (existingId) {
      updated = meals.map((m) =>
        m.id === existingId ? { ...m, ...mealData } : m
      );
      showToast('Meal updated');
    } else {
      const newMeal: MealRecord = {
        ...mealData,
        id: `meal_${Date.now()}`,
        createdAt: Date.now()
      };
      updated = [newMeal, ...meals];
      showToast('Meal logged');
    }
    setMeals(updated);
    saveMeals(updated);
  };

  const handleDeleteMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    saveMeals(updated);
    showToast('Meal deleted');
  };

  const handleSaveCustomFood = (food: FoodDatabaseItem) => {
    const custom = loadCustomFoods();
    const updated = [food, ...custom];
    saveCustomFoods(updated);
    setFoodDatabase(getAllFoodDatabase());
    showToast(`"${food.name}" saved to personal food library`);
  };

  // Water Tracker
  const handleUpdateWater = (date: string, deltaMl: number) => {
    const existing = waterLogs.find((w) => w.date === date);
    let updated: WaterLog[];
    if (existing) {
      const newAmount = Math.max(0, existing.amountMl + deltaMl);
      updated = waterLogs.map((w) =>
        w.date === date ? { ...w, amountMl: newAmount } : w
      );
    } else {
      updated = [
        ...waterLogs,
        {
          date,
          amountMl: Math.max(0, deltaMl),
          targetMl: settings.dailyWaterTargetMl || 3000
        }
      ];
    }
    setWaterLogs(updated);
    saveWaterLogs(updated);
    if (deltaMl > 0) {
      showToast(`+${deltaMl} ml water recorded 💧`);
    }
  };

  // Weight Tracker
  const handleAddWeight = (weightKg: number, date: string, notes?: string) => {
    const newEntry: WeightLog = {
      id: `w_${Date.now()}`,
      weightKg,
      date,
      notes
    };
    const updated = [newEntry, ...weightLogs];
    setWeightLogs(updated);
    saveWeightLogs(updated);
    showToast('Body weight recorded');
  };

  const handleDeleteWeight = (id: string) => {
    const updated = weightLogs.filter((w) => w.id !== id);
    setWeightLogs(updated);
    saveWeightLogs(updated);
  };

  // Bill Reminders & Automatic Payment
  const handlePayBillReminder = (bill: BillReminder) => {
    // Open transaction modal pre-filled with this bill
    setTxModalInitialType('expense');
    setEditingTransaction(null);
    setIsTxModalOpen(true);
    // When saved, mark as paid
    const updatedBills = billReminders.map((b) =>
      b.id === bill.id ? { ...b, isPaidForCurrentCycle: true } : b
    );
    setBillReminders(updatedBills);
    saveBillReminders(updatedBills);
  };

  // Savings Goal Deposit
  const handleDepositToGoal = (goalId: string, amountPaise: number) => {
    const updated = savingsGoals.map((g) =>
      g.id === goalId ? { ...g, currentAmountPaise: g.currentAmountPaise + amountPaise } : g
    );
    setSavingsGoals(updated);
    saveSavingsGoals(updated);
    showToast('Deposit saved toward goal');
  };

  // Udhar / Khata Settle
  const handleToggleSettleDebt = (id: string) => {
    const updated = debtRecords.map((d) =>
      d.id === id ? { ...d, isSettled: !d.isSettled } : d
    );
    setDebtRecords(updated);
    saveDebtRecords(updated);
    showToast('Debt status updated');
  };

  // Settings update
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setViewMode(newSettings.viewMode);
    showToast('Settings saved');
  };

  const handleToggleViewMode = (mode: 'phone' | 'responsive') => {
    setViewMode(mode);
    const updated = { ...settings, viewMode: mode };
    setSettings(updated);
    saveSettings(updated);
  };

  // Render App Lock if locked
  if (settings.appLockEnabled && !isUnlocked) {
    return (
      <AppLockScreen
        correctPin={settings.appLockPin || '1234'}
        onUnlock={() => setIsUnlocked(true)}
        onDisableLock={() => {
          const updated = { ...settings, appLockEnabled: false };
          setSettings(updated);
          saveSettings(updated);
          setIsUnlocked(true);
        }}
      />
    );
  }

  return (
    <AndroidFrame
      viewMode={viewMode}
      onToggleViewMode={handleToggleViewMode}
      onOpenApkModal={() => setIsApkModalOpen(true)}
    >
      {/* Active Tab Screen */}
      <div className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <HomeDashboard
            transactions={transactions}
            accounts={accounts}
            accountBalances={accountBalances}
            meals={meals}
            billReminders={billReminders}
            waterAmountMl={todayWaterAmount}
            settings={settings}
            onNavigateTab={setCurrentTab}
            onOpenAddExpense={() => {
              setTxModalInitialType('expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onOpenAddIncome={() => {
              setTxModalInitialType('income');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onOpenAddMeal={() => {
              setMealModalDefaultType('breakfast');
              setEditingMeal(null);
              setIsMealModalOpen(true);
            }}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onPayBillReminder={handlePayBillReminder}
            onQuickWaterAdd={() => handleUpdateWater(todayStr, 250)}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            accounts={accounts}
            settings={settings}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onOpenAddModal={() => {
              setTxModalInitialType('expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            accounts={accounts}
            budgets={budgets}
            settings={settings}
          />
        )}

        {currentTab === 'diet' && (
          <DietView
            meals={meals}
            waterLogs={waterLogs}
            weightLogs={weightLogs}
            foodDatabase={foodDatabase}
            settings={settings}
            onOpenAddMeal={(type) => {
              setMealModalDefaultType(type || 'breakfast');
              setEditingMeal(null);
              setIsMealModalOpen(true);
            }}
            onEditMeal={(meal) => {
              setEditingMeal(meal);
              setIsMealModalOpen(true);
            }}
            onDeleteMeal={handleDeleteMeal}
            onUpdateWater={handleUpdateWater}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            accounts={accounts}
            accountBalances={accountBalances}
            budgets={budgets}
            savingsGoals={savingsGoals}
            debtRecords={debtRecords}
            billReminders={billReminders}
            transactions={transactions}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onAddAccount={(acc) => {
              const updated = [...accounts, acc];
              setAccounts(updated);
              saveAccounts(updated);
              showToast(`Account "${acc.name}" created`);
            }}
            onDeleteAccount={(id) => {
              const updated = accounts.filter((a) => a.id !== id);
              setAccounts(updated);
              saveAccounts(updated);
              showToast('Account removed');
            }}
            onAddBudget={(b) => {
              const updated = [...budgets, b];
              setBudgets(updated);
              saveBudgets(updated);
              showToast('Budget configured');
            }}
            onDeleteBudget={(id) => {
              const updated = budgets.filter((b) => b.id !== id);
              setBudgets(updated);
              saveBudgets(updated);
            }}
            onAddSavingsGoal={(g) => {
              const updated = [...savingsGoals, g];
              setSavingsGoals(updated);
              saveSavingsGoals(updated);
              showToast('Goal created');
            }}
            onDepositToGoal={handleDepositToGoal}
            onDeleteSavingsGoal={(id) => {
              const updated = savingsGoals.filter((g) => g.id !== id);
              setSavingsGoals(updated);
              saveSavingsGoals(updated);
            }}
            onAddDebt={(d) => {
              const updated = [d, ...debtRecords];
              setDebtRecords(updated);
              saveDebtRecords(updated);
              showToast('Khata record added');
            }}
            onToggleSettleDebt={handleToggleSettleDebt}
            onDeleteDebt={(id) => {
              const updated = debtRecords.filter((d) => d.id !== id);
              setDebtRecords(updated);
              saveDebtRecords(updated);
            }}
            onAddBillReminder={(b) => {
              const updated = [b, ...billReminders];
              setBillReminders(updated);
              saveBillReminders(updated);
              showToast('Bill reminder created');
            }}
            onDeleteBillReminder={(id) => {
              const updated = billReminders.filter((b) => b.id !== id);
              setBillReminders(updated);
              saveBillReminders(updated);
            }}
            onReloadAllData={handleReloadAll}
            onOpenApkModal={() => setIsApkModalOpen(true)}
          />
        )}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Quick Action Bottom Sheet */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={(action) => {
          if (action === 'add_expense') {
            setTxModalInitialType('expense');
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          } else if (action === 'add_income') {
            setTxModalInitialType('income');
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          } else if (action === 'transfer') {
            setTxModalInitialType('transfer');
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          } else if (action === 'add_meal') {
            setMealModalDefaultType('breakfast');
            setEditingMeal(null);
            setIsMealModalOpen(true);
          } else if (action === 'quick_water') {
            handleUpdateWater(todayStr, 250);
          } else if (action === 'add_bill') {
            setCurrentTab('settings');
          }
        }}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        accounts={accounts}
        accountBalances={accountBalances}
        settings={settings}
        initialType={txModalInitialType}
      />

      {/* Add / Edit Meal Modal */}
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        onDelete={handleDeleteMeal}
        onSaveCustomFood={handleSaveCustomFood}
        editingMeal={editingMeal}
        foodDatabase={foodDatabase}
        defaultMealType={mealModalDefaultType}
      />

      {/* Android APK & Source Packaging Guide Modal */}
      <ApkGuideModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Micro-Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}
    </AndroidFrame>
  );
}
