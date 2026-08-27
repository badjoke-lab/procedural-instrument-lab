# Roadmap

This document controls development order for Procedural Instrument Lab. It must be read together with `docs/ARCHITECTURE.md` and the active instrument specification.

## Current product decision

- Repository scope: instrument-neutral.
- Current committed product: one procedural mechanical cylinder music box.
- Additional instruments: optional future work, not a v1 requirement.
- Default UI language: English.
- Japanese is the first additional locale and is implemented in the current main UI.

## Phase 0 — Repository foundation

Status: complete

## Phase 1 — Causal one-note mechanism

Status: complete

Completed behavior:

- cylinder axis and pin geometry use one explicit instrument coordinate system,
- pin tip world position is derived from pin geometry and cylinder phase,
- each tine has a contact point derived from the same instrument configuration,
- contact is resolved by 3D distance between the moving pin tip and corresponding tine contact point,
- a contact-entry event drives both tine vibration and Web Audio output,
- mechanism tests verify one contact entry per pin across materially different sampling rates,
- repository verification typechecks, runs mechanism tests and produces a production build.

## Phase 2 — Drive train

Status: complete

Completed behavior:

- crank angle is the single authoritative drive input,
- visible driver and cylinder gears derive their ratio from tooth counts,
- crank, both gears and cylinder angles come from one deterministic kinematics function,
- contact timing uses the resulting cylinder phase,
- ratio/angle relationships are covered by mechanism tests.

## Phase 3 — Configurable comb and tune cylinder

Status: complete

Completed behavior:

- note set/tine count live in instrument configuration,
- tune events compile into axial pin lanes and cylinder angles,
- changing tine spacing changes generated pin mapping deterministically,
- configuration validation rejects note lanes that do not fit the cylinder and pin/tine spacing that would overlap,
- invalid configuration does not silently generate geometry,
- tests cover parameter-driven remapping and invalid configuration rejection.

## Phase 4 — Direct manipulation and builder controls

Status: complete

Completed behavior:

- the 3D crank handle accepts pointer/touch drag input,
- manual crank movement changes the same authoritative crank angle used by autoplay,
- manual interaction stops autoplay while dragging,
- orbit camera input is disabled during crank dragging,
- cylinder length, tine spacing, driver gear teeth and cylinder gear teeth are exposed as mechanical builder controls,
- builder changes flow through `MusicBoxConfig` validation,
- rejected configurations keep the last valid mechanism and display a localized error,
- gear/cylinder parameter changes regenerate the relevant geometry/ratio,
- a camera reset control restores the initial inspection view,
- mobile layout keeps the 3D scene primary and moves builder controls below it.

## Phase 5 — Instrument quality

Status: in progress

Completed and merged:

- music-box-specific Web Audio synthesis uses a fundamental plus restrained inharmonic upper partials with different decay times,
- the same mechanical pluck event emits a short filtered contact click,
- audio remains downstream of mechanical contact,
- audio-model tests verify tuning and partial/decay structure,
- stronger scene depth through key/fill lighting and restrained contact shadows,
- wood, cylinder, pins, gears and tines remain visually distinct,
- DOM controls have visible focus states and explicit label/control relationships,
- Play exposes pressed state to assistive technology,
- primary touch controls use larger targets,
- builder layout collapses to one column at narrow widths,
- rendering DPR is bounded for mobile GPU cost,
- integrated typecheck, unit tests and production build are green on main.

Current browser-runtime lane:

- Playwright runs the production build in Chromium at desktop and mobile-emulated viewports,
- runtime checks cover visible WebGL/UI surface, Play/Stop state, representative builder changes, responsive ordering, English/Japanese switching, horizontal overflow and browser errors,
- the automated browser runtime gate is green on the current Phase 5/6 verification PR,
- successful browser runs retain desktop/mobile runtime screenshots plus explicit English and Japanese localization screenshots/report evidence in CI artifacts.

Remaining work:

- merge the green automated browser runtime gate after final evidence review,
- manually verify crank-handle capture versus OrbitControls in a desktop browser,
- verify crank touch capture, Web Audio startup and practical performance on at least one real touch device,
- fix any material interaction/readability defect found by those checks.

Completion gate:

- the instrument is presentable as a standalone browser experience,
- mechanical causality remains inspectable rather than hidden behind polish,
- automated runtime checks are green on main,
- the remaining real-device interaction checks pass.

## Phase 6 — Localization

Status: implemented; automated runtime verification pass pending merge to main

Completed and merged:

- English is the default locale,
- Japanese is implemented as the first additional locale,
- `EN / JA` provides compact language switching,
- document `lang` follows the active locale,
- mechanism/configuration identifiers remain locale-independent,
- English and Japanese catalog parity is covered by unit tests,
- integrated typecheck/tests/build are green on main.

Current verification state:

- automated desktop/mobile Chromium checks pass for locale switching, document `lang`, visible Japanese UI and horizontal-overflow protection on the current verification PR,
- CI evidence retains explicit English and Japanese screenshots for both desktop and mobile runs.

Remaining work:

- merge the automated locale runtime gate to main,
- confirm readability and interaction on the remaining real-device/manual Phase 5 checks,
- fix any runtime text overflow or layout defect found by device inspection.

## Phase 7 — Decide whether this remains music-box-only

This is a decision gate, not a promise to add another instrument.

Do not start a second instrument until Phase 5/6 completion. Then evaluate:

- whether the music box is complete enough to stand alone,
- whether another instrument has a meaningful mechanical interaction not already demonstrated,
- which code was actually reused rather than hypothetically reusable,
- whether any shared code should be promoted from instrument-local modules into `src/core/`.

Possible outcomes:

1. keep the repository focused on the music box indefinitely,
2. add one second instrument as a reuse test,
3. expand into a broader procedural-instrument collection.

Do not choose outcome 2 or 3 merely because the repository name permits it.

## Schedule discipline

The phases above are ordered by dependency, not calendar promises. Work may overlap only when it does not bypass an earlier completion gate.

Any change to phase order, completion criteria, language policy, or v1 scope must update this document and the relevant specification in the same branch/PR.
