# Presentation Quality Checklist

Use this checklist before declaring Roadmap Phase 5 complete. It is a manual/runtime verification companion to automated typecheck, tests and production build.

## Desktop browser

- Load the current production build at a desktop viewport around 1280x800 or larger.
- Confirm the full instrument, builder panel and primary controls are visible without overlap.
- Orbit and zoom around the mechanism and confirm the cylinder, pins, gears, comb and contact markers remain readable.
- Use Reset view and confirm the initial inspection angle is restored.
- Start automatic playback and confirm crank, gears, cylinder, tine motion and audio remain causally synchronized.
- Change speed during playback and confirm visual/mechanical/audio synchronization is preserved.
- Drag the 3D crank handle and confirm camera orbit does not move while the crank is captured.
- Release the crank and confirm orbit interaction resumes immediately.
- Confirm manual crank motion uses the same pin-contact/pluck path as automatic playback.
- Change each builder parameter and confirm the relevant geometry/ratio regenerates.
- Try a configuration that validation rejects and confirm the previous valid mechanism remains visible with an understandable error.

## Mobile / touch

- Verify at approximately 390x844 and at one narrower viewport.
- Confirm the 3D scene remains the primary viewport and the builder does not cover the mechanism.
- Confirm controls remain reachable without horizontal scrolling.
- Confirm primary buttons/selects have practical touch targets.
- Drag the crank with touch and confirm the page/camera does not steal the gesture while dragging.
- Release the crank and confirm normal camera interaction resumes.
- Confirm the builder falls to one column at narrow width without clipped labels or values.
- Confirm audio begins correctly after a user gesture in browsers that suspend Web Audio initially.

## Accessibility/readability

- Tab through DOM controls and confirm visible focus indication.
- Confirm every builder control has an associated label.
- Confirm Play/Stop exposes its pressed/running state.
- Confirm invalid configuration feedback is announced as an alert and remains visually readable.
- Confirm text and control contrast remains readable against the dark interface.

## Performance / visual quality

- Confirm shadows and lighting improve mechanical depth without obscuring contact geometry.
- Confirm wood, gears, cylinder, pins and tines are visually distinguishable.
- Confirm no obvious frame-rate collapse occurs during playback, orbiting or builder changes on a typical mobile device.
- Confirm high-density screens do not trigger obviously excessive render cost; Canvas DPR is intentionally bounded.

## Phase 5 gate

Phase 5 may be marked complete only when:

1. repository verification is green for the presentation branch,
2. the desktop checks above pass,
3. the mobile/touch checks above pass on at least one real touch device,
4. any material defects found by those checks are fixed or explicitly documented as deferred outside v1,
5. mechanical causality remains visible and inspectable after presentation polish.
