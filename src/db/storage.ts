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
  ReportPeriod
} from '../types';
import { INITIAL_FOOD_DATABASE } from '../data/constants';

const STORAGE_KEYS = {
  TRANSACTIONS: 'dlm_transactions_v2',
  ACCOUNTS: 'dlm_accounts_v2',
  BUDGETS: 'dlm_budgets_v2',
  SAVINGS_GOALS: 'dlm_savings_goals_v2',
  DEBT_RECORDS: 'dlm_debt_records_v2',
  BILL_REMINDERS: 'dlm_bill_reminders_v2',
  MEALS: 'dlm_meals_v2',
  CUSTOM_FOODS: 'dlm_custom_foods_v2',
  WATER_LOGS: 'dlm_water_logs_v2',
  WEIGHT_LOGS: 'dlm_weight_logs_v2',
  SETTINGS: 'dlm_settings_v2'
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  numberFormat: 'in',
  dateFormat: 'DD/MM/YYYY',
  dailyCalorieTarget: 2000,
  dailyWaterTargetMl: 3000,
  overallMonthlyBudgetPaise: 4500000, // ₹45,000
  overallDailyBudgetPaise: 150000, // ₹1,500
  appLockEnabled: false,
  appLockPin: '1234',
  notificationsEnabled: true,
  billRemindersEnabled: true,
  mealRemindersEnabled: true,
  waterRemindersEnabled: true,
  viewMode: 'phone',
  theme: 'light'
};

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash',
    name: 'Cash in Hand',
    type: 'cash',
    openingBalancePaise: 450000, // ₹4,500
    color: '#10b981'
  },
  {
    id: 'acc_sbi',
    name: 'SBI Salary Account',
    type: 'bank',
    openingBalancePaise: 5200000, // ₹52,000
    color: '#2563eb',
    accountNumberMasked: '•••• 4892',
    bankName: 'State Bank of India'
  },
  {
    id: 'acc_hdfc',
    name: 'HDFC Savings Account',
    type: 'bank',
    openingBalancePaise: 2850000, // ₹28,500
    color: '#0284c7',
    accountNumberMasked: '•••• 7120',
    bankName: 'HDFC Bank'
  },
  {
    id: 'acc_wallet',
    name: 'Paytm / PhonePe Wallet',
    type: 'wallet',
    openingBalancePaise: 235000, // ₹2,350
    color: '#06b6d4'
  },
  {
    id: 'acc_icici_cc',
    name: 'ICICI Amazon Pay Credit Card',
    type: 'credit_card',
    openingBalancePaise: -640000, // -₹6,400 (Outstanding)
    color: '#f97316',
    accountNumberMasked: '•••• 9931',
    bankName: 'ICICI Bank'
  }
];

export const DEFAULT_BUDGETS: Budget[] = [
  {
    id: 'b_overall',
    period: 'monthly',
    category: '', // Overall
    limitPaise: 4500000, // ₹45,000
    alertThresholdPct: 80
  },
  {
    id: 'b_food',
    period: 'monthly',
    category: 'Food & Dining',
    limitPaise: 1200000, // ₹12,000
    alertThresholdPct: 85
  },
  {
    id: 'b_utilities',
    period: 'monthly',
    category: 'Utilities',
    limitPaise: 500000, // ₹5,000
    alertThresholdPct: 80
  },
  {
    id: 'b_transport',
    period: 'monthly',
    category: 'Transport & Fuel',
    limitPaise: 400000, // ₹4,000
    alertThresholdPct: 80
  },
  {
    id: 'b_shopping',
    period: 'monthly',
    category: 'Shopping & Personal',
    limitPaise: 600000, // ₹6,000
    alertThresholdPct: 80
  }
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal_emergency',
    name: 'Emergency Fund (6 Months)',
    targetAmountPaise: 15000000, // ₹1,50,000
    currentAmountPaise: 6500000, // ₹65,000
    targetDate: '2026-12-31',
    color: '#10b981',
    category: 'Safety'
  },
  {
    id: 'goal_trip',
    name: 'Diwali Family Vacation',
    targetAmountPaise: 4000000, // ₹40,000
    currentAmountPaise: 2250000, // ₹22,500
    targetDate: '2026-11-15',
    color: '#f59e0b',
    category: 'Travel'
  },
  {
    id: 'goal_gadget',
    name: 'New Work Laptop',
    targetAmountPaise: 7500000, // ₹75,000
    currentAmountPaise: 4200000, // ₹42,000
    targetDate: '2027-03-31',
    color: '#8b5cf6',
    category: 'Work'
  }
];

