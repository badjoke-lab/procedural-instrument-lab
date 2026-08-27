# Presentation Quality Checklist

Use this checklist before declaring Roadmap Phase 5 complete. It combines automated real-browser checks with a smaller manual real-device verification gate.

## Automated browser gate

`tests/runtime.spec.ts` runs in Chromium at both desktop and mobile-emulated viewports through Playwright.

It must verify at minimum:

- the WebGL canvas renders,
- the concise product title/summary and primary controls are visible,
- `Customize`, `How to use` and `About` are directly discoverable from the primary page,
- Play/Stop state changes through the live application,
- speed can change while playback remains running,
- all exposed customization controls accept representative valid changes without runtime exceptions,
- an invalid customization combination is rejected while the last valid configuration remains active,
- invalid configuration feedback is exposed with `role="alert"`,
- customization controls retain explicit label/control associations,
- DOM controls and navigation links remain keyboard-focusable,
- desktop layout keeps customization beside the scene,
- mobile layout keeps the scene above customization,
- mobile customization is in normal document flow and is not a fixed-height nested scrolling region,
- `How to use` and `About` are reachable under the GitHub Pages-compatible route scheme,
- the About page contains the verified inspiration link,
- neither English nor Japanese UI introduces horizontal page overflow,
- `EN / JA` switching changes the visible UI and document `lang`,
- browser console/page errors are absent during the covered flow.

Successful runs retain browser evidence through the CI artifact `browser-runtime-evidence`, including desktop/mobile runtime screenshots and explicit English/Japanese localization screenshots.

## Primary-page / information-architecture manual checks

- Confirm a first-time user can see that customization exists without discovering a nested scroll area by accident.
- Confirm the primary page stays concise and does not require knowledge of music-box mechanical terminology.
- Confirm detailed instructions live on `How to use`, not in long primary-page copy.
- Confirm project background and inspiration/credits live on `About`.
- Confirm the Customize link lands on the customization controls and the controls can be reached with normal page scrolling on mobile.

## Desktop browser manual checks

These remain manual because they require perceptual or direct 3D interaction evidence that headless browser assertions do not prove.

- Orbit and zoom around the mechanism and confirm the cylinder, pins, gears, comb and contact markers remain readable.
- Use Reset view and confirm the initial inspection angle is restored.
- Start automatic playback and confirm crank, gears, cylinder, tine motion and audio remain causally synchronized.
- Change speed during playback and confirm visual/mechanical/audio synchronization is preserved perceptually.
- Drag the 3D crank handle and confirm camera orbit does not move while the crank is captured.
- Release the crank and confirm orbit interaction resumes immediately.
- Confirm manual crank motion uses the same pin-contact/pluck path as automatic playback in practical interaction.
- Confirm geometry/ratio changes from customization controls remain visually understandable.

## Mobile / touch manual checks

- Verify on at least one real touch device.
- Confirm controls remain reachable and readable in portrait orientation.
- Confirm the full customization section is reachable through normal page scroll with no nested-scroll trap.
- Confirm primary buttons/selects have practical touch targets.
- Drag the crank with touch and confirm the page/camera does not steal the gesture while dragging.
- Release the crank and confirm normal camera interaction resumes.
- Confirm audio begins correctly after a user gesture in browsers that suspend Web Audio initially.
- Confirm no obvious frame-rate collapse occurs during playback, orbiting or customization changes.

Current real-device evidence already confirms the GitHub Pages build renders on Android in portrait and the 3D scene accepts touch rotation. Audio/playback/crank-specific interaction remains unverified.

## Accessibility/readability

Automated coverage verifies label association, pressed state, alert semantics and basic keyboard focusability. Manual confirmation still covers visible quality:

- Tab through DOM controls and links and confirm visible focus indication.
- Confirm text and control contrast remains readable against the dark interface.
- Confirm invalid configuration feedback remains visually readable.
- Confirm EN/JA copy remains readable on the primary, How to use and About surfaces.

## Performance / visual quality

- Confirm shadows and lighting improve mechanical depth without obscuring contact geometry.
- Confirm wood, gears, cylinder, pins and tines are visually distinguishable.
- Confirm high-density screens do not trigger obviously excessive render cost; Canvas DPR is intentionally bounded.

## Phase 5 gate

Phase 5 may be marked complete only when:

1. repository typecheck, unit tests and production build are green on main,
2. the automated desktop/mobile Chromium runtime gate is green,
3. the information-architecture/mobile customization checks pass,
4. the remaining manual desktop interaction checks pass,
5. the mobile/touch checks pass on at least one real touch device,
6. any material defects found by those checks are fixed or explicitly documented as deferred outside v1,
7. mechanical causality remains visible and inspectable after presentation polish.
