/**
 * Currency and Number Precision Utilities
 * Storing money as integer paise guarantees zero decimal rounding bugs.
 */

import { AppSettings } from '../types';

/**
 * Format integer paise into localized currency string (default INR: ₹)
 * @param paise integer amount in paise (100 paise = 1 INR)
 * @param showDecimals whether to always show decimal paise or omit when zero
 * @param settings optional user settings
 */
export function formatPaise(
  paise: number,
  showDecimals: boolean = true,
  settings?: Partial<AppSettings>
): string {
  const symbol = settings?.currencySymbol ?? '₹';
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);

  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  // Format the rupees part using Indian or international numbering
  let formattedRupees: string;
  if (settings?.numberFormat === 'intl') {
    formattedRupees = rupees.toLocaleString('en-US');
  } else {
    // Indian numbering format (e.g., 1,50,000)
    formattedRupees = rupees.toLocaleString('en-IN');
  }

  let result = '';
  if (showDecimals && remainingPaise > 0) {
    const paiseStr = remainingPaise.toString().padStart(2, '0');
    result = `${symbol}${formattedRupees}.${paiseStr}`;
  } else if (showDecimals) {
    // If showDecimals is true and paise is 0, show .00
    result = `${symbol}${formattedRupees}.00`;
  } else {
    result = `${symbol}${formattedRupees}`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Compact format for big numbers (e.g. ₹1.4L or ₹2.5Cr or ₹15k)
 */
export function formatPaiseCompact(paise: number, symbol: string = '₹'): string {
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;
  const sign = paise < 0 ? '-' : '';

  if (rupees >= 10000000) {
    return `${sign}${symbol}${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    return `${sign}${symbol}${(rupees / 100000).toFixed(2)} L`;
  }
  if (rupees >= 1000) {
    return `${sign}${symbol}${(rupees / 1000).toFixed(1)} k`;
  }
  return `${sign}${symbol}${Math.round(rupees)}`;
}

/**
 * Safely parse a user input string (e.g. "150", "150.75", "1,200.50") into integer paise
 * Absolutely no floating point arithmetic issues.
 */
export function parseToPaise(input: string | number): number {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }

  const clean = input.replace(/[^0-9.-]/g, '').trim();
  if (!clean || isNaN(Number(clean))) {
    return 0;
  }

  const isNegative = clean.startsWith('-');
  const unsigned = isNegative ? clean.slice(1) : clean;

  const parts = unsigned.split('.');
  const wholePart = parts[0] || '0';
  const decimalPart = (parts[1] || '').padEnd(2, '0').slice(0, 2);

  const totalPaise = parseInt(wholePart, 10) * 100 + parseInt(decimalPart, 10);
  return isNegative ? -totalPaise : totalPaise;
}

/**
 * Convert paise to string suitable for HTML number inputs
 */
export function paiseToInputString(paise: number): string {
  if (paise === 0) return '';
  const abs = Math.abs(paise);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const sign = paise < 0 ? '-' : '';
  if (frac === 0) {
    return `${sign}${whole}`;
  }
  return `${sign}${whole}.${frac.toString().padStart(2, '0')}`;
}
