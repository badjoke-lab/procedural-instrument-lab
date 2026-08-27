# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose meaningful geometry is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. Tune data, cylinder pins, drive state, pin/tine engagement, tine deformation, release, vibration and sound share the same mechanical state.

The primary page must be understandable to a first-time user who does not already know how a mechanical music box works.

## Runtime causal chain

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

Rendering and audio do not decide note timing independently. A selected tune is compiled into physical pin positions; only the resulting mechanical release/pluck event may start audible output.

## v1 tune behavior

- The hard-coded scale is replaced by `TunePreset` data.
- Shipped presets have stable ids, EN/JA titles, normalized NoteEvent data and attribution metadata.
- Initial demo tunes are recognizable public-domain melodies represented as project-authored NoteEvent sequences. Do not copy a modern MIDI file, commercial arrangement, recording or sampled performance.
- Selecting a tune stops the current automatic run and remounts mechanism interaction state before the new cylinder pin pattern is used.
- Every shipped preset must compile into the configured comb note set and one normalized cylinder revolution.
- Tune selection is covered by unit/browser tests and documented in How to use / About.

## Mechanical acceptance criteria

- base, crank, cylinder, pins and comb/tines are generated in code,
- tune events generate physical pin positions,
- cylinder phase is authoritative playback state,
- engagement is derived from explicit geometry,
- the affected rooted tine visibly deflects while engaged,
- engagement exit emits exactly one release/pluck event for the pin pass,
- the same release/pluck event starts visible free vibration and audible output,
- one full revolution produces one release per configured pin across materially different sampling rates,
- crank, gears and cylinder derive from one drive state,
- manual crank uses the same contact/deflection/release/audio path as autoplay,
- speed changes do not separate mechanism, vibration and sound.

## Information architecture

The primary page stays concise and task-oriented. It contains Tune, Play/Stop, Speed, Reset view, language controls, 3D scene and discoverable Customize. Detailed instructions belong on `How to use`; project background, inspiration and demo-tune rights/provenance belong on `About`.

## Current customization scope

Currently exposed controls are cylinder length, tine spacing, driver gear tooth count and cylinder gear tooth count. Invalid configurations preserve the last valid mechanism.

Advanced customization is deliberately later than composition/import/export. It will be selected from real cylinder-music-box research plus benchmark evidence showing which mechanism constraints actually block useful tunes.

Future controls are organized into:

- **Music**: tune/pin pattern and composition,
- **Mechanism**: cylinder, comb/tines, gears, drive, dampers and related geometry,
- **Materials / resonance**: visual material plus explicitly modeled acoustic consequences where supported,
- **Case**: enclosure/base variants distinct from the core mechanism.

Do not claim physical/acoustic simulation merely because a material color changes.

## Composition/import boundary

The next creator stage uses a versioned editable `TuneDocument` separate from immutable app-supplied `TunePreset` definitions.

All future inputs converge before mechanical compilation:

`preset / piano roll / keyboard / MIDI / microphone recognition / audio-file recognition / cylinder editor -> editable tune data -> music-box fit/validation -> pin geometry -> mechanical runtime`

Microphone/audio import must produce editable note candidates; imported source media must not become an independent player or scheduler.

The planned order is piano-roll editing, keyboard entry, MIDI import/export, microphone capture/recognition, audio-file import/recognition, correction UI, compatibility analysis and Auto Fit to Music Box.

## Benchmark-first verification rule

Development does not assume high traffic or many manual tests. After the composition/import path exists, maintain synthetic tune and controlled synthetic-audio fixtures covering range, density, timing, simultaneous notes, known-invalid cases and recognition conditions.

Benchmarks must report which current mechanism constraints prevent successful conversion. Those reports, combined with real music-box research, drive advanced Customize priorities.

## Project/export/sharing boundary

- A versioned native project format preserves editable tune/arrangement data plus relevant mechanism configuration.
- Project files are the guaranteed server-free save/share path.
- MIDI export provides note-data interchange where meaningful.
- Audio export renders the same mechanically driven result; WAV is the first preferred target.
- Video export captures the 3D mechanism with the same mechanically driven audio; WebM is the first practical target and MP4 is optional when dependable.
- Compact URL-state sharing is preferred before hosted storage.
- Hosted public/private project pages or accounts require a later explicit persistence/privacy/copyright/moderation/cost decision.

Microphone and imported media should be processed locally/in-browser where practical. Source audio is never silently uploaded or embedded into project/share data.

## Visual/mechanical quality

The first realism pass exposes connected comb/cylinder/gear/crank relationships and visible tine release vibration. A later realism pass follows composition/import/benchmark/save/export/share and evidence-based advanced customization.

That pass will improve machining detail, wood/brass/steel response, fasteners, bearings, comb/tine construction, enclosure presentation, lighting and camera while preserving the same causal timing model.

## Audio quality scope

- every audible tine sound is triggered by release/pluck,
- no independent scheduler decides when preset or user-composed notes sound,
- compact procedural synthesis is acceptable until later resonance work,
- future material/resonance changes affect timbre only through an explicit model,
- future audio/video exports render or record the same mechanically driven result rather than a detached rendition.

## Language scope

English is default and Japanese is the first additional locale. Tune, composition, import/export/share and customization copy must be updated in both catalogs together.

## Development schedule

The authoritative benchmark-first 65-step schedule is in `docs/ROADMAP.md`.

The immediate lane is PR #17: TunePreset extraction, three public-domain presets, selector, pin regeneration, safe tune switching, validation, browser coverage, documentation/rights provenance and Pages publication. After that, development proceeds to `TuneDocument` and composition/import work rather than advanced customization.

## Scope rule

No additional instrument work is part of this plan. Music-box functionality, creation, import/export/sharing and evidence-based customization have priority over any generic framework or second instrument.
