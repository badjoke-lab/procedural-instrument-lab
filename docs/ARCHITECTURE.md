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
- `AGENTS.md` for agent/contributor operating rules.

When implementation decisions change product behavior, architecture, language policy, scope, or sequencing, the relevant documentation must be updated in the same change. Chat history is not the source of truth.

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

## Language policy

English is the default UI language for v1.

The implementation must remain localization-ready from the beginning:

- user-facing UI strings must be referenced through a small message-catalog layer rather than hard-coded throughout components,
- the initial required locale is `en`,
- Japanese `ja` is the first planned additional locale,
- the UI must not show bilingual labels such as `Play / 再生` by default,
- when locale switching is introduced, a compact selector such as `EN / JA` is preferred,
- instrument/mechanism identifiers, code symbols, file names and canonical parameter keys remain English and locale-independent.

Localization work must not block the mechanical v1 milestones. The architecture must make Japanese addition straightforward without requiring UI restructuring.

## v1 customization target

Mechanically meaningful parameters:

- tine count / note range
- cylinder radius / length
- pin dimensions
- gear ratio
- crank speed / tempo
- tune

A configuration change must regenerate or remap the mechanism where physically relevant. Cosmetic-only settings must not pretend to be mechanical parameters.

## Deferred

- rigid-body physics
- spring motor simulation
- acoustically accurate resonator box
- MIDI import
- persistence / accounts
- 3D-print export
- broad cosmetic editor
- additional instruments
