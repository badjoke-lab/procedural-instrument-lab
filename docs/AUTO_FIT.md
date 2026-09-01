# Auto Fit to Music Box

Roadmap Step 24 turns an editable melody into an explicit **fit proposal** for the current music-box mechanism. It does not silently rewrite the source TuneDocument and it does not regenerate cylinder pins.

The boundary is:

`editable/candidate TuneDocument -> explicit fit options -> derived fit proposal -> compatibility report`

The source document remains unchanged. Step 25 owns candidate-vs-fitted comparison, manual correction and explicit acceptance. Until that later acceptance happens, the fitted proposal is never a mechanical runtime source of truth.

## Explicit transformations

All transformations are off by default. The user chooses one or more options and then selects `Generate fit proposal`.

### Octave moves

- Applied only to pitches outside the current comb.
- Keeps pitch class unchanged.
- Moves only in 12-semitone octave steps to a pitch that exists on the current comb.
- When more than one octave target is possible, the nearest pitch is selected deterministically.

### Nearest-note mapping

- Applied only to pitches that are still outside the comb after any selected octave move.
- Maps to the nearest pitch in the current comb.
- Equal-distance ties choose the lower pitch deterministically.
- This is intentionally separate from octave moves because it can change pitch class.

### Timing quantization

- Optional `1/4 beat` or `1/2 beat` quantization in the current UI.
- Quantizes start beat and duration.
- Clamps notes so they remain inside `lengthBeats` and preserves a positive duration.
- Does not create a separate playback timeline; the resulting proposal remains TuneDocument data.

### Repeated-note pin simplification

- Targets only same-tine repeated notes that violate the current physical pin-spacing threshold.
- The threshold is derived from the same cylinder radius and pin radius used by the compatibility analyzer.
- Deterministically keeps the earlier note and removes later colliding repeats; the first/last wrap-around gap is also checked.
- It does not remove review-only chords merely because multiple different pitches begin together.

## Change record

Every proposed transformation is recorded as a structured change:

- octave move,
- nearest-note mapping,
- timing quantization,
- repeated-note removal.

This change list is intended for the Step 25 fit-preview comparison. It must not be treated as permission to accept the proposal automatically.

## Compatibility reuse

Auto Fit reuses `analyzeMusicBoxCompatibility` before/after proposal generation. It does not duplicate range or pin-spacing rules. A proposal can still contain review warnings such as simultaneous starts even when all blocking conflicts are removed.

## Recognition candidates

When microphone/audio recognition is under review, Compose passes that staged candidate into Auto Fit because it is the document currently being edited. Generating a fit proposal does not accept the recognition candidate. Editing, accepting or discarding the recognition candidate invalidates any stale fit proposal.

## Mechanical causality

Step 24 remains upstream of mechanical compilation:

`tune/candidate -> fit proposal -> later explicit acceptance -> pin geometry -> mechanical runtime`

No Auto Fit option plays audio, schedules notes independently, writes cylinder pins directly or modifies the mechanism. Issue #10 therefore remains a separate mechanical-quality defect rather than an assistant-validation prerequisite for Step 24.

## Verification

Unit fixtures cover:

- octave-only fitting,
- nearest-note mapping and deterministic ties,
- timing quantization and document bounds,
- same-lane pin-spacing simplification,
- combined transforms with source immutability,
- invalid quantization input.

Browser coverage verifies that a conflicting imported tune can produce a proposal with fewer blocking compatibility conflicts while the original editable tune and compatibility report remain unchanged. It also verifies stale-proposal invalidation and EN/JA controls on desktop/mobile Chromium.

These checks are regression/feature gates for Auto Fit itself. They do not claim to visually or audibly close Issue #10.
