# Music Box Compatibility Analyzer

Roadmap step 23 adds a deterministic pre-fit report for accepted or candidate `TuneDocument` data. It does not modify notes and does not bypass the mechanical compiler.

## Checks

The analyzer reports:

- **Range** — pitches not present on the current comb are blocking conflicts.
- **Simultaneous notes** — notes with the same start beat are reported for chord-loading review. The current model can align pins across lanes, so simultaneity alone is not declared impossible.
- **Density** — repeated notes on one tine lane are checked against circumference spacing derived from cylinder radius and document length.
- **Pin spacing** — same-lane pins closer than the physical pin-diameter boundary are blocking conflicts.

The report distinguishes blocking conflicts from review warnings. It never silently transposes, quantizes, deletes or simplifies notes; those transformations belong to step 24 Auto Fit and require explicit user acceptance.

## Source of truth

Compatibility is derived from `TuneDocument` plus `MusicBoxConfig`. It is advisory input to fitting. Accepted tune data remains the source for pin compilation, and the runtime causal chain remains unchanged.

## Verification

Unit fixtures cover an in-range spaced melody, out-of-range notes, simultaneous starts and an intentionally over-dense same-lane pair. Later benchmark steps broaden these fixtures across range, timing, density and mechanism variants.