export const DEFAULT_DEBT_RECORDS: DebtRecord[] = [
  {
    id: 'debt_1',
    personName: 'Rahul Sharma (Colleague)',
    type: 'lent',
    amountPaise: 300000, // ₹3,000 (Receivable)
    date: '2026-10-20',
    dueDate: '2026-11-05',
    note: 'Lent for concert tickets split via UPI',
    isSettled: false
  },
  {
    id: 'debt_2',
    personName: 'Amit Verma',
    type: 'borrowed',
    amountPaise: 150000, // ₹1,500 (Payable)
    date: '2026-10-24',
    dueDate: '2026-10-31',
    note: 'Team buffet lunch split contribution',
    isSettled: false
  }
];

export const DEFAULT_BILL_REMINDERS: BillReminder[] = [
  {
    id: 'bill_rent',
    title: 'House Rent',
    category: 'Housing & Rent',
    amountPaise: 1800000, // ₹18,000
    dueDate: '2026-11-01',
    frequency: 'monthly',
    isPaidForCurrentCycle: false,
    billerName: 'Landlord - Arvind Rao',
    accountId: 'acc_sbi'
  },
  {
    id: 'bill_elec',
    title: 'Electricity (BESCOM)',
    category: 'Utilities',
    amountPaise: 185000, // ₹1,850
    dueDate: '2026-11-10',
    frequency: 'monthly',
    isPaidForCurrentCycle: false,
    billerName: 'BESCOM Bangalore'
  },
  {
    id: 'bill_wifi',
    title: 'Airtel Xstream Fiber',
    category: 'Utilities',
    amountPaise: 94300, // ₹943
    dueDate: '2026-11-18',
    frequency: 'monthly',
    isPaidForCurrentCycle: false,
    billerName: 'Airtel Broadband'
  },
  {
    id: 'bill_mobile',
    title: 'Jio Mobile Postpaid',
    category: 'Utilities',
    amountPaise: 49900, // ₹499
    dueDate: '2026-11-22',
    frequency: 'monthly',
    isPaidForCurrentCycle: false,
    billerName: 'Reliance Jio'
  }
];

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getDayStringOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function generateSeedTransactions(): Transaction[] {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const dayMinus3 = getDayStringOffset(-3);
  const dayMinus5 = getDayStringOffset(-5);
  const dayMinus8 = getDayStringOffset(-8);
  const dayMinus12 = getDayStringOffset(-12);
  const dayMinus20 = getDayStringOffset(-20);

  return [
    {
      id: 'tx_salary',
      amountPaise: 7500000, // ₹75,000
      type: 'income',
      category: 'Salary',
      subcategory: 'Monthly Salary',
      date: dayMinus20,
      time: '09:30',
      paymentMethod: 'bank_transfer',
      accountId: 'acc_sbi',
      note: 'October Salary Credited from Infosys Technologies',
      createdAt: Date.now() - 20 * 86400000
    },
    {
      id: 'tx_rent',
      amountPaise: 1800000, // ₹18,000
      type: 'expense',
      category: 'Housing & Rent',
      subcategory: 'House Rent',
      date: dayMinus20,
      time: '11:15',
      paymentMethod: 'bank_transfer',
      accountId: 'acc_sbi',
      note: 'Monthly flat rent paid via NEFT to Landlord',
      createdAt: Date.now() - 20 * 86400000 + 3600000
    },
    {
      id: 'tx_freelance',
      amountPaise: 1250000, // ₹12,500
      type: 'income',
      category: 'Freelance & Gig',
      subcategory: 'Design/Coding Work',
      date: dayMinus12,
      time: '16:45',
      paymentMethod: 'bank_transfer',
      accountId: 'acc_hdfc',
      note: 'Payment received for Fintech Dashboard UX consultation',
      createdAt: Date.now() - 12 * 86400000
    },
    {
      id: 'tx_transfer_1',
      amountPaise: 1000000, // ₹10,000
      type: 'transfer',
      category: 'Transfer',
      date: dayMinus12,
      time: '17:00',
      paymentMethod: 'bank_transfer',
      accountId: 'acc_sbi',
      toAccountId: 'acc_hdfc',
      note: 'Transfer from SBI to HDFC for savings investment',
      createdAt: Date.now() - 12 * 86400000 + 1000
    },
    {
      id: 'tx_blinkit',
      amountPaise: 245000, // ₹2,450
      type: 'expense',
      category: 'Food & Dining',
      subcategory: 'Groceries',
      date: dayMinus8,
      time: '14:20',
      paymentMethod: 'upi',
      accountId: 'acc_wallet',
      note: 'Blinkit Monthly kitchen staples, cooking oil & spices',
      createdAt: Date.now() - 8 * 86400000
    },
    {
      id: 'tx_fuel',
      amountPaise: 150000, // ₹1,500
      type: 'expense',
      category: 'Transport & Fuel',
      subcategory: 'Petrol / Diesel',
      date: dayMinus5,
      time: '08:45',
      paymentMethod: 'credit_card',
      accountId: 'acc_icici_cc',
      note: 'IndianOil petrol tank refill',
      createdAt: Date.now() - 5 * 86400000
    },
    {
      id: 'tx_bescom',
      amountPaise: 185000, // ₹1,850
      type: 'expense',
      category: 'Utilities',
      subcategory: 'Electricity Bill',
      date: dayMinus3,
      time: '12:10',
      paymentMethod: 'upi',
      accountId: 'acc_hdfc',
      note: 'Electricity BESCOM bill paid via GPay',
      createdAt: Date.now() - 3 * 86400000
    },
    {
      id: 'tx_veg_mandi',
      amountPaise: 35000, // ₹350
      type: 'expense',
      category: 'Food & Dining',
      subcategory: 'Vegetables & Sabzi',
      date: yesterday,
      time: '18:30',
      paymentMethod: 'cash',
      accountId: 'acc_cash',
      note: 'Fresh sabzi & fruits from weekly local mandi',
      createdAt: Date.now() - 86400000
    },
    {
      id: 'tx_swiggy_dinner',
      amountPaise: 68000, // ₹680
      type: 'expense',
      category: 'Food & Dining',
      subcategory: 'Swiggy / Zomato',
      date: yesterday,
      time: '20:45',
      paymentMethod: 'upi',
      accountId: 'acc_wallet',
      note: 'Paneer tikka and naan dinner from Swiggy',
      createdAt: Date.now() - 86400000 + 7200000
    },
    {
      id: 'tx_milk_today',
      amountPaise: 12000, // ₹120
      type: 'expense',
      category: 'Food & Dining',
      subcategory: 'Milk & Dairy',
      date: today,
      time: '07:15',
      paymentMethod: 'upi',
      accountId: 'acc_wallet',
      note: '2 packets Amul Taaza milk & curd',
      createdAt: Date.now() - 14400000
    },
    {
      id: 'tx_chai_today',
      amountPaise: 3000, // ₹30
      type: 'expense',
      category: 'Food & Dining',
      subcategory: 'Tea & Coffee',
      date: today,
      time: '10:30',
      paymentMethod: 'upi',
      accountId: 'acc_wallet',
      note: 'Morning Ginger Chai at tapri',
      createdAt: Date.now() - 7200000
    }
  ];
}

