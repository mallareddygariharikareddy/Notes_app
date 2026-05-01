# Android Emulator Implementation Report

## Summary

The Notes app was successfully configured and run on an Android emulator using Expo Go. No React Native screen or storage code changes were required to make the app work on Android. The project was already Android-capable because it uses Expo and React Native, and it already had Android configuration in `app.json`.

The work mainly involved setting up the Android development environment on Windows, creating an Android Virtual Device, starting Metro on an available port, installing Expo Go into the emulator, and opening the project URL from the emulator.

## Final Result

- Android Studio was installed.
- Android SDK command-line tools were installed.
- Android SDK Platform Tools were installed, including `adb`.
- Android Emulator was installed.
- Android 36 platform and Google Play x86_64 system image were installed.
- A virtual device named `Notes_Android_36` was created.
- Expo Metro was started on port `8082`.
- Expo Go was installed on the emulator.
- The Notes app opened successfully in the emulator.

The emulator showed the Notes app list screen with:

- `Notes`
- `0 notes`
- Search input
- Sort controls
- Empty state: `No notes yet`
- Floating add button

## Environment Setup

### 1. Android Studio Installation

Android Studio was installed using Windows Package Manager:

```powershell
winget install --id Google.AndroidStudio --exact --accept-package-agreements --accept-source-agreements
```

This installed the Android Studio IDE, but the SDK command-line tools were still missing from the shell, so they were installed separately.

### 2. Android SDK Command-Line Tools

The Android command-line tools were downloaded from the official Android Developers source:

```text
https://developer.android.com/studio
```

They were installed into:

```text
C:\Users\rhari\AppData\Local\Android\Sdk\cmdline-tools\latest
```

The SDK manager was then verified:

```powershell
sdkmanager --version
```

### 3. Required SDK Packages

The following packages were installed with `sdkmanager`:

```powershell
sdkmanager --install "platform-tools" "emulator" "platforms;android-36" "system-images;android-36;google_apis_playstore;x86_64"
```

These packages provide:

| Package | Purpose |
|---|---|
| `platform-tools` | Provides `adb`, used to communicate with Android devices/emulators |
| `emulator` | Provides the Android Emulator runtime |
| `platforms;android-36` | Android API platform used by the emulator |
| `system-images;android-36;google_apis_playstore;x86_64` | Emulator operating system image with Google Play support |

### 4. Environment Variables

The following user-level environment variables were configured:

```text
ANDROID_HOME=C:\Users\rhari\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\rhari\AppData\Local\Android\Sdk
```

The following SDK folders were added to the user `PATH`:

```text
C:\Users\rhari\AppData\Local\Android\Sdk\platform-tools
C:\Users\rhari\AppData\Local\Android\Sdk\emulator
C:\Users\rhari\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
```

This allows future terminals to run:

```powershell
adb
emulator
sdkmanager
avdmanager
```

## Emulator Creation

The Android Virtual Device was created with `avdmanager`:

```powershell
avdmanager create avd --name Notes_Android_36 --package "system-images;android-36;google_apis_playstore;x86_64" --device "pixel_6" --force
```

Created emulator:

```text
Notes_Android_36
```

The emulator can be listed with:

```powershell
emulator -list-avds
```

It can be started manually with:

```powershell
emulator -avd Notes_Android_36 -netdelay none -netspeed full
```

## Running the App

The app was started using Expo:

```powershell
npx expo start --android --go --port 8082
```

Port `8081` was already being used by another Node process, so port `8082` was used instead.

Expo installed Expo Go on the emulator and bundled the app:

```text
Android Bundled node_modules\expo\AppEntry.js
```

Expo initially opened a LAN URL:

```text
exp://192.168.29.164:8082
```

To make the emulator connect reliably back to the host Metro server, the app was manually opened with the Android emulator host alias:

```powershell
adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8082"
```

`10.0.2.2` is the special Android emulator address that maps to the host machine's localhost.

