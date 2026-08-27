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
- steps 1-4: explicit realism gates, mechanically derived pin/tine engagement and deflection, rooted tine loading, release-driven vibration/audio, and rendered/contact phase alignment,
- steps 5-7: state-derived motion visibility plus connected comb/cylinder/pin/gear/crank/support geometry.

Current implementation progress:

- steps 1-7 are merged on main; the step 5-7 PR browser gate and artifact inspection are green,
- step 8 now brightens and separates steel/brass/wood response so the comb/tines remain readable rather than visually black,
- step 9 now refines default/reset camera framing and bounded orbit/zoom for whole-mechanism and close contact inspection,
- step 10 now adds a crank -> gear -> cylinder phase -> engagement/deflection -> release regression test across different sampling rates,
- steps 8-10 are under browser/artifact verification in the current change.

### Current completion schedule — mechanical motion and realism

The functional baseline is not sufficient for v1 completion if a pin can audibly trigger a note while the contacted tine appears mechanically static. Phase 5 therefore includes the following ordered work:

1. **ROADMAP/spec synchronization** — make engagement, deflection, release, vibration and geometry realism explicit v1 gates. **Complete.**
2. **Pin -> tine engagement model** — derive engagement and normalized deflection from geometry. **Complete.**
3. **Tine deflection rendering** — visibly load the rooted tine while engaged. **Complete.**
4. **Release -> vibration -> audio** — use engagement exit as the shared free-vibration/audio event. **Complete.**
5. **Motion visibility tuning** — restrained state-derived visual amplification for desktop/mobile legibility. **Complete.**
6. **Comb/cylinder/pin geometry pass** — connected rooted comb, cylinder ends/shaft/supports and integrated pins. **Complete.**
7. **Gear/crank/support geometry pass** — mechanically convincing gear hubs/spokes/teeth, supports and crank connections. **Complete.**
8. **Material/lighting pass** — distinct readable metal/wood response without hiding contact. **Implemented; verification pending in current change.**
9. **Camera/inspection pass** — clear default/reset view with practical close inspection through orbit/zoom. **Implemented; verification pending in current change.**
10. **Mechanical-causality regression tests** — lock `crank -> gear -> cylinder -> engagement -> deflection -> release` and prevent detached presentation timing. **Implemented; verification pending in current change.**
11. **Desktop/mobile browser gate update** — verify revised mechanism plus Customize/How to use/About/EN/JA/layout. **Next after steps 8-10 artifact acceptance.**
12. **Pages publication** — merge and publish the revised main build.
13. **Real-device display/interaction checks** — verify Android/mobile orbit, zoom, Customize, JA and contact visibility.
14. **Play/audio/speed/crank device checks** — verify Web Audio startup, perceptual synchronization, manual crank capture/release and practical performance.
15. **Final bounded polish** — fix material defects found by the device gates without adding unrelated scope.
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
