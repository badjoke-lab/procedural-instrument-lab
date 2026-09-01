# Roadmap

This document controls development order for Procedural Instrument Lab. Read it together with `docs/ARCHITECTURE.md`, `docs/MUSIC_BOX_V1.md`, `docs/PRESENTATION_CHECKLIST.md`, `docs/TUNE_DOCUMENT.md`, `docs/PIANO_ROLL.md`, `docs/SCREEN_KEYBOARD.md`, `docs/COMPUTER_KEYBOARD.md`, `docs/MIDI_IMPORT.md`, `docs/MIDI_EXPORT.md`, `docs/MICROPHONE_RECORDING.md`, `docs/MIC_MELODY_EXTRACTION.md`, `docs/AUDIO_FILE_IMPORT.md`, `docs/AUDIO_MELODY_EXTRACTION.md`, `docs/RECOGNITION_CORRECTION.md`, `docs/COMPATIBILITY_ANALYZER.md`, `docs/AUTO_FIT.md` and `AGENTS.md`.

## Current product decision

- Current committed product: one procedural mechanical cylinder music box.
- Default UI language: English; Japanese is the first additional locale.
- Additional instruments are out of scope.
- Low traffic and limited manual testing are assumed. Completion must not depend on large numbers of user-submitted tunes or repeated human device tests.
- Automated browser checks, synthetic tune/audio fixtures and benchmark reports must carry most repeatable verification work.
- A user-visible mismatch between pin contact, tine loading/release/vibration and sound remains a mechanical-causality defect, but assistant-side visual/audio acceptance is not a feature-progression gate. Unrelated roadmap work may continue when it does not alter or conceal that mechanism defect.

## Completed foundation

Repository foundation, deterministic drive state, geometry-derived pin/tine engagement, tine deflection, release-driven vibration/audio, direct crank manipulation, initial Customize controls, EN/JA, responsive information architecture, the first geometry/material realism pass, browser gates and GitHub Pages publication are merged on main.

PR #34 (`c8e066dd36eba1d57d825d2519e00fe05adc5bf7`) is the current merged causality baseline: it aligned rendered pin/tine contact geometry with the solver, traversed coarse phase movement, carried release deflection into vibration and removed release-time Web Audio startup. PR #37 (`2412a3a9363748ba34167d9f5788e44b4495efb6`) then removed duplicated renderer-side pin placement math so rendered pin stem/tip positions and contact-side pin-tip positions share the mechanism geometry source. PR #38 (`cebfb5a0f944e877bb192af149f4945f9fa42a59`) requires Web Audio to reach `running` before autoplay or manual-crank motion begins. Issue #10 remains open for user-visible pin/tine/release synchronization, but it no longer blocks unrelated creator-feature progression solely because assistant-side acceptance is unavailable.

## Authoritative development order

### Preset foundation

1. **ROADMAP/spec synchronization** — keep repository documents aligned with this benchmark-first order. **Complete in PR #17.**
2. **Music-box domain cleanup** — separate tune/cylinder/comb/drive responsibilities only as current features require. **Complete for the current TunePreset boundary in PR #17.**
3. **TunePreset completion** — remove the hard-coded scale from runtime and use stable preset data. **Complete in PR #17.**
4. **Public-domain demo tunes** — ship 2-3 recognizable public-domain melodies using project-authored note data only. **Three presets complete in PR #17.**
5. **Tune selector** — localized Tune selection beside playback controls. **Complete in PR #17.**
6. **Tune -> pin geometry** — compile the selected tune into visible cylinder pins. **Complete in PR #17.**
7. **Tune-switch runtime** — stop/reset stale engagement and vibration state when tunes change. **Complete in PR #17.**
8. **Preset mechanical validation** — validate note range, normalized starts and compilation for every preset. **Complete in PR #17.**
9. **Preset browser gate** — protect selector, playback state, EN/JA, Customize and responsive behavior. **Complete in PR #17; final branch run #81 green.**
10. **How to use / About / attribution** — explain Tune -> pin behavior and demo-tune provenance. **Complete in PR #17.**
11. **Preset Pages publication** — merge and publish the tune-enabled build. **Complete: PR #17 merged as `4c0c05444b336f54f873fb757a4128442c8e5bd1`; Pages deployment succeeded.**

