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

1. **ROADMAP/spec resynchronization** — record the product order: tune features -> domain boundaries -> bounded mechanical customization -> real-device gates -> real music-box research -> advanced customization specification -> second realism pass. Completion means later work cannot mistake appearance polish for the next primary gate. **In progress in current change.**
2. **Music-box domain model cleanup** — separate tune, comb, cylinder, drive and material responsibilities only where current work needs the separation. Do not build an unused generic instrument framework. Tune data must be shaped so a future editable composition/project document can feed the same compiler without replacing the mechanical pipeline. Completion means new music-box capabilities stop accumulating as hard-coded UI/render constants.
3. **TunePreset model** — replace the hard-coded scale demo with a music-box tune preset model carrying stable id, localized title, note events and attribution metadata. Completion means the runtime can support more than one tune without changing mechanism code and later composition inputs can target the same note-event representation. **Implemented in current change.**
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

## Scheduled post-v1 composition, export and sharing lane

These are intentional music-box follow-on capabilities, not reasons to delay the current v1 completion gate. The current tune/domain work must not make them impossible.

24. **Composition/project data specification** — define a versioned editable music-box composition document distinct from a shipped `TunePreset`. It must represent note/timing data, title/metadata and the minimum music-box arrangement information without storing rendered audio as the source of truth. Completion means every future composition input and every editable save file can converge on one stable representation.
25. **Piano-roll composer** — provide direct note/timing editing as the first general-purpose composition UI. Completion means users can create and correct melodies without audio analysis and the same editor can later repair imported/recognized notes.
26. **MIDI file import** — import supported `.mid` note/timing data into the editable composition representation, then validate/fit it to the current music-box mechanism. Completion means DAW or notation users have a precise non-audio import path.
27. **Keyboard performance input** — support an on-screen keyboard and practical computer-keyboard note entry/recording; add Web MIDI device input later where browser support and UX justify it. Completion means users can perform a melody directly into the composition editor.
28. **Microphone recording -> melody extraction** — record from the microphone with explicit user permission, initially targeting monophonic humming/singing/single-note instruments. Convert detected pitch/timing into editable notes before cylinder generation. Prefer local/browser processing where practical. Completion means a user can hum or play a melody and turn it into an editable music-box arrangement.
29. **Audio-file import -> melody extraction** — accept practical browser-decodable audio such as WAV/MP3/M4A where supported, extract a candidate melody, quantize/fit it and show the result in the editor for correction. Start with monophonic/clear-melody cases; do not pretend arbitrary full mixes can be transcribed perfectly. Completion means owned/existing audio can become an editable candidate tune rather than merely being replayed.
30. **Direct cylinder editor** — allow advanced users to inspect and edit the tune through the music-box-native representation of note lanes/pin positions while preserving a reversible mapping to editable tune data where possible. Completion means composition can be approached as actual cylinder design rather than only conventional music notation.
31. **Music-box fit / arrangement assistant** — validate note range, simultaneous notes, density, cylinder revolution limits and selected comb capabilities; offer explicit octave moves, nearest-note mapping or simplification instead of silently changing the tune. Completion means imported/composed music can be made mechanically playable with understandable compromises.
32. **Editable project export/import** — export and reopen the versioned composition plus relevant music-box configuration in a documented project-data format. Preserve forward migration/version metadata. Completion means a user's work is portable and does not depend on browser state or an account.
33. **Interchange export formats** — where meaningful, support MIDI export of the arranged note data in addition to the native project format. Completion means compositions can move back into other music software without treating rendered audio as the only output.
34. **Audio render/export** — render the mechanically driven result to an audio file. Prefer a lossless/browser-practical baseline such as WAV first; add compressed formats such as MP3 only when browser/runtime implementation is reliable. The exported sound must come from the same tune/mechanical-event model as playback. Completion means users can save the resulting music-box performance as audio.
35. **Video render/export** — export a video of the animated music box with synchronized mechanically driven audio. Start with browser-native recording/container support (for example WebM where practical); add MP4 only when implementation support is dependable. Completion means users can save/share the visual performance without screen-recording manually.
36. **Shareable composition links** — for compact safe project states, support URL-encoded/share-state links that reconstruct the tune/configuration without requiring a server. Completion means users can send a link that opens the same music box when payload size permits.
37. **File sharing / hosted sharing decision** — native project files remain the guaranteed portable sharing path. Only add hosted public/private project pages, uploads or accounts if there is a demonstrated need and an acceptable persistence/privacy/cost model. Completion means sharing can grow without making cloud storage a hidden prerequisite.
38. **Rights, privacy and safety boundaries for import/share** — microphone/file inputs require clear local permission handling; project files should not silently upload source media; public sharing must distinguish user-authored/authorized material from the app's public-domain presets and avoid bundling imported source audio unless explicitly designed and permitted. Completion means composition features do not accidentally turn into an opaque media-upload service.
39. **Composition/export browser and real-device gates** — automate editor/import/save/reopen/export invariants where feasible and manually verify microphone, file picker, download and share flows on real desktop/mobile browsers. Completion means the creation workflow is resilient outside development machines.
40. **Composition/export bounded polish** — address discoverability, editing mistakes, long-tune performance, file-size limits and mobile usability after real workflows are exercised. Completion means the extended music-box creator is usable rather than only technically possible.

## Current position

The published main already contains the first realism/browser/Pages pass. The active branch starts the current schedule at steps 1-4 by formalizing TunePreset data and three public-domain demo melodies. Steps 5-11 are the immediate next product lane. Steps 24-40 are explicitly scheduled follow-on work and must influence data boundaries now without expanding the current PR into a speculative composition suite.

## Mechanical causality completion gate

At all stages the authoritative chain remains:

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Tune selection, composition/import, customization, materials, exports or presentation must not introduce an independent playback scheduler that bypasses this chain. Audio/video export must record/render the result of this same state/event model rather than substitute an unrelated rendition.

## Phase 6 — Localization

EN/JA implementation and automated runtime checks are complete. New tune/customization/composition UI and documentation copy must be added to both locales together.

## Schedule discipline

The numbered schedule is dependency order, not a calendar promise. Work may overlap only where it does not bypass an earlier acceptance gate.

Any change to product order, completion criteria, mechanical causality, information architecture, language policy, customization scope, composition input, persistence/export or sharing boundaries must update this document and the relevant specification in the same branch/PR.
