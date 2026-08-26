# Procedural Instrument Lab

Experimental browser-based procedural instruments.

The first instrument is a fully generated mechanical music box. The project may remain focused on the music box or expand to additional instruments later; the architecture keeps that option open without making multi-instrument support a requirement for v1.

## Principles

- No external 3D model is required for the core instrument.
- Instrument geometry is generated in code.
- Mechanical state is the source of truth for both rendering and sound.
- Music data drives the physical note layout where the instrument requires it.
- Instrument-specific mechanisms stay isolated until a second instrument proves an abstraction is genuinely reusable.

## First milestone

Build a browser-based cylinder music box where:

1. a crank drives the cylinder,
2. tune data generates cylinder pins,
3. a pin reaches the contact zone,
4. the corresponding comb tine is plucked,
5. that tine visibly vibrates,
6. the matching note is sounded.

The first vertical slice is intentionally small. Visual polish and broad instrument support come after the mechanism works.