export function generateSeedMeals(): MealRecord[] {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  return [
    {
      id: 'meal_yesterday_1',
      date: yesterday,
      time: '08:45',
      mealType: 'breakfast',
      foodName: 'Vegetable Upma (Rava)',
      servingSize: '1 bowl (150g)',
      servings: 1,
      calories: 220,
      proteinG: 5.0,
      carbsG: 35.0,
      fatG: 6.5,
      createdAt: Date.now() - 86400000
    },
    {
      id: 'meal_yesterday_2',
      date: yesterday,
      time: '13:15',
      mealType: 'lunch',
      foodName: 'Roti / Chapati (Wheat)',
      servingSize: '1 medium roti (35g)',
      servings: 2,
      calories: 208,
      proteinG: 6.2,
      carbsG: 37.0,
      fatG: 1.8,
      createdAt: Date.now() - 86400000 + 14400000
    },
    {
      id: 'meal_yesterday_3',
      date: yesterday,
      time: '13:15',
      mealType: 'lunch',
      foodName: 'Dal Tadka (Toor / Moong)',
      servingSize: '1 bowl (150g)',
      servings: 1,
      calories: 165,
      proteinG: 9.0,
      carbsG: 22.0,
      fatG: 4.5,
      createdAt: Date.now() - 86400000 + 14400000
    },
    {
      id: 'meal_today_1',
      date: today,
      time: '08:30',
      mealType: 'breakfast',
      foodName: 'Kanda Poha (Flattened rice)',
      servingSize: '1 bowl with peanuts (150g)',
      servings: 1,
      calories: 210,
      proteinG: 4.2,
      carbsG: 36.0,
      fatG: 5.8,
      notes: 'Lightly roasted with peanuts and curry leaves',
      createdAt: Date.now() - 14400000
    },
    {
      id: 'meal_today_2',
      date: today,
      time: '09:00',
      mealType: 'morning_snack',
      foodName: 'Masala Chai with Milk & Sugar',
      servingSize: '1 standard cup (150ml)',
      servings: 1,
      calories: 95,
      proteinG: 2.8,
      carbsG: 12.0,
      fatG: 3.5,
      createdAt: Date.now() - 12000000
    },
    {
      id: 'meal_today_3',
      date: today,
      time: '13:30',
      mealType: 'lunch',
      foodName: 'Roti / Chapati (Wheat)',
      servingSize: '1 medium roti (35g)',
      servings: 2,
      calories: 208,
      proteinG: 6.2,
      carbsG: 37.0,
      fatG: 1.8,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'meal_today_4',
      date: today,
      time: '13:30',
      mealType: 'lunch',
      foodName: 'Dal Tadka (Toor / Moong)',
      servingSize: '1 bowl (150g)',
      servings: 1,
      calories: 165,
      proteinG: 9.0,
      carbsG: 22.0,
      fatG: 4.5,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'meal_today_5',
      date: today,
      time: '13:30',
      mealType: 'lunch',
      foodName: 'Plain Curd / Dahi',
      servingSize: '1 cup (150g)',
      servings: 1,
      calories: 98,
      proteinG: 5.2,
      carbsG: 7.0,
      fatG: 4.5,
      createdAt: Date.now() - 3600000
    }
  ];
}

