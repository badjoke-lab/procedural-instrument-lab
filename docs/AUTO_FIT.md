# Auto Fit to Music Box

Roadmap Step 24 turns an editable melody into an explicit **fit proposal** for the current music-box mechanism. Step 25 then previews that proposal in the existing piano roll, allows manual correction and requires explicit acceptance before the fitted result can replace the editable working tune. Neither step silently rewrites the source TuneDocument or regenerates cylinder pins.

The boundary is:

`editable/candidate TuneDocument -> explicit fit options -> derived fit proposal -> preview/manual correction -> explicit acceptance -> editable TuneDocument`

The source document remains unchanged while a proposal is being reviewed. The fitted proposal becomes the piano-roll working document only for preview/correction; it is not accepted merely because it is visible or edited.

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

## Change record and fit preview

Every proposed transformation is recorded as a structured change:

- octave move,
- nearest-note mapping,
- timing quantization,
- repeated-note removal.

After generation, Compose keeps the original source separately and shows the fitted proposal through the same piano-roll editor used for ordinary tune editing. The Auto Fit panel shows source/fitted note counts and compatibility change, while pitch, start, duration, add-note and remove-note operations edit only the proposal.

`Use fitted result` explicitly accepts the currently corrected proposal into the editable working tune. `Discard fit proposal` removes the proposal and restores the unchanged source view. Merely generating, viewing or editing a proposal is never acceptance.

## Compatibility reuse

Auto Fit reuses `analyzeMusicBoxCompatibility` before/after proposal generation. It does not duplicate range or pin-spacing rules. While previewing a proposal, the compatibility panel describes that fitted working document. A proposal can still contain review warnings such as simultaneous starts even when all blocking conflicts are removed.

## Recognition candidates

When microphone/audio recognition is under review, Compose passes that staged candidate into Auto Fit because it is the document currently being edited. Generating or manually correcting a fit proposal does not accept the recognition candidate. If `Use fitted result` is chosen while recognition is staged, the corrected fitted result replaces the staged recognition candidate only; the separate `Accept recognized melody` action is still required before the accepted TuneDocument changes.

Editing, accepting or discarding the recognition candidate invalidates stale fit-proposal state.

## Mechanical causality

Steps 24-25 remain upstream of mechanical compilation:

`tune/candidate -> fit proposal -> preview/manual correction -> explicit acceptance -> pin geometry -> mechanical runtime`

No Auto Fit or fit-preview action plays audio, schedules notes independently or writes cylinder pins directly. Step 26 owns explicit TuneDocument-to-cylinder generation. Issue #10 therefore remains a separate mechanical-quality defect rather than an assistant-validation prerequisite for these upstream creator features.

## Verification

Unit fixtures cover:

- octave-only fitting,
- nearest-note mapping and deterministic ties,
- timing quantization and document bounds,
- same-lane pin-spacing simplification,
- combined transforms with source immutability,
- invalid quantization input.

Browser coverage verifies on desktop/mobile Chromium that a conflicting imported tune can generate and preview a proposal, manually correct it, explicitly accept the corrected fit, or discard it and recover the unchanged source. It also covers EN/JA Auto Fit controls.

These checks are regression/feature gates for Auto Fit and fit preview. They do not claim to visually or audibly close Issue #10.
