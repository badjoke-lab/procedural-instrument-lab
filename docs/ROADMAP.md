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
- scene lighting/material baseline,
- responsive UI, accessibility basics and bounded DPR,
- Playwright desktop/mobile production-browser gate,
- GitHub Pages verification build,
- EN/JA runtime checks,
- concise primary page with discoverable `Customize`, `How to use` and `About`,
- mobile Customize controls in normal page flow with no nested-scroll trap,
- verified inspiration credit on About,
- Android portrait render and touch-orbit verification,
- Phase 5 steps 1-4: explicit realism gates, mechanically derived pin/tine engagement and deflection, rooted tine loading, release-driven vibration/audio, and rendered/contact phase alignment.

Current implementation progress:

- steps 1-4 are merged on main and published through GitHub Pages,
- steps 5-7 implement stronger but state-derived motion visibility plus connected comb/cylinder/pin/gear/crank/support geometry,
- the step 5-7 browser gate is green and desktop/mobile artifact inspection confirms the added supports do not hide the contact area,
- the next pass is step 8 material/lighting, with particular attention to keeping steel tines/comb readable rather than visually black.

### Current completion schedule — mechanical motion and realism

The functional baseline is not sufficient for v1 completion if a pin can audibly trigger a note while the contacted tine appears mechanically static. Phase 5 therefore includes the following ordered work:

1. **ROADMAP/spec synchronization** — make engagement, deflection, release, vibration and geometry realism explicit v1 gates. Completion means the project cannot be closed with static-looking pin/tine contact. **Complete.**
2. **Pin -> tine engagement model** — replace boolean-only contact with a mechanically derived state containing engagement and normalized deflection. Completion means the runtime knows not only whether a pin is near a tine, but how strongly it is engaging it. **Complete.**
3. **Tine deflection rendering** — pivot/root each tine at the comb and visibly bend it while engaged. Completion means users can see the pin physically load the tine before the note. **Complete.**
4. **Release -> vibration -> audio** — emit one release/pluck event when the pin exits engagement and use that same event for free tine vibration and sound. Completion means `push -> release -> vibrate -> sound` is one visible causal path. **Complete.**
5. **Motion visibility tuning** — apply restrained visual amplification if needed for browser/mobile legibility. Completion means the active tine can be identified without changing event timing. **Implemented; merge pending in current change.**
6. **Comb/cylinder/pin geometry pass** — improve rooted comb form, cylinder ends/shaft/supports and pin integration. Completion means the mechanism no longer reads primarily as disconnected primitive shapes. **Implemented; merge pending in current change.**
7. **Gear/crank/support geometry pass** — improve tooth proportions, shafts, bearings/supports and crank connections. Completion means the drive train reads as a mechanically convincing assembly. **Implemented; merge pending in current change.**
8. **Material/lighting pass** — refine metal/wood response, roughness, highlights and shadows. Completion means materials look distinct and more realistic without hiding the contact area. **Next.**
9. **Camera/inspection pass** — refine default/reset view and close inspection readability. Completion means the whole mechanism is legible by default and pin/tine contact can be examined with orbit/zoom.
10. **Mechanical-causality regression tests** — lock `crank -> gear -> cylinder -> engagement -> deflection -> release -> vibration/audio`. Completion means presentation changes cannot silently reintroduce detached timing.
11. **Desktop/mobile browser gate update** — verify revised mechanism plus Customize/How to use/About/EN/JA/layout. Completion means the realism work remains production-browser safe.
12. **Pages publication** — merge and publish the revised main build. Completion means the latest mechanism is available for real-device inspection.
13. **Real-device display/interaction checks** — verify Android/mobile orbit, zoom, Customize, JA and contact visibility. Completion means CI-only visual assumptions are eliminated.
14. **Play/audio/speed/crank device checks** — verify Web Audio startup, perceptual synchronization, manual crank capture/release and practical performance. Completion means the instrument is genuinely usable, not just renderable.
15. **Final bounded polish** — fix material defects found by the device gates without adding unrelated scope. Completion means no known v1-blocking presentation/interaction defect remains.
16. **Music Box v1 completion decision** — require green main CI/browser gates and passed manual/device gates. Completion means the browser experience can be presented as a finished procedural mechanical music box.

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