### Editable composition foundation

12. **TuneDocument specification** — define the versioned editable canonical tune representation shared by preset-derived, user-authored and imported material. **Complete in PR #18, merged as `d15ba27bf2e46c8e7ce428e23b5e4a37ef644334`; final branch run #84 green.**
13. **Piano-roll editor** — add/remove/move notes and edit pitch/timing/duration. **Complete in PR #20, merged as `c3bf6dcbc9519bea5050535f8e1ea1d735b9d776`; final branch run #98 green with desktop/mobile evidence reviewed.**
14. **On-screen keyboard input** — record performed pointer/touch notes into TuneDocument through the existing mechanical compiler path. **Complete in PR #21, merged as `2fde71128a20a3bef126606a2f4d05f4ca1dfcfe`; final branch run #108 green and Pages deploy #10 succeeded.**
15. **Computer-keyboard input** — provide practical A/S/D/F/G/H/J/K note preview and recording into the same TuneDocument path while preserving normal form typing. **Complete in PR #22, merged as `9dd7f4a34f13cb6ceda8d473be8bbb13f38c3196`; final branch run #115 green with desktop/mobile evidence reviewed.**
16. **MIDI import** — parse supported `.mid` note/timing data into TuneDocument. Completion means DAW/notation users have a precise local-file import path without creating a second playback scheduler. **Complete in PR #23, merged as `421c0e502c9555abd0cdf63b98ae6988f0449cbf`; final branch run #125 green with desktop/mobile evidence reviewed.**
17. **MIDI export** — export arranged TuneDocument note data to MIDI where meaningful. Completion means created arrangements can return to other music tools. **Complete in PR #24, merged as `b9f93119a92c341b17cd2a3d0f446e7a23849f55`; final branch run #131 green with desktop/mobile evidence reviewed.**

### Microphone and owned audio input

18. **Microphone recording** — explicit-permission, local/browser recording. Completion means humming/singing/single-note instruments can be captured, locally previewed and discarded without upload or premature note inference. **Complete in PR #25, merged as `33314c00a498e97cd50bc2a291a1373af232fb7c`; final PR run #140 green, main verify #141 and Pages deploy #14 succeeded.**
19. **Mic -> melody extraction** — detect pitch/timing into editable TuneDocument notes, initially optimized for monophonic material. **Complete in PR #26, merged as `8f2251cb7ea9c7dcbcd60cfecd2609d56a0847ac`; final branch run #145 green with desktop/mobile evidence reviewed.**
20. **Audio-file import** — accept practical browser-decodable formats such as WAV/MP3/M4A where supported, without silently uploading source media. **Complete in PR #27, merged as `4b60f7dba885e175196b4c9eca0454b6b086384b`; final branch run #147 green with desktop/mobile evidence reviewed.**
21. **Audio -> melody extraction** — derive candidate note data rather than replaying the source file as the music box. **Complete in PR #28, merged as `7abfd82ca8421c9fbb396d5942689226587de5b1`; final branch run #150 green with desktop/mobile evidence reviewed.**
22. **Recognition correction UI** — show recognized notes in the piano roll and allow correction before mechanical compilation. **Complete in PR #29, merged as `350fea30bdabd8cfa8e8aa5ce2b1bd7af28650ca`; final branch run #155 green with desktop/mobile recognition-review evidence reviewed. Recognition results remain staged until explicit acceptance.**

### Make ordinary music mechanically playable

