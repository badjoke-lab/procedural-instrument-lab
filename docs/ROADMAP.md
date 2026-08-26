# Roadmap

This document controls development order for Procedural Instrument Lab. It must be read together with `docs/ARCHITECTURE.md` and the active instrument specification.

## Current product decision

- Repository scope: instrument-neutral.
- Current committed product: one procedural mechanical cylinder music box.
- Additional instruments: optional future work, not a v1 requirement.
- Default UI language: English.
- Localization architecture: required from v1; Japanese is the first planned additional locale.

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
- pure mechanism tests sample a full revolution at multiple rates and verify one entry per pin,
- repository verification typechecks, runs mechanism tests and produces a production build in GitHub Actions.

## Phase 2 — Drive train

Status: complete

Completed behavior:

- crank angle is the single authoritative drive input,
- a visible 40-tooth driver gear drives a visible 20-tooth cylinder gear,
- the 2:1 ratio is derived from tooth counts rather than duplicated animation constants,
- crank, both gears and cylinder angles are returned by one deterministic kinematics function,
- contact timing uses the resulting cylinder phase,
- ratio/angle relationships are covered by mechanism tests,
- GitHub Actions verification is green with the drive train present.

## Phase 3 — Configurable comb and tune cylinder

Status: complete

Completed behavior:

- note set/tine count live in instrument configuration,
- tune events compile into axial pin lanes and cylinder angles,
- changing tine spacing changes generated pin mapping deterministically,
- configuration validation rejects note lanes that do not fit the cylinder and pin/tine spacing that would overlap,
- invalid configuration does not silently generate geometry,
- a short multi-note tune remains driven through one cylinder revolution,
- tests cover parameter-driven remapping and invalid configuration rejection,
- GitHub Actions verification is green.

## Phase 4 — Direct manipulation and builder controls

Status: complete

Completed behavior:

- the 3D crank handle accepts pointer/touch drag input,
- manual crank movement changes the same authoritative crank angle used by autoplay,
- manual interaction stops autoplay while dragging,
- orbit camera input is disabled during crank dragging to avoid gesture conflict,
- cylinder length, tine spacing, driver gear teeth and cylinder gear teeth are exposed as mechanical builder controls,
- builder changes flow through the existing `MusicBoxConfig` validation path,
- rejected configurations keep the last valid mechanism and display a localized UI error,
- changing gear tooth counts regenerates visible gear geometry and the mechanical ratio,
- changing cylinder length/tine spacing regenerates the relevant instrument geometry,
- a camera reset control restores the initial inspection view,
- new user-facing controls are routed through the English message catalog,
- mobile layout keeps the 3D scene primary and moves builder controls below it,
- repository typecheck, mechanism tests and production build are green.

Implementation note: automated verification confirms the code and mechanical path. Final pointer feel, gesture ergonomics and visual inspection on real browser/device remain presentation-quality checks in Phase 5 rather than a reason to block the verified implementation from main.

## Phase 5 — Instrument quality

Status: in progress

Completed audio-quality lane:

- music-box-specific Web Audio synthesis is isolated in `src/instruments/music-box/audio.ts`,
- each mechanical pluck event excites a fundamental plus restrained inharmonic upper partials with different decay times,
- the same pluck event emits a short filtered mechanical contact click,
- audio remains downstream of the mechanical contact event,
- pure audio-model tests verify tuning and partial/decay structure,
- repository typecheck, audio/mechanism tests and production build are green.

Implemented in the current presentation-quality branch:

- stronger scene depth through key/fill lighting and restrained contact shadows,
- materials are adjusted so wood, cylinder, pins, gears and tines remain visually distinct,
- contact markers remain visible without hiding the mechanism,
- DOM controls have visible keyboard focus states and explicit label/control relationships,
- Play exposes pressed state to assistive technology,
- primary touch controls use larger targets,
- builder layout collapses to one column at narrow mobile widths,
- rendering DPR is bounded to reduce unnecessary high-density mobile GPU load.

Remaining work:

- pass repository typecheck, all tests and production build for the presentation-quality branch; GitHub Actions must be green before merge,
- verify and tune crank/Orbit gesture ergonomics on real browser/device,
- perform final visual inspection at desktop and mobile widths,
- fix any device-specific interaction or readability defects found by that inspection.

Completion gate:

- the instrument is presentable as a standalone browser experience,
- mechanical causality remains inspectable rather than hidden behind visual polish.

## Phase 6 — Localization

English remains the default. Japanese is the first additional locale.

Work:

- stabilize message keys,
- add `ja` catalog,
- add compact `EN / JA` switch,
- verify layout at both desktop and mobile widths.

This phase may be pulled earlier for infrastructure work, but translation churn must not block the mechanical milestones.

## Phase 7 — Decide whether this remains music-box-only

This is a decision gate, not a promise to add another instrument.

Before starting a second instrument, evaluate:

- whether the music box is complete enough to stand alone,
- whether another instrument has a meaningful mechanical interaction not already demonstrated,
- which code was actually reused rather than hypothetically reusable,
- whether shared code should be promoted from instrument-local modules into `src/core/`.

Possible outcomes:

1. keep the repository focused on the music box indefinitely,
2. add one second instrument as a reuse test,
3. expand into a broader procedural-instrument collection.

Do not choose outcome 2 or 3 merely because the repository name permits it.

## Schedule discipline

The phases above are ordered by dependency, not calendar promises. Work may overlap only when it does not bypass an earlier completion gate.

Any change to phase order, completion criteria, language policy, or v1 scope must update this document and the relevant specification in the same branch/PR.
