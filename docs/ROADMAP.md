# Roadmap

This document controls development order for Procedural Instrument Lab. Read it together with `docs/ARCHITECTURE.md`, `docs/MUSIC_BOX_V1.md`, `docs/PRESENTATION_CHECKLIST.md`, `docs/TUNE_DOCUMENT.md`, `docs/PIANO_ROLL.md`, `docs/SCREEN_KEYBOARD.md` and `AGENTS.md`.

## Current product decision

- Current committed product: one procedural mechanical cylinder music box.
- Default UI language: English; Japanese is the first additional locale.
- Additional instruments are out of scope.
- Low traffic and limited manual testing are assumed. Completion must not depend on large numbers of user-submitted tunes or repeated human device tests.
- Automated browser checks, synthetic tune/audio fixtures and benchmark reports must carry most repeatable verification work.

## Completed foundation

Repository foundation, deterministic drive state, geometry-derived pin/tine engagement, tine deflection, release-driven vibration/audio, direct crank manipulation, initial Customize controls, EN/JA, responsive information architecture, the first geometry/material realism pass, browser gates and GitHub Pages publication are already merged on main.

## Authoritative development order

### Preset foundation

1. **ROADMAP/spec synchronization** — keep repository documents aligned with this benchmark-first order. Completion means development no longer assumes that advanced customization or real-user volume must precede composition/import work. **Complete in PR #17.**
2. **Music-box domain cleanup** — separate tune/cylinder/comb/drive responsibilities only as current features require. Completion means later composition/import can feed the existing mechanical compiler without replacing it. **Complete for the current TunePreset boundary in PR #17.**
3. **TunePreset completion** — remove the hard-coded scale from the runtime and use stable preset data. Completion means multiple tunes use the same mechanism code. **Complete in PR #17.**
4. **Public-domain demo tunes** — ship 2-3 recognizable public-domain melodies using project-authored NoteEvent data only. Completion means the demo plays recognizable music without copied modern MIDI/audio. **Three presets complete in PR #17.**
5. **Tune selector** — localized Tune selection beside playback controls. Completion means users can select the melody directly. **Complete in PR #17.**
6. **Tune -> pin geometry** — compile the selected tune into visible cylinder pins. Completion means changing tunes changes the physical cylinder rather than an independent audio track. **Complete in PR #17.**
7. **Tune-switch runtime** — stop/reset stale engagement and vibration state when tunes change. Completion means switching tunes cannot leave detached mechanical/audio state. **Complete in PR #17.**
8. **Preset mechanical validation** — validate note range, normalized starts and compilation for every shipped preset. Completion means every selectable tune fits the current mechanism. **Complete in PR #17.**
9. **Preset browser gate** — protect selector, playback state, EN/JA, Customize and responsive behavior in desktop/mobile Chromium. Completion means tune functionality has automated runtime coverage. **Complete in PR #17; final branch run #81 green.**
10. **How to use / About / attribution** — explain Tune -> pin behavior and disclose demo-tune provenance/public-domain status. Completion means user guidance and rights provenance match the shipped presets. **Complete in PR #17.**
11. **Preset Pages publication** — merge and publish the tune-enabled build, then perform only the minimum real-device checks that automation cannot replace. **Complete: PR #17 merged as `4c0c05444b336f54f873fb757a4128442c8e5bd1` and Pages deployment succeeded.**

### Editable composition foundation

12. **TuneDocument specification** — define the versioned editable canonical tune representation shared by preset-derived, user-authored and imported material. Completion means every input path can converge before mechanical compilation. **Complete in PR #18, merged as `d15ba27bf2e46c8e7ce428e23b5e4a37ef644334`; final branch run #84 green.**
13. **Piano-roll editor** — add/remove/move notes and edit pitch/timing/duration. Completion means users can compose from scratch and later correct recognition/import results. **Complete in PR #20, merged as `c3bf6dcbc9519bea5050535f8e1ea1d735b9d776`; final branch run #98 green with desktop/mobile evidence reviewed.**
14. **On-screen keyboard input** — record notes from an on-screen keyboard into TuneDocument. Completion means users can perform rather than place every note manually. **In progress in PR #21: touch/pointer C4-C5 keyboard, preview sound, quantized recording into TuneDocument, responsive layout, EN/JA and dedicated browser coverage are implemented; final CI/evidence review remains before merge.**
15. **Computer-keyboard input** — provide practical keyboard-key note entry/recording. Completion means composition does not require external MIDI hardware.
16. **MIDI import** — parse supported `.mid` note/timing data into TuneDocument. Completion means DAW/notation users have a precise import path.
17. **MIDI export** — export arranged TuneDocument note data to MIDI where meaningful. Completion means created arrangements can return to other music tools.

