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

Completion gate:

- architecture document exists,
- music-box v1 specification exists,
- this roadmap exists,
- `AGENTS.md` establishes source-of-truth and update rules,
- UI language policy is documented,
- initial app skeleton is present.

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

Completion gate:

- changing gear ratio visibly changes the mechanical relationship,
- crank, gear and cylinder cannot drift apart,
- contact timing continues to derive from the resulting cylinder phase.

## Phase 3 — Configurable comb and tune cylinder

Status: in progress

Goal: make the current music box a parameterized instrument rather than one hard-coded geometry snapshot.

Work:

- keep note set/tine count in instrument configuration,
- map pitch index to tine geometry,
- compile tune events into pins,
- regenerate pins when tune or cylinder dimensions change,
- validate unsupported cylinder/tine/pin spacing configurations,
- keep configuration changes deterministic and testable without requiring UI controls yet.

Completion gate:

- a short multi-note tune plays through one cylinder revolution,
- changing a mechanically meaningful parameter rebuilds the relevant geometry and mapping,
- invalid spacing/range configurations are rejected or reported rather than silently overlapping geometry.

## Phase 4 — Direct manipulation and builder controls

Work:

- allow direct crank manipulation with pointer/touch where practical,
- expose selected mechanical parameters,
- separate mechanical parameters from cosmetic parameters,
- provide camera reset and useful inspection views.

Completion gate:

- the instrument can be understood and operated from the 3D scene without behaving like a conventional step sequencer with a decorative model.

## Phase 5 — Instrument quality

Work:

- improve tine synthesis,
- add restrained mechanical noises,
- improve materials, lighting and enclosure detail,
- improve performance and accessibility,
- stabilize mobile interaction.

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

This phase may be pulled earlier for infrastructure work, but translation churn must not block Phase 1–3 mechanical milestones.

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
