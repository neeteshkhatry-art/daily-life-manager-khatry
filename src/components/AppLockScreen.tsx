import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, KeyRound } from 'lucide-react';

interface AppLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  onDisableLock: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  correctPin,
  onUnlock,
  onDisableLock
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        onUnlock();
      } else {
        setErrorMsg('Incorrect PIN. Please try again.');
        setTimeout(() => setEnteredPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-900 text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            DL
          </div>
          <span className="font-semibold text-xs tracking-tight text-slate-300">Daily Life Manager</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured</span>
        </div>
      </div>

      {/* Center Lock Status */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold">Enter PIN to Unlock</h2>
          <p className="text-xs text-slate-400 mt-1">
            Default initial PIN is <code className="text-blue-400 font-mono">1234</code>
          </p>
        </div>

        {/* 4 PIN Dots */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < enteredPin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-blue-500 scale-110 shadow-sm shadow-blue-500/50'
                    : 'border-2 border-slate-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium animate-shake">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs space-y-3 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xl font-bold font-mono text-slate-100 flex items-center justify-center border border-slate-700/60"
            >
              {d}
            </button>
          ))}

          <button
            onClick={() => onUnlock()}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-xs text-slate-400 font-medium flex items-center justify-center"
            title="Bypass Lock for Development"
          >
            Bypass
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xl font-bold font-mono text-slate-100 flex items-center justify-center border border-slate-700/60"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Delete Digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onDisableLock}
          className="w-full py-2 text-center text-[11px] text-slate-500 hover:text-slate-300"
        >
          Disable App Lock in Settings
        </button>
      </div>
    </div>
  );
};
