/**
 * Daily Life Manager - Domain Types
 * All financial amounts are stored as integer paise to prevent floating-point rounding errors.
 * 1 INR = 100 Paise. Example: ₹150.75 is stored as 15075 paise.
 */

export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'debit_card' | 'credit_card';

export interface Transaction {
  id: string;
  amountPaise: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  accountId: string; // Source account
  toAccountId?: string; // Destination account for transfers
  note?: string;
  receiptUrl?: string; // Data URL or reference
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  createdAt: number;
}

export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalancePaise: number;
  color: string;
  accountNumberMasked?: string;
  bankName?: string;
}

export interface Budget {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  category?: string; // empty means overall budget
  limitPaise: number;
  alertThresholdPct: number; // e.g. 80
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmountPaise: number;
  currentAmountPaise: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  category?: string;
}

export interface DebtRecord {
  id: string;
  personName: string;
  type: 'lent' | 'borrowed'; // lent = you gave money (receivable), borrowed = you took money (payable)
  amountPaise: number;
  date: string;
  dueDate?: string;
  note?: string;
  isSettled: boolean;
  settledDate?: string;
}

export interface BillReminder {
  id: string;
  title: string;
  category: string;
  amountPaise: number;
  dueDate: string; // YYYY-MM-DD or Day of month
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  isPaidForCurrentCycle: boolean;
  paymentMethod?: PaymentMethod;
  accountId?: string;
  billerName?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'evening_snack';

export interface MealRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  foodName: string;
  servingSize: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
  createdAt: number;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  defaultServings: number;
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom?: boolean;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  targetMl: number;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  numberFormat: 'in' | 'intl'; // 'in' = 1,00,000 ; 'intl' = 100,000
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  dailyCalorieTarget: number;
  dailyWaterTargetMl: number;
  overallMonthlyBudgetPaise: number;
  overallDailyBudgetPaise: number;
  appLockEnabled: boolean;
  appLockPin: string; // 4 digits
  notificationsEnabled: boolean;
  billRemindersEnabled: boolean;
  mealRemindersEnabled: boolean;
  waterRemindersEnabled: boolean;
  viewMode: 'phone' | 'responsive';
  theme: 'light' | 'dark';
}

export type ReportPeriod =
  | 'today'
  | 'yesterday'
  | 'current_week'
  | 'previous_week'
  | 'current_month'
  | 'previous_month'
  | 'current_year'
  | 'previous_year'
  | 'custom';
