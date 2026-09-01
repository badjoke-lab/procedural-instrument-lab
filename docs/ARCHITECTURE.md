# Architecture

## Product boundary

Procedural Instrument Lab is a browser-based experiment in instruments whose meaningful geometry and mechanisms are generated in code.

The repository is intentionally instrument-neutral, but v1 is not a multi-instrument platform. The only committed v1 instrument is the mechanical cylinder music box.

Music-box-specific abstractions remain inside `src/instruments/music-box/` until actual reuse proves a shared abstraction useful.

## Repository source of truth

Repository documentation is the project source of truth. Active development must consult the latest branch versions of:

- `docs/ARCHITECTURE.md`,
- `docs/MUSIC_BOX_V1.md`,
- `docs/ROADMAP.md`,
- `docs/PRESENTATION_CHECKLIST.md`,
- `AGENTS.md`.

When implementation decisions change product behavior, architecture, information architecture, language policy, scope, acceptance gates, or sequencing, update the relevant documentation in the same change. Chat history is not the source of truth.

## Source of truth for runtime state

Rendering is never the runtime source of truth. Mechanical state is authoritative. Rendering and audio consume state/events derived from the mechanism.

For the music box, the required pipeline is:

1. tune data defines notes and normalized start positions,
2. instrument configuration defines note set and cylinder dimensions,
3. tune compilation maps note -> tine index / axial position and start -> cylinder angle,
4. crank/drive state advances the gear train and cylinder phase,
5. contact resolution derives pin/tine engagement and normalized deflection from explicit geometry,
6. the engaged tine visibly deflects from that mechanical contact state,
7. leaving engagement emits one release/pluck event,
8. free tine vibration and audio consume that same release/pluck event.

The release/pluck event, not a detached playback timer, is the audible event source. Rendering may visually amplify the mechanically derived deflection/vibration so it remains legible on small screens, but it must not invent independent timing.

## Module boundary

- `src/core/`: only mechanisms proven reusable across instruments.
- `src/instruments/music-box/`: cylinder, pins, comb, tines, crank, gears, tuning, contact/deflection/release logic, music-box tune/project data and music-box synthesis.
- `src/rendering/`: scene-level rendering helpers that are not specific to one instrument.
- `src/audio/`: shared audio helpers only after reuse is demonstrated.
- `src/interaction/`: shared camera/input helpers only after reuse is demonstrated.
- `src/i18n/`: UI message catalogs and locale selection.

## Tune and composition boundary

A shipped `TunePreset` is immutable app-supplied tune data. Future user-created work must use a separate versioned editable composition/project representation rather than mutating preset definitions or using rendered audio as project state.

All composition input paths converge before mechanical compilation:

`preset / piano roll / MIDI / keyboard / microphone recognition / audio-file recognition / cylinder editor -> editable tune data -> music-box fit/validation -> pin geometry -> mechanical runtime`

This ensures microphone or file analysis does not become an alternate player. Imported/recognized notes remain editable before the cylinder is generated.

Auto Fit is an upstream, non-destructive proposal stage inside this composition path. It may transform a derived TuneDocument proposal for compatibility analysis, but it must not mutate the source document, accept staged recognition, regenerate pins or schedule playback until a later explicit acceptance step promotes a fitted result.

Mechanical-quality issues that remain explicitly tracked do not automatically halt unrelated upstream composition/import/fit work. A feature may proceed when it does not alter, bypass or conceal the affected mechanical behavior. Assistant-side perceptual judgement is not an architecture gate.

The project-data representation should carry stable schema/version metadata, tune note/timing data, user-facing metadata and only the music-box configuration needed to recreate the project. Source microphone/audio files are not automatically embedded in project data.

## Export boundary

Exports are derived views of the project/runtime, not new sources of truth:

- native project export/import preserves editable composition plus relevant configuration,
- MIDI export is note-data interchange where appropriate,
- audio export renders mechanically driven sound,
- video export captures the mechanism animation synchronized with that same mechanically driven sound,
- share links reconstruct supported project state rather than pointing at an unrelated pre-rendered media stream.

Start with browser-practical formats and only promise formats that are reliable in supported browsers. WAV is the preferred first audio target; WebM is a practical first video target. MP3/MP4 may follow when implementation support is dependable.

## Persistence and sharing boundary

Portable local project files and compact URL-state sharing do not require accounts or backend persistence and are preferred first.

Hosted public/private project pages, uploads, accounts or cloud libraries are later optional capabilities only after privacy, copyright/moderation, storage cost and operating requirements are explicitly accepted. Microphone/file input should remain local/in-browser where practical and source media must never be silently uploaded.

## Product information architecture

The primary music-box page is the interactive surface, not the documentation surface. It uses simple wording and only enough explanation for a first-time user to understand what can be done.

- **Music box page**: concise title/copy, Tune, Play/Stop, speed, Reset view, EN/JA, 3D scene and discoverable `Customize`.
- **Customize section**: bounded mechanical controls; on mobile it is normal document flow with no fixed-height nested scroller.
- **How to use page**: operating instructions plus beginner-oriented explanations of crank, gears, cylinder, pins and comb/tines.
- **About page**: project purpose, causal implementation philosophy, inspiration/credits and supplied tune attribution.
- Future composition/import/export screens should be separate task surfaces rather than overloading the primary instrument page.

GitHub Pages is the current real-device verification host. Secondary pages must work under the project Pages base path without server-side routing.

## Language policy

English is the default UI language for v1 and Japanese (`ja`) is the first additional locale. User-facing strings use the message catalog. Mechanical/configuration identifiers remain English and locale-independent.

## v1 customization target

Mechanically meaningful parameters include tine count / note range, cylinder radius / length, pin dimensions, gear ratio, crank speed / tempo and tune. The current exposed controls remain intentionally bounded. Cosmetic-only settings must not pretend to be mechanical parameters.

## Scheduled later work

The roadmap now explicitly schedules post-v1 piano-roll composition, MIDI import/export, keyboard performance input, microphone/audio-file melody extraction, direct cylinder editing, native project save/load, audio/video export and sharing.

Still deferred without a committed implementation gate:

- full rigid-body/contact physics,
- acoustically accurate resonator simulation,
- 3D-print export,
- additional instruments.
