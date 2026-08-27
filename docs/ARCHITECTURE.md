# Architecture

## Product boundary

Procedural Instrument Lab is a browser-based experiment in instruments whose meaningful geometry and mechanisms are generated in code.

The repository is intentionally instrument-neutral, but v1 is not a multi-instrument platform. The only committed v1 instrument is the mechanical cylinder music box.

A second instrument may be added later. Until that happens, music-box-specific abstractions must remain inside `src/instruments/music-box/` rather than being prematurely promoted into a generic engine.

## Repository source of truth

Repository documentation is the project source of truth. Development work must consult the latest committed or active-branch versions of the relevant specification and roadmap documents before implementation decisions are made.

At minimum, active development must consult:

- `docs/ARCHITECTURE.md` for architectural and product-boundary rules,
- `docs/MUSIC_BOX_V1.md` for current music-box acceptance criteria,
- `docs/ROADMAP.md` for sequencing and completion gates,
- `docs/PRESENTATION_CHECKLIST.md` for Phase 5 browser/device quality checks,
- `AGENTS.md` for agent/contributor operating rules.

When implementation decisions change product behavior, architecture, information architecture, language policy, scope, or sequencing, the relevant documentation must be updated in the same change. Chat history is not the source of truth.

## Source of truth for runtime state

Rendering is never the runtime source of truth. Mechanical state is authoritative. Rendering and audio consume events or state derived from the mechanism.

For the music box, the intended pipeline is:

1. tune data defines notes and normalized start positions,
2. instrument configuration defines note set and cylinder dimensions,
3. tune compilation maps note -> tine index / axial position and start -> cylinder angle,
4. mechanism state advances cylinder phase,
5. contact resolution detects a pin crossing the comb contact zone,
6. contact emits a pluck event,
7. tine animation and audio consume that same pluck event.

## Module boundary

- `src/core/`: only mechanisms proven reusable across instruments.
- `src/instruments/music-box/`: cylinder, pins, comb, tines, crank, gears, tuning and music-box-specific contact logic.
- `src/rendering/`: scene-level rendering helpers that are not specific to one instrument.
- `src/audio/`: shared audio output helpers only after reuse is demonstrated.
- `src/interaction/`: shared camera/input helpers only after reuse is demonstrated.
- `src/i18n/`: UI message catalogs and locale selection. User-facing strings should not be scattered through instrument components.

The first vertical slice may stay compact while the mechanism is being proven. Refactoring into the full module tree comes after the causal pipeline works end-to-end.

## Product information architecture

The primary music-box page is the interactive surface, not the documentation surface. It should use simple wording and show only enough explanation for a first-time user to understand what can be done.

The v1 information architecture is:

- **Music box page**: concise title/copy, Play/Stop, speed, Reset view, EN/JA, 3D scene and a clearly discoverable `Customize` entry point.
- **Customize section**: the bounded mechanical controls. On mobile it is part of normal document flow and must not be hidden inside a fixed-height nested scroller.
- **How to use page**: detailed operating instructions plus beginner-oriented explanations of crank, gears, cylinder, pins and comb/tines.
- **About page**: project purpose, causal/mechanical implementation philosophy and inspiration/credits.

A user should not need prior knowledge of music-box mechanics to discover the main functions. Detailed mechanical explanations must not make the primary page verbose.

GitHub Pages is the current real-device verification host. Lightweight secondary pages should work under the project Pages base path without requiring server-side routing.

## Language policy

English is the default UI language for v1.

The implementation must remain localization-ready:

- user-facing UI strings must be referenced through the message-catalog layer rather than hard-coded throughout components,
- the required locales are `en` and `ja`,
- the UI must not show bilingual labels such as `Play / 再生` by default,
- locale switching uses a compact selector such as `EN / JA`,
- instrument/mechanism identifiers, code symbols, file names and canonical parameter keys remain English and locale-independent.

## v1 customization target

Mechanically meaningful parameters include:

- tine count / note range,
- cylinder radius / length,
- pin dimensions,
- gear ratio,
- crank speed / tempo,
- tune.

The current exposed v1 controls are intentionally bounded; not every internal parameter must be user-editable yet. A configuration change must regenerate or remap the mechanism where physically relevant. Cosmetic-only settings must not pretend to be mechanical parameters.

## Deferred

- rigid-body physics,
- spring motor simulation,
- acoustically accurate resonator box,
- MIDI import,
- persistence / accounts,
- 3D-print export,
- broad cosmetic editor,
- additional instruments.
