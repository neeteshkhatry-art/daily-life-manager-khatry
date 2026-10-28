import React, { useState } from 'react';
import { X, Smartphone, Download, FileCode, CheckCircle2, Copy, Terminal, Shield, ExternalLink, Layers } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'gradle' | 'pwa'>('flutter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const flutterReleaseCmd = `cd flutter_app
flutter pub get
flutter build apk --release`;

  const flutterDebugCmd = `cd flutter_app
flutter pub get
flutter build apk --debug`;

  const gradleReleaseCmd = `keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dailylifemanager
./gradlew assembleRelease`;

  const gradleDebugCmd = `./gradlew assembleDebug`;

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
                Android APK & Source Packaging
              </h2>
              <span className="text-[11px] text-slate-500">
                Daily Life Manager · neeteshkhatry-art
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'flutter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Flutter & Dart APK
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'gradle'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Android Gradle / Capacitor
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pwa'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Instant PWA Install
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* TAB 1: FLUTTER APK BUILD */}
          {activeTab === 'flutter' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  Full Flutter & Dart Source Code Included
                </span>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-200/80">
                  The complete Flutter codebase is located in <code className="font-mono text-blue-700 dark:text-blue-300">/flutter_app/</code> with SQLite database, integer paise storage, and Material 3 interface.
                </p>
              </div>

              {/* Release APK */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    1. Flutter Signed Release APK
                  </span>
                  <button
                    onClick={() => copyToClipboard(flutterReleaseCmd, 'flutterRelease')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'flutterRelease' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {flutterReleaseCmd}
                </pre>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <strong>Exact Output Path:</strong>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-bold select-all mt-0.5">
                    build/app/outputs/flutter-apk/app-release.apk
                  </div>
                </div>
              </div>

              {/* Debug APK */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    2. Flutter Debug APK
                  </span>
                  <button
                    onClick={() => copyToClipboard(flutterDebugCmd, 'flutterDebug')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'flutterDebug' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {flutterDebugCmd}
                </pre>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <strong>Exact Output Path:</strong>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-bold select-all mt-0.5">
                    build/app/outputs/flutter-apk/app-debug.apk
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRADLE / CAPACITOR APK */}
          {activeTab === 'gradle' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  Gradle Configuration Available in /android-template/
                </span>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200/80">
                  Ready with namespace <code className="font-mono">com.neeteshkhatry.dailylifemanager</code> and Android SDK 34 compatibility.
                </p>
              </div>

              {/* Release APK */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Signed Release APK
                  </span>
                  <button
                    onClick={() => copyToClipboard(gradleReleaseCmd, 'gradleRelease')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'gradleRelease' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {gradleReleaseCmd}
                </pre>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <strong>Exact Output Path:</strong>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-bold select-all mt-0.5">
                    app/build/outputs/apk/release/app-release.apk
                  </div>
                </div>
              </div>

              {/* Debug APK */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Debug APK
                  </span>
                  <button
                    onClick={() => copyToClipboard(gradleDebugCmd, 'gradleDebug')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'gradleDebug' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {gradleDebugCmd}
                </pre>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <strong>Exact Output Path:</strong>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-bold select-all mt-0.5">
                    app/build/outputs/apk/debug/app-debug.apk
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PWA INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Instant Android Installation</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-medium">
                    No SDK Required
                  </span>
                </div>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-200/80">
                  Daily Life Manager has an Android-compliant Web App Manifest, adaptive high-res launcher icon, and offline local persistence.
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] space-y-1">
                  <strong>How to install on Android Chrome:</strong>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                    <li>Open this web app in Chrome on your phone</li>
                    <li>Tap the <strong>⋮</strong> (Menu) icon in the top right</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <a
            href="https://github.com/neeteshkhatry-art/daily-life-manager-khatry"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
