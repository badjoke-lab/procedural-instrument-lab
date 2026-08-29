# Music Box Compatibility Analyzer

Roadmap step 23 adds a deterministic pre-fit report for the editable `TuneDocument`. It does not modify notes and does not bypass the mechanical compiler.

## Checks

The analyzer reports:

- **Range** — pitches not present on the current comb are blocking conflicts.
- **Simultaneous notes** — notes with the same start beat are reported for chord-loading review. The current model can align pins across separate tine lanes, so simultaneity alone is not declared impossible.
- **Density** — repeated notes on one tine lane are checked against circumference spacing derived from cylinder radius and document length.
- **Pin spacing** — same-lane pins closer than the physical pin-diameter boundary are blocking conflicts.

The report distinguishes blocking conflicts from review warnings. It never silently transposes, quantizes, deletes or simplifies notes; those transformations belong to step 24 Auto Fit and require explicit user acceptance.

## Compose UI

`Compose` shows the compatibility report beside the editable piano-roll workflow. The report shows:

- whether the current editable melody has blocking conflicts,
- how many notes are on the current comb,
- blocking-conflict and review-warning counts,
- issue categories for range, simultaneous starts, density and pin spacing,
- affected MIDI pitches where a category has issues.

When microphone/audio recognition is being reviewed, the panel analyzes the staged candidate because that is the document currently shown in the piano roll. This does not promote the candidate or regenerate cylinder pins. Accept/discard semantics from `docs/RECOGNITION_CORRECTION.md` remain unchanged.

The current exposed Customize controls do not alter the fixed comb pitch set, cylinder radius or pin radius used by these tune-specific checks. Invalid mechanism geometry is already rejected by `validateMusicBoxConfig`. Later cylinder/pin/comb customization must pass the live configuration into the same analyzer rather than duplicating compatibility rules.

## Source of truth

Compatibility is derived from `TuneDocument` plus `MusicBoxConfig`. It is advisory input to fitting. Accepted tune data remains the source for pin compilation, and the runtime causal chain remains unchanged.

## Verification

Unit fixtures cover an in-range spaced melody, out-of-range notes, simultaneous starts, review-only simultaneity, density and direct pin-spacing conflicts. Browser coverage verifies the report on the Compose surface, an imported out-of-range/simultaneous MIDI fixture, EN/JA copy and retained edited-tune behavior. Desktop/mobile runtime evidence is retained by CI.