23. **Compatibility analyzer** — report note-range, simultaneous-note, density, pin-spacing and current-mechanism conflicts. **Complete in PR #31, merged as `7fbaa15573ae82a2797a9fb93741f8cdc6a83361`; final verify/browser run #173 was green.**
24. **Auto Fit to Music Box** — offer explicit octave moves, nearest-note mapping, quantization or simplification. **Active on `feat/music-box-auto-fit-main` / PR #39, reapplied from the current main after PRs #37/#38. Every transform is opt-in and produces a derived proposal without mutating the editable source or regenerating cylinder pins.**
25. **Fit preview / manual correction** — compare the candidate and fitted result before acceptance.
26. **TuneDocument -> cylinder** — generate the final visible pin pattern from the accepted editable arrangement.

### Mechanical-causality repair lane

Issue #10 remains a separate quality defect rather than an assistant-validation gate for unrelated feature work. The active repair rules are:

- PR #34 is the merged baseline for exact pin-sphere / rotated-tine-box contact, coarse phase traversal, release-continuous vibration and synchronous release-driven pluck,
- PR #37 is merged and makes renderer pin stem/tip placement consume the same mechanism geometry source as contact-side pin-tip placement,
- PR #38 requires `audio.unlock()` to confirm `AudioContext.state === 'running'` before autoplay/manual-crank motion begins,
- contact resolver and renderer must continue sharing the same resting tine geometry; no hidden y/position offset may define contact,
- tine loading angle remains derived from contact geometry rather than an unrelated visual amplitude,
- configuration changes must clear stale engagement/vibration state,
- the user-visible pin/tine/release synchronization problem remains open until product behavior is actually corrected,
- automated tests remain regression gates; assistant-side screenshot/artifact interpretation is not acceptance evidence and must not be used to block unrelated roadmap implementation.

This repair lane is not a new roadmap feature. Changes that touch the mechanism must preserve these rules; feature work upstream of mechanical compilation may proceed independently.

### User-volume-independent benchmark lane

27. **Benchmark Tune Set** — create roughly 20-50 synthetic tune fixtures covering range, timing, density, simultaneous notes, short/long tunes and known-invalid cases.
28. **Synthetic audio fixtures** — generate controlled audio with known pitch/timing, noise levels and tempo variants.
29. **End-to-end conversion benchmark** — automatically exercise Tune/Audio -> editable data -> Auto Fit -> pin geometry -> contact/release invariants.
30. **Mechanism requirement report** — summarize which benchmark cases fail because of note range, comb size, cylinder limits, pin density or other constraints.
31. **Benchmark regression gate** — lock key metrics/invariants in CI.

### Save and reopen editable work

32. **Music Box Project format** — define a versioned native format carrying TuneDocument plus relevant music-box configuration and metadata.
33. **Project export** — download the native project locally.
34. **Project import** — safely reopen a native project and restore edit/mechanism state.
35. **Project version compatibility** — validate and migrate supported older schema versions.

### Audio and video output

36. **Offline audio rendering** — derive export audio from the same mechanical event model used by live playback.
37. **Audio export** — start with WAV; add compressed formats only when dependable.
38. **Video rendering** — capture the animated mechanism with synchronized mechanically driven audio.
39. **Video export** — start with browser-practical WebM and add MP4 only when dependable.

### Sharing

40. **Project-file sharing** — treat native project files as the guaranteed server-free sharing path.
41. **Share URL** — encode compact safe tune/config states into reconstructable URLs when size permits.
42. **Share metadata / preview** — include the minimum safe title/description state needed to understand a shared project.
43. **Hosted-sharing decision** — evaluate hosted pages only if need, privacy/moderation/copyright, storage and operating cost justify them.

### Evidence-based advanced music-box customization

