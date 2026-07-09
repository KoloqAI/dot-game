# App Store packaging & submission

> ⚠️ Apple changes required screenshot sizes, privacy questions, and review rules frequently. **Treat this as a guide and verify current requirements in App Store Connect at submission time.**

## Assets
- **Icon:** one 1024×1024 master (no transparency, no rounded corners — Apple rounds it). Concept: the glowing dot on the dark-grey vignette. Generate the full set in Xcode's asset catalog.
- **Launch screen:** solid `#1c1c1c` + small centered dot; match the first game frame (no flash).
- **Screenshots:** capture the current required device sizes (e.g., 6.7" and 6.5" classes); 3–5 showing start, gaps, a zone transition, and staggered/moving gates.

## Xcode
Set Team (your Apple Developer account), a unique Bundle ID (`com.YOURNAME.dotwisp`), Display Name **Dotwisp**, Version `1.0.0` / Build `1`, deployment target iOS 16.0, orientation Portrait only.

## App Store Connect
- **Name:** `Dotwisp` — the finalized brand name (distinctive/coined, so it ranks #1 for its own term). This is a first-pass availability check, not legal clearance: run a formal trademark search and secure `dotwisp.com` + social handles before launch.
- **Subtitle:** carry the descriptive/searchable keyword the coined name lacks, e.g. `One-tap dot dodger` or `Dodge, weave, survive`.
- Name, subtitle, description, keywords, support URL; category **Games › Arcade**.
- **Age rating:** 4+ (no objectionable content).
- **App Privacy:** with no ads/analytics/accounts, declare **Data Not Collected**. Update this if that ever changes.
- **Export compliance:** standard OS encryption is exempt — answer accordingly.

## Review-readiness
Runs fully offline; no login walls, placeholder content, or broken links; provide a simple hosted privacy/support page.

## Workflow
```bash
npm run build
npx cap sync ios
npx cap open ios   # sign, run on device, archive, and upload from Xcode
```