### Microphone and owned audio input

18. **Microphone recording** — explicit-permission, preferably local/browser recording. Completion means humming/singing/single-note instruments can be captured in the app.
19. **Mic -> melody extraction** — detect pitch/timing into editable TuneDocument notes, initially optimized for monophonic material. Completion means a user can hum a melody into an editable music-box arrangement.
20. **Audio-file import** — accept practical browser-decodable formats such as WAV/MP3/M4A where supported, without silently uploading source media. Completion means users can choose owned/existing audio as input.
21. **Audio -> melody extraction** — derive a candidate melody rather than replaying the source file as the music box. Completion means audio becomes editable note data.
22. **Recognition correction UI** — show recognized notes in the piano roll and allow correction before mechanical compilation. Completion means imperfect recognition is recoverable by the user.

### Make ordinary music mechanically playable

23. **Compatibility analyzer** — report note-range, simultaneous-note, density, pin-spacing and current-mechanism conflicts. Completion means users can see why a tune cannot be represented directly.
24. **Auto Fit to Music Box** — offer explicit octave moves, nearest-note mapping, quantization or simplification. Completion means ordinary melodies can be transformed into mechanically playable arrangements with visible compromises.
25. **Fit preview / manual correction** — compare the candidate and fitted result before acceptance. Completion means musically significant substitutions are never silently imposed.
26. **TuneDocument -> cylinder** — generate the final visible pin pattern from the accepted editable arrangement. Completion means piano-roll/MIDI/mic/audio inputs all enter the same mechanical runtime.

### User-volume-independent benchmark lane

27. **Benchmark Tune Set** — create roughly 20-50 synthetic tune fixtures covering low/high register, wide range, repeated notes, dense timing, simultaneous notes, short/long tunes and known invalid cases. Completion means broad tune coverage does not depend on real-user submissions.
28. **Synthetic audio fixtures** — generate controlled audio with known pitch/timing, noise levels and tempo variants. Completion means mic/audio-recognition regression can be measured without repeated manual recording.
29. **End-to-end conversion benchmark** — automatically exercise Tune/Audio -> editable data -> Auto Fit -> pin geometry -> contact/release invariants. Completion means the full conversion pipeline is continuously measurable.
30. **Mechanism requirement report** — summarize which benchmark cases fail because of note range, comb size, cylinder limits, pin density or other constraints. Completion means later advanced Customize work is driven by evidence rather than guessed sliders.
31. **Benchmark regression gate** — lock key metrics/invariants in CI. Completion means low traffic cannot hide regressions.

### Save and reopen editable work

32. **Music Box Project format** — define a versioned native format carrying TuneDocument plus the relevant music-box configuration and metadata. Completion means a whole editable music-box project has a stable portable representation.
33. **Project export** — download the native project locally. Completion means work does not depend on browser state or an account.
34. **Project import** — safely reopen a native project and restore edit/mechanism state. Completion means users can continue work or exchange projects.
35. **Project version compatibility** — validate and migrate supported older schema versions. Completion means updates do not immediately strand saved work.

### Audio and video output

36. **Offline audio rendering** — derive export audio from the same mechanical event model used by live playback. Completion means export is not an unrelated rendition.
37. **Audio export** — start with WAV; add compressed formats only when dependable. Completion means a completed music-box performance can be saved as audio.
38. **Video rendering** — capture the animated mechanism with synchronized mechanically driven audio. Completion means the visual performance can be rendered reliably.
39. **Video export** — start with browser-practical WebM and add MP4 only when runtime support is dependable. Completion means users can save a shareable performance video without manual screen recording.

### Sharing

40. **Project-file sharing** — treat native project files as the guaranteed server-free sharing path. Completion means projects can be exchanged without backend persistence.
41. **Share URL** — encode compact safe tune/config states into reconstructable URLs when size permits. Completion means a link can open the same music box without an account.
42. **Share metadata / preview** — include the minimum safe title/description state needed to understand a shared project. Completion means recipients can identify what they opened.
43. **Hosted-sharing decision** — evaluate public/private hosted pages only if need, privacy/moderation/copyright, storage and operating cost justify them. Completion may explicitly decide not to build hosted storage.

### Evidence-based advanced music-box customization

