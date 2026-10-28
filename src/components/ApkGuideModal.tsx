import React, { useState } from 'react';
import { X, Smartphone, Download, FileCode, CheckCircle2, Copy, Terminal, Shield, ExternalLink } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const debugCmd = `./gradlew assembleDebug`;
  const releaseCmd = `keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dailylife
./gradlew assembleRelease`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Android APK & Source Code Packaging
              </h2>
              <span className="text-[11px] text-slate-500">
                Daily Life Manager for Android 8.0+ (API 26+)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* Method 1: Instant PWA Install on Android */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Instant Android Installation (Home Screen PWA)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-medium">
                No Gradle Required
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-200/80">
              Daily Life Manager contains a complete Web App Manifest, offline service worker, and high-res adaptive icon. You can install it immediately onto any Android device by tapping the browser menu (⋮) &gt; <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </p>
          </div>

          {/* Method 2: Native Android APK Compilation Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Native APK Build Instructions & Output Paths</span>
            </h3>

            {/* Debug APK */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  1. Debug APK (For Testing & Sideloading)
                </span>
                <button
                  onClick={() => copyToClipboard(debugCmd, 'debug')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'debug' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                {debugCmd}
              </pre>
              <div className="text-[11px] text-slate-500">
                <strong>Exact Output Path:</strong>{' '}
                <code className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                  app/build/outputs/apk/debug/app-debug.apk
                </code>
              </div>
            </div>

            {/* Signed Release APK */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  2. Signed Release APK (For Play Store & Production)
                </span>
                <button
                  onClick={() => copyToClipboard(releaseCmd, 'release')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'release' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                {releaseCmd}
              </pre>
              <div className="text-[11px] text-slate-500">
                <strong>Exact Output Path:</strong>{' '}
                <code className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                  app/build/outputs/apk/release/app-release.apk
                </code>
              </div>
            </div>

            {/* Capacitor / Flutter bridge steps */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Quick 1-Minute Wrapper Setup (Capacitor)
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>Run <code className="font-mono text-blue-600">npm run build</code> to produce production assets</li>
                <li>Run <code className="font-mono text-blue-600">npx cap add android</code> to generate the native Android Studio project</li>
                <li>Run <code className="font-mono text-blue-600">npx cap sync</code> to copy the web app into the native WebView</li>
                <li>Run <code className="font-mono text-blue-600">./gradlew assembleRelease</code> inside <code className="font-mono">android/</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
