import React, { useState, useMemo } from 'react';
import { Transaction, Account, AppSettings, TransactionType } from '../types';
import { formatPaise } from '../utils/currency';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Download,
  Calendar,
  Camera,
  Plus,
  Repeat
} from 'lucide-react';
import { exportTransactionsToCSV } from '../db/storage';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  settings: AppSettings;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  settings,
  onSelectTransaction,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Account filter
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inNote = (tx.note || '').toLowerCase().includes(query);
        const inCat = (tx.category || '').toLowerCase().includes(query);
        const inSub = (tx.subcategory || '').toLowerCase().includes(query);
        const inAcc = (accountMap.get(tx.accountId) || '').toLowerCase().includes(query);
        const inMethod = tx.paymentMethod.toLowerCase().includes(query);
        if (!inNote && !inCat && !inSub && !inAcc && !inMethod) return false;
      }

      return true;
    }).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [transactions, typeFilter, selectedAccount, selectedCategory, searchQuery, accountMap]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filtered]);

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(filtered, accounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily_life_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transactions Passbook
          </h1>
          <span className="text-[11px] text-slate-500">
            {filtered.length} transactions found
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors border border-slate-200/80 dark:border-slate-700"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by note, shop, UPI, category, account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Segmented Type Bar */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
        {[
          { id: 'all', label: 'All' },
          { id: 'expense', label: 'Expenses' },
          { id: 'income', label: 'Income' },
          { id: 'transfer', label: 'Transfers' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id as any)}
            className={`py-1.5 rounded-lg transition-all ${
              typeFilter === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Feed Grouped by Date */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No transactions match
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Try adjusting your search query, filter criteria, or record a new transaction.
            </p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, txs]) => {
            const dateLabel =
              date === todayStr
                ? 'Today'
                : date === yesterdayStr
                ? 'Yesterday'
                : new Date(date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

            // Calculate day total
            const dayExpense = txs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amountPaise, 0);
            const dayIncome = txs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amountPaise, 0);

            return (
              <div key={date} className="space-y-2">
                {/* Date Header with Day Summary */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dateLabel}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {dayIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatPaise(dayIncome, false, settings)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatPaise(dayExpense, false, settings)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day's Transactions List */}
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700/40 overflow-hidden shadow-xs">
                  {txs.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    const srcAccountName = accountMap.get(tx.accountId) || 'Account';
                    const destAccountName = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
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
                                <span className="text-[10px] px-1 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-normal">
                                  Bill
                                </span>
                              )}
                              {tx.isRecurring && (
                                <Repeat className="w-3 h-3 text-purple-500" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                              <span>{tx.time}</span>
                              <span>·</span>
                              <span>
                                {isTransfer
                                  ? `${srcAccountName} → ${destAccountName}`
                                  : `${srcAccountName} · ${tx.paymentMethod.toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
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
                          <span className="text-[10px] text-slate-400 block">
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
