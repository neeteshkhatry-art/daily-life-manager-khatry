# Daily Life Manager - Android APK Compilation Guide

This folder contains the complete native Android project configuration files to build both a **Signed Release APK** and a **Debug APK** for **Daily Life Manager**.

---

## Output Paths

| Build Type | Exact Output Path | Purpose |
| :--- | :--- | :--- |
| **Debug APK** | `app/build/outputs/apk/debug/app-debug.apk` | Quick sideloading, USB testing, emulator verification |
| **Signed Release APK** | `app/build/outputs/apk/release/app-release.apk` | Production deployment, Google Play Store, distribution |

---

## Prerequisites
- Android Studio Hedgehog or newer
- JDK 17
- Android SDK Platform 34 (API 34)

---

## 1. Quick Build with Capacitor

From the project root:
```bash
# 1. Build web application assets
npm run build

# 2. Add Capacitor Android platform (if not already initialized)
npx cap add android

# 3. Synchronize web assets to native Android project
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

---

## 2. Generating the Debug APK
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Generating the Signed Release APK

### Step 3.1: Generate Release Keystore
```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dailylife
```

### Step 3.2: Compile Signed Release APK
```bash
cd android
./gradlew assembleRelease
```
The signed APK will be generated at:
`app/build/outputs/apk/release/app-release.apk`

---

## 4. Instant Home Screen Installation (Progressive Web App)
You can also install Daily Life Manager directly on any Android smartphone without Gradle:
1. Open the application in Google Chrome on your Android device.
2. Tap the browser menu `⋮` (three dots) in the top-right corner.
3. Select **"Install app"** or **"Add to Home screen"**.
4. The app launches full-screen with offline data storage, biometric PIN lock, and native appearance.
