# Architecture

## Product boundary

Procedural Instrument Lab is a browser-based experiment in instruments whose meaningful geometry and mechanisms are generated in code.

The repository is intentionally instrument-neutral, but v1 is not a multi-instrument platform. The only committed v1 instrument is the mechanical cylinder music box.

A second instrument may be added later. Until that happens, music-box-specific abstractions must remain inside `src/instruments/music-box/` rather than being prematurely promoted into a generic engine.

## Source of truth

Rendering is never the source of truth. Mechanical state is authoritative. Rendering and audio consume events or state derived from the mechanism.

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

The first vertical slice may stay compact while the mechanism is being proven. Refactoring into the full module tree comes after the causal pipeline works end-to-end.

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