export function generateSeedWaterLogs(): WaterLog[] {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  return [
    { date: yesterday, amountMl: 2750, targetMl: 3000 },
    { date: today, amountMl: 1750, targetMl: 3000 }
  ];
}

export function generateSeedWeightLogs(): WeightLog[] {
  const today = getTodayString();
  return [
    { id: 'w_1', date: getDayStringOffset(-28), weightKg: 70.2, notes: 'Starting weight check' },
    { id: 'w_2', date: getDayStringOffset(-14), weightKg: 69.5, notes: 'Post regular morning walks' },
    { id: 'w_3', date: getDayStringOffset(-7), weightKg: 68.9, notes: 'Balanced diet' },
    { id: 'w_4', date: today, weightKg: 68.4, notes: 'Morning empty stomach' }
  ];
}

// ----------------- Storage Access Methods -----------------

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading accounts', e);
  }
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions', e);
  }
  const seed = generateSeedTransactions();
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(seed));
  return seed;
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading budgets', e);
  }
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
  return DEFAULT_BUDGETS;
}

export function saveBudgets(budgets: Budget[]): void {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

export function loadSavingsGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading savings goals', e);
  }
  localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
  return DEFAULT_SAVINGS_GOALS;
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
}

export function loadDebtRecords(): DebtRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBT_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading debt records', e);
  }
  localStorage.setItem(STORAGE_KEYS.DEBT_RECORDS, JSON.stringify(DEFAULT_DEBT_RECORDS));
  return DEFAULT_DEBT_RECORDS;
}

export function saveDebtRecords(records: DebtRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.DEBT_RECORDS, JSON.stringify(records));
}

export function loadBillReminders(): BillReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILL_REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading bill reminders', e);
  }
  localStorage.setItem(STORAGE_KEYS.BILL_REMINDERS, JSON.stringify(DEFAULT_BILL_REMINDERS));
  return DEFAULT_BILL_REMINDERS;
}

export function saveBillReminders(reminders: BillReminder[]): void {
  localStorage.setItem(STORAGE_KEYS.BILL_REMINDERS, JSON.stringify(reminders));
}

export function loadMeals(): MealRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading meals', e);
  }
  const seed = generateSeedMeals();
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(seed));
  return seed;
}

export function saveMeals(meals: MealRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

export function loadCustomFoods(): FoodDatabaseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading custom foods', e);
  }
  return [];
}

export function saveCustomFoods(foods: FoodDatabaseItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(foods));
}

export function getAllFoodDatabase(): FoodDatabaseItem[] {
  const custom = loadCustomFoods();
  return [...INITIAL_FOOD_DATABASE, ...custom];
}

