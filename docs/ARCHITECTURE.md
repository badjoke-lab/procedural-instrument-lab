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
- `src/instruments/music-box/`: cylinder, pins, comb, tines, crank, gears, tuning, contact/deflection/release logic and music-box synthesis.
- `src/rendering/`: scene-level rendering helpers that are not specific to one instrument.
- `src/audio/`: shared audio helpers only after reuse is demonstrated.
- `src/interaction/`: shared camera/input helpers only after reuse is demonstrated.
- `src/i18n/`: UI message catalogs and locale selection.

## Product information architecture

The primary music-box page is the interactive surface, not the documentation surface. It uses simple wording and only enough explanation for a first-time user to understand what can be done.

- **Music box page**: concise title/copy, Play/Stop, speed, Reset view, EN/JA, 3D scene and discoverable `Customize`.
- **Customize section**: bounded mechanical controls; on mobile it is normal document flow with no fixed-height nested scroller.
- **How to use page**: operating instructions plus beginner-oriented explanations of crank, gears, cylinder, pins and comb/tines.
- **About page**: project purpose, causal implementation philosophy and inspiration/credits.

GitHub Pages is the current real-device verification host. Secondary pages must work under the project Pages base path without server-side routing.

## Language policy

English is the default UI language for v1 and Japanese (`ja`) is the first additional locale. User-facing strings use the message catalog. Mechanical/configuration identifiers remain English and locale-independent.

## v1 customization target

Mechanically meaningful parameters include tine count / note range, cylinder radius / length, pin dimensions, gear ratio, crank speed / tempo and tune. The current exposed controls remain intentionally bounded. Cosmetic-only settings must not pretend to be mechanical parameters.

## Deferred

- full rigid-body/contact physics,
- spring motor simulation,
- acoustically accurate resonator box,
- MIDI import,
- persistence / accounts,
- 3D-print export,
- broad cosmetic editor,
- additional instruments.
