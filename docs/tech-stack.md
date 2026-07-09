# Tech stack

## Choice
**Phaser 3 + TypeScript + Vite**, wrapped for the App Store with **Capacitor (iOS)**.

**Why:** the whole game is authored in TypeScript (easy for AI/IDE assistance), and the reference prototype is already HTML5 canvas, so the model carries over directly. Capacitor compiles the web build into a genuine native iOS binary. (Native SwiftUI/SpriteKit is a valid alternative but means writing Swift throughout — not worth it for a game this size.)

## The one hard constraint
Building, signing, and submitting *any* iOS app requires **Xcode on macOS** plus a paid **Apple Developer Program** membership (~$99/yr). Xcode is only needed at the packaging/submission step, not during day-to-day development.

## Prerequisites (install once)
- macOS with Xcode + Command Line Tools
- Node.js LTS (v20+) and npm
- CocoaPods (`sudo gem install cocoapods`) — used by Capacitor iOS
- Apple Developer Program membership

## Dependencies
- Runtime: `phaser`, `@capacitor/core`, `@capacitor/haptics`, `@capacitor/preferences`, `@capacitor/status-bar`, `@capacitor/splash-screen`
- Dev: `typescript`, `vite`, `@capacitor/cli`, (optional) `eslint`, `prettier`

## Setup (reference commands)
```bash
npm create vite@latest dotwisp -- --template vanilla-ts
cd dotwisp && npm install
npm install phaser @capacitor/core @capacitor/haptics @capacitor/preferences @capacitor/status-bar @capacitor/splash-screen
npm install -D @capacitor/cli
npx cap init "Dotwisp" "com.YOURNAME.dotwisp" --web-dir=dist
npm run build && npx cap add ios && npx cap sync ios && npx cap open ios
```

## Capacitor config notes
Portrait lock; background `#1c1c1c`; immersive status bar during play; splash screen matching the first frame (solid `#1c1c1c` + small dot) to avoid a flash. Vite `base` must be `"./"` so assets resolve inside the iOS shell.

## Version caveat
Pin nothing blindly. **Verify current Phaser and Capacitor versions before a serious build** (`npm outdated`) — major Capacitor versions occasionally require config/Xcode changes.