44. **Real cylinder-music-box research** — document real note counts, comb/tine construction, weights, dampers, cylinders, spring drives, governors, bedplates, cases and materials using reliable sources. Completion means advanced controls are grounded in real mechanisms.
45. **Benchmark x real-mechanism analysis** — compare the requirement report from step 30 with real mechanism options from step 44. Completion means each advanced parameter has a reason to exist.
46. **Customize taxonomy** — organize future controls into Music / Mechanism / Materials / Case. Completion means a growing editor remains understandable.
47. **Comb / note-count Customize** — implement selected real note-count/comb variants. Completion means note range can expand in a mechanically meaningful way.
48. **Tine Customize** — model selected length/thickness/mass/weight/tuning variation. Completion means comb design can affect geometry and, where modeled, sound.
49. **Cylinder / pin Customize** — expand cylinder size and pin geometry/density constraints. Completion means the physical tune carrier can be designed more deeply.
50. **Damper / articulation mechanism** — add dampers or related mechanisms where research and benchmark needs justify them. Completion means note termination/articulation can become mechanically explicit.
51. **Drive Customize** — add spring motor/governor variants only after the hand-crank boundary is stable. Completion means non-hand-cranked real music-box drive can be represented.
52. **Material Customize** — add real-use steel/brass/wood/etc. material choices with clear distinction between visual-only and acoustically modeled effects.
53. **Resonance model** — model selected comb/bedplate/case vibration transfer. Completion means material/structure choices can alter sound through an explicit model.
54. **Case Customize** — add open mechanism, wooden enclosure or other researched case variants. Completion means users can configure the complete music-box presentation rather than only the exposed mechanism.

### Music-box-native advanced editing

55. **3D cylinder editor** — directly add/move/remove pins on the cylinder while preserving editable tune mapping where possible. Completion means users can compose as physical cylinder design.
56. **Live mechanism-constraint feedback** — report pin collisions, range and density constraints during direct editing. Completion means invalid cylinder designs are caught before playback.

### Final realism pass

57. **Geometry realism** — refine comb/tines, pins, gears, shafts, bearings, fasteners and case construction. Completion means the mechanism reads closer to a real manufactured music box.
58. **Material realism** — improve wood grain, steel/brass response, machining surfaces, roughness and restrained wear detail. Completion means the current generic-WebGL look is materially reduced.
59. **Lighting / camera realism** — improve reflections, shadows and inspection framing without hiding mechanical causality. Completion means the instrument is both readable and visually convincing.
60. **Motion realism final pass** — re-check pin loading, release, tine vibration, gears and crank after all later customization. Completion means improved visuals never detach motion from the authoritative mechanical state.

### Final verification

61. **Desktop automated end-to-end QA** — cover composition/import/fit/save/export/share/customization invariants that can be automated.
62. **Mobile automated end-to-end QA** — cover responsive/touch-oriented layout and practical runtime behavior in browser automation.
63. **Minimal real-device QA** — manually verify only capabilities automation cannot adequately prove: real audio startup, microphone/file-picker/download behavior, touch/gesture conflicts and practical performance.
64. **Accessibility / performance / documentation sync** — keyboard/focus/contrast, lower-performance behavior, How to use, About, rights/privacy and import/export guidance.
65. **Completion decision** — require green CI/benchmark gates, passed minimal real-device gates and no unresolved blocking mechanical/data/export defect. Completion means the Music Box can be presented as a finished creator: select or create a melody, import audio/MIDI, fit it to the mechanism, generate the cylinder, play/customize it, save/reopen it, export audio/video and share it.

## Current position

Preset foundation steps 1-11, TuneDocument step 12 and Piano Roll step 13 are complete on main. PR #21 is the active lane for step 14 on-screen keyboard input. Its recording output must remain on the canonical TuneDocument -> mechanical compiler path and must pass desktop/mobile recording/localization browser gates before merge. After step 14 is green and merged, proceed to step 15 computer-keyboard input. Do not jump to MIDI/audio import, advanced Customize or final realism first.

## Mechanical causality gate

At every stage the authoritative chain remains:

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Composition/import, Auto Fit, customization, rendering and exports must feed or consume this chain. They must not introduce an independent scheduler that decides note timing separately.

## Privacy / rights boundary

- Prefer local/in-browser microphone and audio-file processing where practical.
- Never silently upload or embed source microphone/audio media into native projects or share URLs.
- App-supplied demo tunes must remain clearly distinguished from user-provided material.
- Hosted sharing is optional and requires an explicit later decision covering persistence, privacy, copyright/moderation and cost.

## Localization

EN/JA runtime support is implemented. New user-facing tune/composition/import/export/share/customization copy must be added to both catalogs together.

## Schedule discipline

The numbered schedule is dependency order, not a calendar promise. Work may overlap only when it does not bypass an earlier acceptance gate. Any change to product order, mechanical causality, data formats, privacy, import/export/sharing boundaries or completion criteria must update this document and the relevant specification in the same PR.