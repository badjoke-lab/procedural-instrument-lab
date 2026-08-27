# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose meaningful geometry is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. Tune data, cylinder pins, drive state, pin/tine engagement, tine deformation, release, vibration and sound share the same mechanical state.

The primary page must be understandable to a first-time user who does not already know how a mechanical music box works.

## Runtime causal chain

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Rendering and audio do not decide note timing independently. A selected tune is compiled into physical pin positions; only the resulting mechanical release/pluck event may start the audible tine output.

## v1 tune behavior

- The hard-coded scale is replaced by `TunePreset` data.
- Shipped user-facing presets must have a stable id, EN/JA title, normalized NoteEvent data and attribution metadata.
- Initial demo tunes are recognizable public-domain melodies represented as project-authored NoteEvent sequences. Do not copy a modern MIDI file, commercial arrangement, recording or sampled performance.
- Selecting a tune must stop the current automatic run, discard stale mechanism interaction state and regenerate the cylinder pin pattern from the selected preset.
- Every shipped preset must compile entirely into the configured comb note set and one normalized cylinder revolution.
- Tune selection must be covered by unit/browser tests and documented in How to use / About attribution material.

## Mechanical acceptance criteria

- base, crank, cylinder, pins and comb/tines are generated in code,
- tune events generate physical pin positions,
- cylinder phase is the authoritative playback state,
- engagement is derived from explicit geometry,
- the affected rooted tine visibly deflects while engaged,
- engagement exit emits exactly one release/pluck event for the pin pass,
- the same release/pluck event starts visible free vibration and audible output,
- one full revolution produces one release per configured pin across materially different sampling rates,
- crank, gears and cylinder derive from one drive state,
- manual crank uses the same contact/deflection/release/audio path as autoplay,
- speed changes do not separate mechanism, vibration and sound.

## Information architecture

The primary page stays concise and task-oriented. It contains Tune, Play/Stop, Speed, Reset view, language controls, 3D scene and discoverable Customize. Detailed instructions belong on `How to use`; project background, inspiration and tune attribution belong on `About`.

## Current customization scope

Currently exposed mechanical controls are cylinder length, tine spacing, driver gear tooth count and cylinder gear tooth count. Invalid configurations preserve the last valid mechanism.

The next bounded expansion may add real parameters such as cylinder radius, pin dimensions and comb/note-count controls only after geometry, validation and audio consequences are specified.

Future real-music-box customization must be organized around actual domains rather than arbitrary appearance sliders:

- **Music**: tune/pin pattern and later composition or exchangeable tune concepts,
- **Mechanism**: cylinder, comb/tines, gears, drive, dampers and related geometry,
- **Materials / resonance**: visual material plus explicitly modeled acoustic consequences where supported,
- **Case**: enclosure/base variants kept distinct from the core mechanism.

Do not claim physical/acoustic simulation merely because a material color changes.

## Domain-model rule

Music-box-specific code remains under `src/instruments/music-box/`. Separate tune, comb, cylinder, drive, material/resonance and case responsibilities only when current work needs the boundary. Do not create a speculative cross-instrument framework.

The current TunePreset work is the first such extraction: tune data is no longer embedded in `main.tsx`.

The tune representation must also remain compatible with a later editable composition/project document. Future inputs such as piano-roll editing, MIDI, keyboard performance, microphone pitch extraction, audio-file melody extraction and direct cylinder editing must converge on one editable tune representation before mechanical compilation. None of those inputs may become an alternate audio scheduler.

## Scheduled composition inputs after v1

These are follow-on features, not current v1 completion requirements:

- **Piano roll** as the first precise general-purpose editor and correction surface.
- **MIDI file import** for exact note/timing interchange.
- **On-screen/computer keyboard recording**, with Web MIDI device support added only where practical.
- **Microphone recording** with explicit permission, initially for monophonic humming/singing/single-note instruments, producing editable detected notes.
- **Audio-file import** (for example WAV/MP3/M4A where browser decoding supports it) that extracts a candidate melody rather than replaying the source file as the music-box output. Complex full mixes are not promised to transcribe perfectly.
- **Direct cylinder editor** for a music-box-native view of note lanes/pin positions.

All recognized/imported material must pass a music-box-fit stage that exposes note-range, density and mechanism limitations and asks before musically significant substitutions are made.

## Scheduled project data, export and sharing after v1

Editable composition data and rendered media are separate products:

- A **versioned native project format** will store editable tune/arrangement data plus relevant music-box configuration so projects can be exported and reopened without an account.
- **MIDI export** may provide interchange of arranged note data where meaningful.
- **Audio export** should start with a dependable lossless/browser-practical format such as WAV; compressed output such as MP3 can follow when the implementation is reliable.
- **Video export** should capture the animated mechanism and the same mechanically driven audio. Browser-native formats such as WebM may be the first target; MP4 is added only if dependable in the supported runtime.
- **Shareable links** should first use compact URL/state encoding when payload size permits.
- Native project files remain a guaranteed portable sharing path.
- Hosted public/private project pages, uploads or accounts are optional later work only if persistence, privacy, moderation/copyright and operating cost are justified.

Microphone and imported media should be processed locally/in-browser where practical. Source audio must not be silently uploaded or embedded into a shared project. Public sharing must distinguish app-supplied public-domain presets from user-provided material.

## Visual/mechanical quality

The first realism pass is complete enough to expose connected comb/cylinder/gear/crank relationships and visible tine release vibration. A second realism pass is deliberately scheduled after tune functionality, bounded customization and real-device functional verification.

That later pass should improve machining detail, wood/brass/steel response, fasteners, bearings, comb/tine construction and enclosure presentation without changing the causal timing model.

## Audio quality scope

- every audible tine sound is triggered by release/pluck,
- no independent note scheduler may decide when preset or user-composed notes sound,
- compact procedural synthesis is acceptable for v1,
- later material/resonance work may alter timbre only through an explicit model rather than cosmetic labels,
- future audio/video exports must render/record this same mechanically driven result rather than substitute a detached rendition.

## Language scope

English is default and Japanese is the first additional locale. Tune labels, controls, How to use and About copy must be updated in both catalogs together. Future composition/import/export/share UI follows the same rule.

## Current development schedule

The authoritative ordered schedule is in `docs/ROADMAP.md`. Steps 1-23 cover current v1 and its direct customization foundation. Steps 24-40 schedule the follow-on composition, project-data, export and sharing lane. The immediate lane remains TunePreset extraction, three public-domain presets, selector, pin regeneration, safe tune switching, validation, browser coverage, documentation/attribution and Pages publication.

## Scope rule

No additional instrument work is part of this plan. Music-box completion and music-box customization/composition foundations have priority over any generic framework or expansion work.