## How Android Simulation Connects To The Code

The emulator does not require separate Android-specific app code in this project. The connection works like this:

```text
Android Emulator
      |
      v
Expo Go app
      |
      v
exp://10.0.2.2:8082
      |
      v
Metro Bundler
      |
      v
node_modules/expo/AppEntry.js
      |
      v
App.tsx
      |
      v
NotesListScreen / NoteEditorScreen
```

The emulator runs Expo Go. Expo Go connects to the Metro dev server. Metro serves the JavaScript bundle. The JavaScript bundle starts from Expo's entry file and loads this project's `App.tsx`.

## Existing Project Files That Enable Android

### `package.json`

The Android run script already exists:

```json
"android": "expo start --android --go"
```

Related scripts:

```json
"start": "expo start --go",
"android:expo": "expo start --android --go",
"android:cli": "expo run:android"
```

For this emulator session, the command was run with an explicit port:

```powershell
npx expo start --android --go --port 8082
```

### `app.json`

The project already contains Android configuration:

```json
"android": {
  "package": "com.example.notes",
  "adaptiveIcon": {
    "backgroundColor": "#F8F5EE"
  }
}
```

This tells Expo the Android application package name and adaptive icon background configuration.

### `App.tsx`

The app root is platform-safe and already supports Android through React Native and Expo:

```ts
import { StatusBar } from 'expo-status-bar';
import { Platform, UIManager } from 'react-native';
```

Android-specific layout animation support is enabled here:

```ts
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
```

This is not required for launching the emulator, but it improves Android UI behavior for layout animations.

## Code Changes Made For Android Simulation

No source code changes were needed in:

- `App.tsx`
- `src/screens/NoteEditorScreen.tsx`
- `src/screens/NotesListScreen.tsx`
- `src/storage/notesStorage.ts`
- Android native project files

The app runs in the emulator through Expo Go, so no native Android folder or Gradle project had to be generated.

The current worktree does show one dependency version change:

```diff
- "@types/react": "~19.1.10"
+ "@types/react": "~19.2.10"
```

Files affected:

- `package.json`
- `package-lock.json`

Expo displayed this warning:

```text
@types/react@19.2.14 - expected version: ~19.1.10
```

This warning is about TypeScript React type definitions. It did not block the Android emulator run. For maximum Expo SDK 54 compatibility, this can be changed back to:

```json
"@types/react": "~19.1.10"
```

## Verification

### TypeScript Check

The project was typechecked successfully:

```powershell
npm run typecheck
```

Result:

```text
tsc --noEmit
```

No TypeScript errors were reported.

### Emulator Device Check

The emulator was visible through `adb`:

```powershell
adb devices
```

Result:

```text
emulator-5554 device
```

### Android Boot Check

The emulator completed Android boot:

```powershell
adb shell getprop sys.boot_completed
```

Result:

```text
1
```

### App Screen Check

A screenshot was captured from the emulator and saved at:

```text
emulator-notes-screen.png
```

The screenshot confirmed that the Notes app was visible and running.

## Commands To Run Next Time

### Start The Emulator

```powershell
emulator -avd Notes_Android_36 -netdelay none -netspeed full
```

### Confirm Device Is Online

```powershell
adb devices
```

Expected:

```text
emulator-5554 device
```

### Start The App

```powershell
npx expo start --android --go --port 8082
```

### If Expo Go Opens But Does Not Load The App

Run:

```powershell
adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8082"
```

## Notes And Limitations

- This setup runs the app through Expo Go, not a custom Android development build.
- Because `expo-dev-client` is installed but no dev build is installed on the emulator, Expo correctly falls back to Expo Go.
- Local storage uses AsyncStorage and remains local to the emulator instance.
- If the emulator is wiped or deleted, locally saved notes in that emulator will be lost.
- If port `8081` is free later, the default `npm run android` script can be used without specifying `8082`.

