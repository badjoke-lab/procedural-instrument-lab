# Roadmap

This document controls development order for Procedural Instrument Lab. Read it together with `docs/ARCHITECTURE.md`, `docs/MUSIC_BOX_V1.md`, `docs/PRESENTATION_CHECKLIST.md` and `AGENTS.md`.

## Current product decision

- Current committed product: one procedural mechanical cylinder music box.
- Default UI language: English; Japanese is implemented as the first additional locale.
- Current work is entirely focused on finishing Music Box v1.

## Phase 0 — Repository foundation

Status: complete

## Phase 1 — Causal one-note mechanism

Status: complete as the baseline contact implementation; Phase 5 now deepens the visible contact response.

## Phase 2 — Drive train

Status: complete

## Phase 3 — Configurable comb and tune cylinder

Status: complete

## Phase 4 — Direct manipulation and customization controls

Status: complete

Completed behavior includes pointer/touch crank input, deterministic crank/gear/cylinder kinematics, validated mechanical customization, camera reset and responsive scene/customization ordering.

## Phase 5 — Instrument quality

Status: in progress

Already completed and merged:

- procedural Web Audio synthesis downstream of mechanical events,
- responsive UI, accessibility basics and bounded DPR,
- Playwright desktop/mobile production-browser gate,
- GitHub Pages verification build,
- EN/JA runtime checks,
- concise primary page with discoverable `Customize`, `How to use` and `About`,
- mobile Customize controls in normal page flow with no nested-scroll trap,
- verified inspiration credit on About,
- Android portrait render and touch-orbit verification,
- steps 1-4: mechanically derived pin/tine engagement and deflection, rooted tine loading, release-driven vibration/audio, and rendered/contact phase alignment,
- steps 5-7: state-derived motion visibility plus connected comb/cylinder/pin/gear/crank/support geometry,
- steps 8-10: readable metal/wood material-lighting pass, refined default/inspection camera, and crank-to-release causality regression coverage.

Current implementation progress:

- steps 1-10 are merged on main,
- step 8/9 desktop/mobile artifacts were inspected and accepted: tines remain readable, supports do not hide contact, and the artificial contact marker is removed,
- the step 8-10 Pages deployment is green and the updated mechanism is publicly available,
- step 11 now retains an additional `runtime-playing.png` evidence image while the mechanism is running and verifies Reset view keeps the WebGL scene alive,
- after the step 11 gate is green on main, the remaining work is real-device verification and bounded defect polish.

### Current completion schedule — mechanical motion and realism

1. **ROADMAP/spec synchronization** — explicit engagement/deflection/release/vibration/realism gates. **Complete.**
2. **Pin -> tine engagement model** — geometry-derived engagement and normalized deflection. **Complete.**
3. **Tine deflection rendering** — visibly load the rooted tine while engaged. **Complete.**
4. **Release -> vibration -> audio** — shared release event for free vibration and sound. **Complete.**
5. **Motion visibility tuning** — restrained state-derived amplification for desktop/mobile legibility. **Complete.**
6. **Comb/cylinder/pin geometry pass** — connected rooted comb, cylinder ends/shaft/supports and integrated pins. **Complete.**
7. **Gear/crank/support geometry pass** — convincing gear/support/crank connections. **Complete.**
8. **Material/lighting pass** — distinct readable metal/wood response without hiding contact. **Complete.**
9. **Camera/inspection pass** — clear default/reset view plus practical close inspection. **Complete.**
10. **Mechanical-causality regression tests** — lock `crank -> gear -> cylinder -> engagement -> deflection -> release`. **Complete.**
11. **Desktop/mobile browser gate update** — revised mechanism plus playing-state evidence, Reset view, Customize/How to use/About/EN/JA/layout. **In progress in current change.**
12. **Pages publication** — publish the revised main build. **Material/camera build published; step 11-only test update does not change the user-facing build.**
13. **Real-device display/interaction checks** — verify Android/mobile orbit, zoom, Customize, JA and contact visibility. **Next.**
14. **Play/audio/speed/crank device checks** — verify Web Audio startup, perceptual synchronization, manual crank capture/release and practical performance.
15. **Final bounded polish** — fix defects found by device gates without unrelated scope.
16. **Music Box v1 completion decision** — require green main CI/browser gates and passed manual/device gates.

### Phase 5 completion gate

Phase 5 may be complete only when:

- the engaged tine visibly responds to its pin,
- release/pluck drives both free vibration and audio,
- the mechanism is visually convincing enough to read as a connected music-box assembly,
- mechanical causality remains inspectable after visual polish,
- automated runtime checks are green on main,
- desktop/mobile manual interaction gates pass,
- material defects are fixed or explicitly deferred outside v1.

## Phase 6 — Localization

Status: implemented; automated runtime verification complete

English and Japanese catalogs, switching, document `lang`, parity tests and browser checks are merged. Remaining locale work is only readability/interaction verification during Phase 5 device checks and copy synchronization when mechanism explanations change.

## Phase 7 — Post-v1 product decision

Do not enter until Music Box v1 Phase 5/6 gates are complete.

## Schedule discipline

The phases and numbered Phase 5 finishing schedule above are ordered by dependency, not calendar promises. Work may overlap only when it does not bypass an earlier completion gate.

Any change to phase order, completion criteria, mechanical causality, information architecture, language policy or v1 scope must update this document and the relevant specification in the same branch/PR.
