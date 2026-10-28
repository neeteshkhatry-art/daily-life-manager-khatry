import React, { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  Account,
  AppSettings
} from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/constants';
import { formatPaise, parseToPaise, paiseToInputString } from '../utils/currency';
import { X, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Camera, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { AppIcon } from './Icon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  accounts: Account[];
  accountBalances: Record<string, number>;
  settings: AppSettings;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  accounts,
  accountBalances,
  settings,
  initialType = 'expense'
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when modal opens or editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(paiseToInputString(editingTransaction.amountPaise));
      setCategory(editingTransaction.category);
      setSubcategory(editingTransaction.subcategory || '');
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setPaymentMethod(editingTransaction.paymentMethod);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setNote(editingTransaction.note || '');
      setReceiptUrl(editingTransaction.receiptUrl);
      setIsRecurring(!!editingTransaction.isRecurring);
      setRecurringFrequency(editingTransaction.recurringFrequency || 'monthly');
    } else {
      setType(initialType);
      setAmountStr('');
      const defaultCat = initialType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name;
      setCategory(defaultCat);
      setSubcategory('');
      setAccountId(accounts[0]?.id || '');
      setToAccountId(accounts[1]?.id || '');
      setPaymentMethod('upi');
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setNote('');
      setReceiptUrl(undefined);
      setIsRecurring(false);
      setRecurringFrequency('monthly');
    }
    setErrorMsg('');
  }, [editingTransaction, isOpen, initialType, accounts]);

  if (!isOpen) return null;

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedCatObj = currentCategories.find((c) => c.name === category);

  // Compute selected account balance and check for insufficient funds
  const currentAcc = accounts.find((a) => a.id === accountId);
  const selectedBalance = currentAcc ? accountBalances[currentAcc.id] ?? 0 : 0;
  const currentPaise = parseToPaise(amountStr);
  const isInsufficient =
    (type === 'expense' || type === 'transfer') &&
    currentAcc &&
    currentAcc.type !== 'credit_card' &&
    currentPaise > selectedBalance;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    // Generate an illustrative bill receipt SVG data uri
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="%23f8fafc"><rect width="300" height="400" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="150" y="45" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="%231e293b">BILL RECEIPT</text><line x1="20" y1="65" x2="280" y2="65" stroke="%2394a3b8" stroke-dasharray="4"/><text x="30" y="100" font-family="sans-serif" font-size="12" fill="%2364748b">Date: ${date}</text><text x="30" y="125" font-family="sans-serif" font-size="12" fill="%2364748b">Merchant: Daily Life Store</text><text x="30" y="150" font-family="sans-serif" font-size="12" fill="%2364748b">Category: ${category}</text><line x1="20" y1="180" x2="280" y2="180" stroke="%23cbd5e1"/><text x="30" y="220" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b">Total Paid:</text><text x="270" y="220" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="end" fill="%232563eb">₹${amountStr || '0.00'}</text><text x="150" y="320" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%2310b981">✓ PAID VIA ${paymentMethod.toUpperCase()}</text></svg>`;
    setReceiptUrl(sampleSvg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = parseToPaise(amountStr);
    if (paise <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }
    if (!accountId) {
      setErrorMsg('Please select a payment account.');
      return;
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setErrorMsg('Please select a different destination account for transfer.');
      return;
    }

    onSave(
      {
        amountPaise: paise,
        type,
        category: type === 'transfer' ? 'Transfer' : category,
        subcategory: type === 'transfer' ? undefined : subcategory,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '12:00',
        paymentMethod,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        note: note.trim(),
        receiptUrl,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type Selector */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented Type Bar */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (type !== 'expense') setCategory(EXPENSE_CATEGORIES[0].name);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (type !== 'income') setCategory(INCOME_CATEGORIES[0].name);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Display and Input */}
          <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400 mr-1">{settings.currencySymbol}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-48 text-3xl font-extrabold text-center bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 font-mono tracking-tight text-slate-900 dark:text-white"
              />
            </div>
            {currentPaise > 0 && (
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {formatPaise(currentPaise, true, settings)}
              </p>
            )}
          </div>

          {/* Insufficient Balance Alert */}
          {isInsufficient && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Insufficient Account Balance</p>
                <p className="text-[11px] opacity-90">
                  {currentAcc?.name} currently holds {formatPaise(selectedBalance, true, settings)}. This transaction will make the balance negative.
                </p>
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {type === 'transfer' ? 'From Account' : 'Account / Wallet'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatPaise(accountBalances[acc.id] ?? 0, false, settings)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  To Destination Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select destination</option>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatPaise(accountBalances[acc.id] ?? 0, false, settings)})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Picker (only for expense & income) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
                {currentCategories.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name);
                        setSubcategory('');
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 font-semibold text-blue-700 dark:text-blue-300'
                          : 'bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <AppIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories */}
              {selectedCatObj && selectedCatObj.subcategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 mr-1">Subcategory:</span>
                  {selectedCatObj.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                        subcategory === sub
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy dinner order, Metro smart card recharge"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Receipt Photo Attachment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                <span>Receipt Photo / Bill (Optional)</span>
              </label>
              {!receiptUrl ? (
                <button
                  type="button"
                  onClick={handleUseSampleReceipt}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  + Add Sample Bill
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="text-[11px] text-rose-500 hover:underline font-medium"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {receiptUrl ? (
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center">
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="max-h-36 object-contain rounded-lg"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  Tap to upload bill photo or receipt
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Recurring Transaction Setting */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Recurring Schedule
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Repeat this {type} automatically
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              {isRecurring && (
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          {editingTransaction && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to permanently delete this transaction?')) {
                  onDelete(editingTransaction.id);
                  onClose();
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
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
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Save Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