44. **Real cylinder-music-box research** — document real note counts, comb/tine construction, weights, dampers, cylinders, spring drives, governors, bedplates, cases and materials using reliable sources.
45. **Benchmark x real-mechanism analysis** — compare benchmark requirement reports with real mechanism options.
46. **Customize taxonomy** — organize future controls into Music / Mechanism / Materials / Case.
47. **Comb / note-count Customize** — implement selected real note-count/comb variants.
48. **Tine Customize** — model selected length/thickness/mass/weight/tuning variation.
49. **Cylinder / pin Customize** — expand cylinder size and pin geometry/density constraints.
50. **Damper / articulation mechanism** — add dampers or related mechanisms where evidence justifies them.
51. **Drive Customize** — add spring motor/governor variants only after the hand-crank boundary is stable.
52. **Material Customize** — add real-use steel/brass/wood/etc. choices with visual-only vs acoustically modeled effects distinguished.
53. **Resonance model** — model selected comb/bedplate/case vibration transfer.
54. **Case Customize** — add open mechanism, wooden enclosure or other researched case variants.

### Music-box-native advanced editing

55. **3D cylinder editor** — directly add/move/remove pins while preserving editable tune mapping where possible.
56. **Live mechanism-constraint feedback** — report pin collisions, range and density constraints during direct editing.

### Final realism pass

57. **Geometry realism** — refine comb/tines, pins, gears, shafts, bearings, fasteners and case construction.
58. **Material realism** — improve wood grain, steel/brass response, machining surfaces, roughness and restrained wear detail.
59. **Lighting / camera realism** — improve reflections, shadows and inspection framing without hiding mechanical causality.
60. **Motion realism final pass** — re-check pin loading, release, tine vibration, gears and crank after later customization.

### Final verification

61. **Desktop automated end-to-end QA** — cover composition/import/fit/save/export/share/customization invariants that can be automated.
62. **Mobile automated end-to-end QA** — cover responsive/touch-oriented layout and practical runtime behavior in browser automation.
63. **Minimal real-device QA** — manually verify only capabilities automation cannot adequately prove: real audio startup, microphone/file-picker/download behavior, touch/gesture conflicts and practical performance.
64. **Accessibility / performance / documentation sync** — keyboard/focus/contrast, lower-performance behavior, How to use, About, rights/privacy and import/export guidance.
65. **Completion decision** — require green CI/benchmark gates, passed minimal real-device gates and no unresolved blocking mechanical/data/export defect. Completion means the Music Box can be presented as a finished creator: select or create a melody, import audio/MIDI, fit it to the mechanism, generate the cylinder, play/customize it, save/reopen it, export audio/video and share it.

## Current position

Steps 1-23 are complete on main. PR #34 is the merged causality baseline, PR #37 shares pin render/contact geometry and PR #38 gates motion on running Web Audio. Issue #10 remains open as a separate user-visible synchronization defect; it is not being closed through assistant-side artifact judgement and does not block unrelated upstream creator work. Step 24 Auto Fit has resumed on PR #39 from the current main.

## Mechanical causality gate

At every stage the authoritative chain remains:

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Composition/import, Auto Fit, customization, rendering and exports must feed or consume this chain. They must not introduce an independent scheduler that decides note timing separately.

Passing abstract event-count tests is insufficient to close a perceptible mechanical synchronization defect. The visible contact geometry and event geometry must remain the same model, and mechanism motion must not start until the audio context is actually ready. This requirement remains binding for mechanism changes and final completion, but assistant-side perceptual validation is not an intermediate merge gate for unrelated feature work.

## Privacy / rights boundary

- Prefer local/in-browser microphone and audio-file processing where practical.
- Never silently upload or embed source microphone/audio media into native projects or share URLs.
- App-supplied demo tunes must remain clearly distinguished from user-provided material.
- Hosted sharing is optional and requires an explicit later decision covering persistence, privacy, copyright/moderation and cost.

## Localization

EN/JA runtime support is implemented. New user-facing tune/composition/import/export/share/customization copy must be added to both locales together.

## Schedule discipline

The numbered schedule is dependency order. Work may proceed past an unresolved quality issue when that issue is explicitly tracked and the new work does not depend on, alter or conceal the affected behavior. Any change to product order, mechanical causality, data formats, privacy, import/export/sharing boundaries or completion criteria must update this document and the relevant specification in the same PR.