export function loadWaterLogs(): WaterLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading water logs', e);
  }
  const seed = generateSeedWaterLogs();
  localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(seed));
  return seed;
}

export function saveWaterLogs(logs: WaterLog[]): void {
  localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(logs));
}

export function loadWeightLogs(): WeightLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading weight logs', e);
  }
  const seed = generateSeedWeightLogs();
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(seed));
  return seed;
}

export function saveWeightLogs(logs: WeightLog[]): void {
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
}

// ----------------- Financial Calculations & Balances -----------------

/**
 * Calculate the true current balance for every account
 * Opening balance + Incomes - Expenses + Inward Transfers - Outward Transfers
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // Initialize with opening balance
  accounts.forEach((acc) => {
    balances[acc.id] = acc.openingBalancePaise;
  });

  // Replay transactions
  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] += tx.amountPaise;
      }
    } else if (tx.type === 'expense') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amountPaise;
      }
    } else if (tx.type === 'transfer') {
      // Outward from source
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amountPaise;
      }
      // Inward to destination
      if (tx.toAccountId && balances[tx.toAccountId] !== undefined) {
        balances[tx.toAccountId] += tx.amountPaise;
      }
    }
  });

  return balances;
}

/**
 * Total available net balance across all cash, bank, and wallet accounts
 * (excluding credit card outstanding or treating credit card as liability)
 */
export function calculateTotalNetWorth(
  accounts: Account[],
  balances: Record<string, number>
): { totalAssetsPaise: number; totalLiabilitiesPaise: number; netBalancePaise: number } {
  let assets = 0;
  let liabilities = 0;

  accounts.forEach((acc) => {
    const bal = balances[acc.id] ?? 0;
    if (acc.type === 'credit_card') {
      // If credit card is negative (you owe money), it's a liability
      if (bal < 0) {
        liabilities += Math.abs(bal);
      } else {
        assets += bal;
      }
    } else {
      if (bal >= 0) {
        assets += bal;
      } else {
        liabilities += Math.abs(bal); // Overdraft
      }
    }
  });

  return {
    totalAssetsPaise: assets,
    totalLiabilitiesPaise: liabilities,
    netBalancePaise: assets - liabilities
  };
}

// ----------------- Export & Backup -----------------

export function exportCompleteDatabaseJSON(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings: loadSettings(),
    accounts: loadAccounts(),
    transactions: loadTransactions(),
    budgets: loadBudgets(),
    savingsGoals: loadSavingsGoals(),
    debtRecords: loadDebtRecords(),
    billReminders: loadBillReminders(),
    meals: loadMeals(),
    customFoods: loadCustomFoods(),
    waterLogs: loadWaterLogs(),
    weightLogs: loadWeightLogs()
  };
  return JSON.stringify(data, null, 2);
}

export function restoreCompleteDatabaseJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;

    if (data.settings) saveSettings(data.settings);
    if (data.accounts) saveAccounts(data.accounts);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.savingsGoals) saveSavingsGoals(data.savingsGoals);
    if (data.debtRecords) saveDebtRecords(data.debtRecords);
    if (data.billReminders) saveBillReminders(data.billReminders);
    if (data.meals) saveMeals(data.meals);
    if (data.customFoods) saveCustomFoods(data.customFoods);
    if (data.waterLogs) saveWaterLogs(data.waterLogs);
    if (data.weightLogs) saveWeightLogs(data.weightLogs);

    return true;
  } catch (e) {
    console.error('Failed to parse and restore database', e);
    return false;
  }
}

export function resetAllDataToDefault(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

/**
 * Generate CSV string from transactions
 */
export function exportTransactionsToCSV(transactions: Transaction[], accounts: Account[]): string {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Category',
    'Subcategory',
    'Amount (INR)',
    'Amount (Paise)',
    'Payment Method',
    'Source Account',
    'Destination Account (Transfer)',
    'Notes'
  ];

  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${tx.time}"`,
    `"${tx.type.toUpperCase()}"`,
    `"${tx.category || ''}"`,
    `"${tx.subcategory || ''}"`,
    `"${(tx.amountPaise / 100).toFixed(2)}"`,
    tx.amountPaise,
    `"${tx.paymentMethod}"`,
    `"${accountMap.get(tx.accountId) || tx.accountId}"`,
    `"${tx.toAccountId ? accountMap.get(tx.toAccountId) || tx.toAccountId : ''}"`,
    `"${(tx.note || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
