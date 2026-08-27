# Presentation Quality Checklist

Use this checklist before declaring Roadmap Phase 5 complete. It combines automated real-browser checks with manual real-device verification.

## Automated browser gate

`tests/runtime.spec.ts` runs the production build in Chromium at desktop and mobile-emulated viewports. It must verify at minimum:

- WebGL canvas renders,
- concise product title/summary and primary controls are visible,
- `Customize`, `How to use` and `About` are discoverable,
- Play/Stop and speed controls work,
- all exposed customization controls accept representative valid changes,
- invalid customization preserves the last valid mechanism and exposes `role="alert"`,
- labels/focusability remain correct,
- desktop/mobile ordering and normal-flow mobile Customize remain correct,
- How to use/About and inspiration link remain reachable,
- EN/JA switching and document `lang` work with no horizontal overflow,
- browser console/page errors are absent.

CI retains `browser-runtime-evidence` screenshots for desktop/mobile and EN/JA.

## Mechanical motion quality

Before Phase 5 completion, confirm all of the following:

- a pin entering the contact zone produces a nonzero mechanically derived engagement/deflection state for the matching tine,
- the matching tine visibly deflects while engaged instead of remaining static while the pin passes it,
- the tine is rooted/pivoted at the comb side so the visible motion reads as bending rather than a floating bar rotating around its center,
- one release/pluck event occurs when the pin leaves engagement,
- that same release/pluck event starts free tine vibration and audible output,
- free vibration visibly decays after release,
- visual amplification, if used, changes only displayed amplitude and not contact/release timing,
- autoplay and manual crank use the same engagement/deflection/release path,
- reverse/manual motion does not create detached audio scheduling.

## Geometry / visual realism

- comb/tines read as a connected rooted assembly,
- cylinder end/shaft/support relationships read as connected parts,
- pins visibly belong to the cylinder and remain legible at useful inspection distances,
- gears, shafts, supports and crank connections are mechanically convincing,
- wood and metal-like materials are visually distinguishable,
- lighting/shadows add depth without obscuring pin/tine contact,
- default/reset view presents the whole mechanism clearly,
- orbit/zoom allows close inspection of pin/tine interaction.

## Primary-page / information-architecture manual checks

- a first-time user can see that customization exists,
- primary copy stays concise,
- detailed instructions live on How to use,
- background/inspiration live on About,
- Customize controls are reachable with normal page scrolling on mobile.

## Desktop browser manual checks

- Orbit/zoom and Reset view work as expected.
- Autoplay shows crank, gears, cylinder, tine loading/release/vibration and audio as one perceptually synchronized mechanism.
- Speed changes preserve that synchronization.
- Crank dragging disables camera orbit while captured and releases it immediately afterward.
- Manual crank uses the same pin/tine engagement and release/pluck behavior.
- Customization changes remain visually understandable.

## Mobile / touch manual checks

- verify on at least one real touch device,
- controls remain reachable/readable in portrait,
- full Customize section is reachable without a nested-scroll trap,
- primary controls have practical touch targets,
- pin/tine deflection and release vibration remain visible at mobile scale,
- crank touch capture is not stolen by page/camera gestures,
- orbit interaction resumes after crank release,
- Web Audio begins after a valid user gesture,
- no obvious frame-rate collapse occurs during playback/orbit/customization.

Current evidence confirms GitHub Pages renders on Android in portrait and accepts touch rotation. Audio/playback/crank-specific interaction remains unverified.

## Accessibility/readability

- visible keyboard focus is retained,
- text/control contrast is readable,
- invalid configuration feedback is readable,
- EN/JA copy remains readable across primary, How to use and About.

## Phase 5 gate

Phase 5 may be marked complete only when:

1. typecheck, unit tests, production build and automated browser gate are green on main,
2. engagement -> deflection -> release -> vibration/audio is visible and mechanically derived,
3. geometry/material presentation reads as a connected music-box mechanism,
4. information-architecture/mobile Customize checks pass,
5. desktop manual interaction checks pass,
6. touch/mobile checks pass on at least one real device,
7. material defects are fixed or explicitly deferred outside v1.
