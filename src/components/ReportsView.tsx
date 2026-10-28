import React, { useState, useMemo } from 'react';
import {
  Transaction,
  Account,
  Budget,
  AppSettings,
  ReportPeriod
} from '../types';
import { formatPaise, formatPaiseCompact } from '../utils/currency';
import {
  Download,
  Share2,
  Printer,
  Calendar,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import { exportTransactionsToCSV } from '../db/storage';

interface ReportsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  accounts,
  budgets,
  settings
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('current_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDonutIndex, setSelectedDonutIndex] = useState<number | null>(null);

  // Compute date range for selected period
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        return { start: todayStr, end: todayStr, label: 'Today' };

      case 'yesterday': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        return { start: yStr, end: yStr, label: 'Yesterday' };
      }

      case 'current_week': {
        const curr = new Date(now);
        const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // Monday
        const monday = new Date(curr.setDate(first)).toISOString().split('T')[0];
        return { start: monday, end: todayStr, label: 'Current Week' };
      }

      case 'previous_week': {
        const curr = new Date(now);
        const prevMon = new Date(curr.setDate(curr.getDate() - curr.getDay() - 6)).toISOString().split('T')[0];
        const prevSun = new Date(curr.setDate(curr.getDate() + 6)).toISOString().split('T')[0];
        return { start: prevMon, end: prevSun, label: 'Previous Week' };
      }

      case 'current_month': {
        const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return { start, end: todayStr, label: 'Current Month' };
      }

      case 'previous_month': {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          start: prevMonthDate.toISOString().split('T')[0],
          end: lastDayPrevMonth.toISOString().split('T')[0],
          label: 'Previous Month'
        };
      }

      case 'current_year': {
        return {
          start: `${now.getFullYear()}-01-01`,
          end: todayStr,
          label: `Year ${now.getFullYear()}`
        };
      }

      case 'previous_year': {
        const py = now.getFullYear() - 1;
        return {
          start: `${py}-01-01`,
          end: `${py}-12-31`,
          label: `Year ${py}`
        };
      }

      case 'custom':
        return {
          start: customStart || todayStr,
          end: customEnd || todayStr,
          label: 'Custom Range'
        };

      default:
        return { start: todayStr, end: todayStr, label: 'Today' };
    }
  }, [period, customStart, customEnd]);

  // Filter transactions in range
  const periodTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.date >= dateRange.start && tx.date <= dateRange.end
    );
  }, [transactions, dateRange]);

  // Totals
  const totalIncomePaise = useMemo(
    () =>
      periodTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amountPaise, 0),
    [periodTransactions]
  );

  const totalExpensePaise = useMemo(
    () =>
      periodTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amountPaise, 0),
    [periodTransactions]
  );

  const netCashFlowPaise = totalIncomePaise - totalExpensePaise;
  const savingsRate =
    totalIncomePaise > 0
      ? Math.max(0, Math.round((netCashFlowPaise / totalIncomePaise) * 100))
      : 0;

  // Category-wise expenses
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + t.amountPaise;
      });

    const entries = Object.entries(map).map(([name, amountPaise]) => ({
      name,
      amountPaise,
      percentage: totalExpensePaise > 0 ? Math.round((amountPaise / totalExpensePaise) * 100) : 0
    }));

    return entries.sort((a, b) => b.amountPaise - a.amountPaise);
  }, [periodTransactions, totalExpensePaise]);

  // Payment Method Breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const method = t.paymentMethod.toUpperCase();
        map[method] = (map[method] || 0) + t.amountPaise;
      });

    return Object.entries(map).map(([method, amountPaise]) => ({
      method,
      amountPaise,
      pct: totalExpensePaise > 0 ? Math.round((amountPaise / totalExpensePaise) * 100) : 0
    }));
  }, [periodTransactions, totalExpensePaise]);

  // Account-wise Breakdown
  const accountBreakdown = useMemo(() => {
    const accMap = new Map(accounts.map((a) => [a.id, a.name]));
    const map: Record<string, number> = {};
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const name = accMap.get(t.accountId) || 'Account';
        map[name] = (map[name] || 0) + t.amountPaise;
      });

    return Object.entries(map).map(([name, amountPaise]) => ({
      name,
      amountPaise,
      pct: totalExpensePaise > 0 ? Math.round((amountPaise / totalExpensePaise) * 100) : 0
    }));
  }, [periodTransactions, accounts, totalExpensePaise]);

  // Largest 5 expenses
  const largestExpenses = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amountPaise - a.amountPaise)
      .slice(0, 5);
  }, [periodTransactions]);

  // Daily Trend data points
  const dailyTrends = useMemo(() => {
    const dayMap: Record<string, { income: number; expense: number }> = {};
    periodTransactions.forEach((t) => {
      if (!dayMap[t.date]) dayMap[t.date] = { income: 0, expense: 0 };
      if (t.type === 'income') dayMap[t.date].income += t.amountPaise;
      if (t.type === 'expense') dayMap[t.date].expense += t.amountPaise;
    });

    const dates = Object.keys(dayMap).sort();
    return dates.map((d) => ({
      date: d,
      displayDate: d.slice(5), // MM-DD
      income: dayMap[d].income,
      expense: dayMap[d].expense
    }));
  }, [periodTransactions]);

  // Max value for daily trend chart scaling
  const maxDayAmount = useMemo(() => {
    let max = 1;
    dailyTrends.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [dailyTrends]);

  // Colors for donut chart
  const DONUT_COLORS = [
    '#f97316',
    '#3b82f6',
    '#10b981',
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
    '#eab308',
    '#64748b'
  ];

  // Donut SVG path calculation
  const donutSlices = useMemo(() => {
    let cumulativeAngle = 0;
    return categoryExpenses.map((cat, idx) => {
      const sliceAngle = (cat.amountPaise / (totalExpensePaise || 1)) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      // SVG arc math
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...cat,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        pathData,
        startAngle,
        endAngle
      };
    });
  }, [categoryExpenses, totalExpensePaise]);

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(periodTransactions, accounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `dlm_report_${period}_${dateRange.start}_to_${dateRange.end}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Daily Life Manager Financial Statement (${dateRange.label})\nTotal Income: ${formatPaise(
      totalIncomePaise,
      false,
      settings
    )}\nTotal Expense: ${formatPaise(
      totalExpensePaise,
      false,
      settings
    )}\nNet Savings: ${formatPaise(
      netCashFlowPaise,
      false,
      settings
    )} (${savingsRate}%)\nPeriod: ${dateRange.start} to ${dateRange.end}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Life Manager Statement - ${dateRange.label}`,
          text
        });
      } catch (e) {
        // user cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Reports
          </h1>
          <span className="text-[11px] text-slate-500">
            {dateRange.label} ({dateRange.start} to {dateRange.end})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs"
            title="Share Statement"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Selectable Periods Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-print">
        {[
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'current_week', label: 'This Week' },
          { id: 'previous_week', label: 'Last Week' },
          { id: 'current_month', label: 'This Month' },
          { id: 'previous_month', label: 'Last Month' },
          { id: 'current_year', label: 'This Year' },
          { id: 'previous_year', label: 'Last Year' },
          { id: 'custom', label: 'Custom' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as ReportPeriod)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              period === p.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Range Picker */}
      {period === 'custom' && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs no-print">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {/* High-Level Financial KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Total Income</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatPaise(totalIncomePaise, false, settings)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Total Expense</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatPaise(totalExpensePaise, false, settings)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net Cash Flow</span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold font-mono ${
              netCashFlowPaise >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatPaise(netCashFlowPaise, false, settings)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Savings Rate</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Daily Income & Expense Trend Chart */}
      {dailyTrends.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h2 className="font-bold text-slate-900 dark:text-white">Daily Cash Flow Trends</h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-4 px-1 pb-2 border-b border-slate-100 dark:border-slate-700">
            {dailyTrends.map((d, i) => {
              const incHeight = Math.max(4, Math.round((d.income / maxDayAmount) * 100));
              const expHeight = Math.max(4, Math.round((d.expense / maxDayAmount) * 100));

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap pointer-events-none z-20">
                    <div>{d.date}</div>
                    <div>+{formatPaise(d.income, false, settings)}</div>
                    <div>-{formatPaise(d.expense, false, settings)}</div>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 h-32">
                    {d.income > 0 && (
                      <div
                        className="w-1.5 sm:w-2.5 bg-emerald-500 rounded-t-xs transition-all hover:bg-emerald-400"
                        style={{ height: `${incHeight}%` }}
                      />
                    )}
                    {d.expense > 0 && (
                      <div
                        className="w-1.5 sm:w-2.5 bg-rose-500 rounded-t-xs transition-all hover:bg-rose-400"
                        style={{ height: `${expHeight}%` }}
                      />
                    )}
                  </div>

                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 font-mono">
                    {d.displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Expense Breakdown with Donut SVG */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white">
          Category-wise Expense Breakdown
        </h2>

        {categoryExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No expenses recorded in this period.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Donut Visualizer */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                {donutSlices.map((slice, idx) => (
                  <path
                    key={slice.name}
                    d={slice.pathData}
                    fill={slice.color}
                    className="hover:opacity-85 cursor-pointer transition-opacity"
                    onClick={() =>
                      setSelectedDonutIndex(selectedDonutIndex === idx ? null : idx)
                    }
                  />
                ))}
                {/* Donut hole cutout */}
                <circle cx="50" cy="50" r="24" className="fill-white dark:fill-slate-800" />
              </svg>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Spent</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {formatPaiseCompact(totalExpensePaise, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Ranked Category List */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {donutSlices.map((cat, idx) => (
                <div
                  key={cat.name}
                  onClick={() =>
                    setSelectedDonutIndex(selectedDonutIndex === idx ? null : idx)
                  }
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    selectedDonutIndex === idx
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPaise(cat.amountPaise, false, settings)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Method & Account Breakdown Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Payment Methods */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Payment Method Split
          </h3>
          <div className="space-y-2">
            {paymentMethodBreakdown.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {pm.method}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    {formatPaise(pm.amountPaise, false, settings)} ({pm.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${pm.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account-wise Spending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Account-wise Spending
          </h3>
          <div className="space-y-2">
            {accountBreakdown.map((acc) => (
              <div key={acc.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {acc.name}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold shrink-0">
                    {formatPaise(acc.amountPaise, false, settings)} ({acc.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${acc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Largest Expenses */}
      {largestExpenses.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Largest Expenses in Period
          </h3>
          <div className="space-y-2">
            {largestExpenses.map((tx, idx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {tx.note || tx.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {tx.date} · {tx.category} · {tx.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                  {formatPaise(tx.amountPaise, false, settings)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
