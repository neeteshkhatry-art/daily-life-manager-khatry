import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Download, ShieldCheck, Wifi, Signal, Battery, FileCode } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode: 'phone' | 'responsive';
  onToggleViewMode: (mode: 'phone' | 'responsive') => void;
  onOpenApkModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  viewMode,
  onToggleViewMode,
  onOpenApkModal
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start pb-6">
      {/* Top Application Bar with Device Toggle & APK info */}
      <header className="w-full max-w-5xl px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs text-slate-400 no-print">
        <div className="flex items-center gap-2 font-medium text-slate-200">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
            DL
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Daily Life Manager</span>
          <span className="hidden sm:inline-block text-slate-500">·</span>
          <a
            href="https://github.com/neeteshkhatry-art/daily-life-manager-khatry"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
            title="Open GitHub Repository"
          >
            <span>neeteshkhatry-art/daily-life-manager-khatry</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => onToggleViewMode('phone')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'phone'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Phone Mockup View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pixel Frame</span>
            </button>
            <button
              onClick={() => onToggleViewMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'responsive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Responsive View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expanded</span>
            </button>
          </div>

          {/* APK Guide Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors text-xs font-medium"
            title="Download APK / Build Source"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>APK Package</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex justify-center items-start pt-2 sm:pt-4 px-2 sm:px-4">
        {viewMode === 'phone' ? (
          // Realistic Android Google Pixel 8 Chassis
          <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 relative flex flex-col overflow-hidden border-4 border-slate-800">
            {/* Phone Screen Outer */}
            <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[34px] overflow-hidden flex flex-col relative text-slate-900 dark:text-slate-100 shadow-inner">
              {/* Android Status Bar */}
              <div className="w-full h-8 bg-slate-900 text-slate-300 px-6 flex items-center justify-between text-xs font-medium shrink-0 select-none z-30">
                <span className="font-mono tracking-tight text-[11px] text-slate-200">{currentTime}</span>
                {/* Punch-hole camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800/80 mx-auto" />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Scrollable Android App Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative pb-6 bg-slate-50 dark:bg-slate-900">
                {children}
              </div>

              {/* Android Home Navigation Gesture Pill */}
              <div className="w-full h-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 z-30 pointer-events-none">
                <div className="w-28 h-1 bg-slate-400/50 dark:bg-slate-600/70 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          // Expanded Responsive Layout
          <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-800/40 overflow-hidden min-h-[820px] flex flex-col relative pb-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
