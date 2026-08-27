# Roadmap

This document controls development order for Procedural Instrument Lab. Read it together with `docs/ARCHITECTURE.md`, `docs/MUSIC_BOX_V1.md`, `docs/PRESENTATION_CHECKLIST.md` and `AGENTS.md`.

## Current product decision

- Current committed product: one procedural mechanical cylinder music box.
- Default UI language: English; Japanese is the first additional locale.
- Current work is entirely focused on Music Box v1 and its direct follow-on customization foundation.
- Additional instruments are out of scope for this roadmap.

## Completed foundation

Phases 0-4 are complete: repository foundation, causal one-note mechanism, drive train, configurable comb/tune cylinder, direct crank manipulation and initial customization controls.

The first Phase 5 realism pass is also merged and published: geometry-derived pin/tine engagement and deflection, rooted tine loading, release-driven vibration/audio, connected mechanism geometry, readable material/lighting baseline, inspection camera, causality regression tests, desktop/mobile browser gates, EN/JA, discoverable Customize/How to use/About, inspiration credit and GitHub Pages publication.

## Current development order

The next priority is functional depth before a second photorealism pass. The existing simplified music box must evolve without locking future real-world music-box variation out of the model.

1. **ROADMAP/spec resynchronization** — record the new product order: tune features -> domain boundaries -> bounded mechanical customization -> real-device gates -> real music-box research -> advanced customization specification -> second realism pass. Completion means later work cannot mistake appearance polish for the next primary gate. **In progress in current change.**
2. **Music-box domain model cleanup** — separate tune, comb, cylinder, drive and material responsibilities only where current work needs the separation. Do not build an unused generic instrument framework. Completion means new music-box capabilities stop accumulating as hard-coded UI/render constants.
3. **TunePreset model** — replace the hard-coded scale demo with a music-box tune preset model carrying stable id, localized title, note events and attribution metadata. Completion means the runtime can support more than one tune without changing mechanism code. **Implemented in current change.**
4. **Public-domain demo tunes** — add 2-3 recognizable public-domain melodies as original NoteEvent data, with no copied modern MIDI/arrangement/audio asset. Completion means the instrument demonstrates recognizable music rather than only a scale. **Three presets implemented in current change.**
5. **Tune selector UI** — add localized tune selection near the primary playback controls. Completion means a first-time user can choose a melody directly.
6. **Tune -> pin geometry regeneration** — compile the selected tune into the visible cylinder pin pattern. Completion means changing the tune visibly changes the mechanical cylinder rather than swapping an independent audio sequence.
7. **Tune-switch runtime behavior** — define safe Stop/reset/recompile behavior while switching tunes. Completion means no stale engagement, vibration or audio state survives a tune change.
8. **Preset/mechanism validation** — validate note range, pin spacing and compilation for every shipped preset. Completion means every selectable tune is mechanically representable by the current comb/cylinder configuration.
9. **Browser gate update** — test all presets, selector behavior, pin regeneration, playback state, Customize, How to use/About and EN/JA. Completion means tune functionality is protected in production Chromium desktop/mobile.
10. **How to use / About / attribution update** — explain tune selection and the tune-to-pin relationship; publish preset attribution/public-domain notes. Completion means user guidance and rights provenance match the implementation.
11. **Pages publication** — merge and publish the tune-enabled build. Completion means real devices can exercise the new feature.
12. **Bounded mechanical customization expansion** — add relatively safe real parameters such as cylinder radius, pin dimensions and comb/note-count controls only after their geometry/validation behavior is defined. Completion means Customize moves beyond the initial four controls without becoming cosmetic-only.
13. **Comb / cylinder model expansion boundary** — allow generated per-tine/per-cylinder data needed for future note-count and geometry variation while keeping defaults automatic. Completion means future 18/30/72-note-style work or per-tine design does not require replacing the model.
14. **Drive model boundary** — keep hand crank as the implemented v1 drive but isolate the boundary required for future spring motor/governor work. Completion means hand-crank assumptions are not scattered through unrelated modules.
15. **Material / resonance boundary** — data-model visual materials separately from future acoustic resonance properties. Completion means later wood/metal changes can affect both rendering and sound without pretending current colors are physical simulation.
16. **Case / mechanism boundary** — separate enclosure/base concepts from the core mechanism where needed. Completion means later open mechanism, wooden case or other enclosure variants can reuse the same core.
17. **Real cylinder-music-box research pass** — document real note counts, comb/tine construction, dampers, cylinders, spring drives, governors, cases and materials using reliable sources. Completion means advanced customization is based on real design variation rather than invented sliders.
18. **Advanced Customize specification** — classify future controls into Music / Mechanism / Materials / Case and decide what belongs in v1 follow-on releases. Completion means advanced customization has explicit mechanical/audio consequences and bounded scope.
19. **Real-device display/interaction checks** — Android/mobile Tune, Customize, JA, orbit, zoom and pin/tine visibility. Completion means CI-only visual assumptions are eliminated.
20. **Play/audio/speed/crank checks** — Web Audio startup, tune-switch playback, perceptual synchronization, manual crank capture/release and practical performance. Completion means the instrument is genuinely playable.
21. **Second realism pass** — refine machining detail, wood/brass/steel response, fasteners, bearings, comb/tines and enclosure presentation after functional behavior is stable. Completion means the current generic-WebGL look moves materially closer to a real music box.
22. **Final bounded polish** — fix remaining UI, camera, mobile, copy and performance defects without unrelated scope growth.
23. **Music Box v1 completion decision** — require green main CI/browser gates plus passed manual/device gates and no unresolved v1-blocking defect. Completion means the browser experience can be presented as a finished procedural mechanical music box.

## Current position

The published main already contains the first realism/browser/Pages pass. The active branch starts the new schedule at steps 1-4 by formalizing TunePreset data and three public-domain demo melodies. Steps 5-11 are the immediate next product lane.

## Mechanical causality completion gate

At all stages the authoritative chain remains:

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Tune selection, customization, materials or presentation must not introduce an independent playback scheduler that bypasses this chain.

## Phase 6 — Localization

EN/JA implementation and automated runtime checks are complete. New tune/customization UI and documentation copy must be added to both locales together.

## Schedule discipline

The numbered schedule is dependency order, not a calendar promise. Work may overlap only where it does not bypass an earlier acceptance gate.

Any change to product order, completion criteria, mechanical causality, information architecture, language policy or customization scope must update this document and the relevant specification in the same branch/PR.
