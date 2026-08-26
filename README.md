# Procedural Instrument Lab

Experimental browser-based procedural instruments.

The first instrument is a mechanical cylinder music box whose meaningful geometry, mechanism state and playback behavior are generated in code. The repository is intentionally instrument-neutral, but no second instrument is committed for v1.

## Current status

The active vertical slice is proving this causal chain:

`tune/configuration -> generated pins -> drive/cylinder state -> explicit pin/tine contact -> pluck event -> tine animation + audio`

Rendering is not the playback source of truth.

## Development source of truth

Before changing implementation, read the current branch versions of:

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ROADMAP.md`
4. `docs/MUSIC_BOX_V1.md`

Repository documents control scope, architecture, sequencing, language policy and acceptance gates. They must be updated with any change that alters those decisions.

## UI language

English is the default v1 locale. The UI uses a message layer from the beginning; Japanese is the first planned additional locale.

## Principles

- No external 3D model is required for the core instrument.
- Instrument geometry is generated in code.
- Mechanical state is the source of truth for both rendering and sound.
- Music data drives the physical note layout where the instrument requires it.
- Instrument-specific mechanisms stay isolated until a second instrument proves an abstraction is genuinely reusable.

## Verification

`npm run verify` runs TypeScript checking, mechanism tests and the production build.
