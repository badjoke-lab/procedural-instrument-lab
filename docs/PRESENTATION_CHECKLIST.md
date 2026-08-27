# Presentation Quality Checklist

Use this checklist before declaring Roadmap Phase 5 complete. It combines automated real-browser checks with a smaller manual real-device verification gate.

## Automated browser gate

`tests/runtime.spec.ts` runs in Chromium at both desktop and mobile-emulated viewports through Playwright.

It must verify at minimum:

- the WebGL canvas renders,
- primary controls and the builder are visible,
- Play/Stop state changes through the live application,
- representative builder changes do not produce a validation error or runtime exception,
- desktop layout keeps the builder beside the scene,
- mobile layout keeps the scene above the builder,
- neither English nor Japanese UI introduces horizontal page overflow,
- `EN / JA` switching changes the visible UI and document `lang`,
- browser console/page errors are absent during the covered flow.

Successful runs retain browser evidence through the CI artifact `browser-runtime-evidence`.

## Desktop browser manual checks

- Orbit and zoom around the mechanism and confirm the cylinder, pins, gears, comb and contact markers remain readable.
- Use Reset view and confirm the initial inspection angle is restored.
- Start automatic playback and confirm crank, gears, cylinder, tine motion and audio remain causally synchronized.
- Change speed during playback and confirm visual/mechanical/audio synchronization is preserved.
- Drag the 3D crank handle and confirm camera orbit does not move while the crank is captured.
- Release the crank and confirm orbit interaction resumes immediately.
- Confirm manual crank motion uses the same pin-contact/pluck path as automatic playback.
- Change each builder parameter and confirm the relevant geometry/ratio regenerates.
- Try a configuration that validation rejects and confirm the previous valid mechanism remains visible with an understandable error.

## Mobile / touch manual checks

- Verify on at least one real touch device.
- Confirm controls remain reachable and readable in portrait orientation.
- Confirm primary buttons/selects have practical touch targets.
- Drag the crank with touch and confirm the page/camera does not steal the gesture while dragging.
- Release the crank and confirm normal camera interaction resumes.
- Confirm audio begins correctly after a user gesture in browsers that suspend Web Audio initially.
- Confirm no obvious frame-rate collapse occurs during playback, orbiting or builder changes.

## Accessibility/readability

- Tab through DOM controls and confirm visible focus indication.
- Confirm every builder control has an associated label.
- Confirm Play/Stop exposes its pressed/running state.
- Confirm invalid configuration feedback is announced as an alert and remains visually readable.
- Confirm text and control contrast remains readable against the dark interface.

## Performance / visual quality

- Confirm shadows and lighting improve mechanical depth without obscuring contact geometry.
- Confirm wood, gears, cylinder, pins and tines are visually distinguishable.
- Confirm high-density screens do not trigger obviously excessive render cost; Canvas DPR is intentionally bounded.

## Phase 5 gate

Phase 5 may be marked complete only when:

1. repository typecheck, unit tests and production build are green on main,
2. the automated desktop/mobile Chromium runtime gate is green,
3. the remaining manual desktop interaction checks pass,
4. the mobile/touch checks pass on at least one real touch device,
5. any material defects found by those checks are fixed or explicitly documented as deferred outside v1,
6. mechanical causality remains visible and inspectable after presentation polish.
