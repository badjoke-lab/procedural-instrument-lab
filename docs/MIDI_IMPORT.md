# MIDI import

This specification covers roadmap step 16 for the current Music Box creator.

## Purpose

MIDI import is a precise note/timing input path for users who already have `.mid` / `.midi` material from a DAW, notation tool or other MIDI-producing software.

The authoritative path is:

`local MIDI file -> parsed note/timing data -> editable TuneDocument -> later compatibility/Auto Fit -> NoteEvent -> cylinder pins -> mechanical runtime`

MIDI import must never create a second player or scheduler that bypasses TuneDocument or the mechanical runtime.

## Initial supported boundary

- Standard MIDI File format 0 and 1.
- PPQ/ticks-per-quarter-note time division.
- Note On, Note Off and Note On with velocity 0.
- Running status.
- Multiple tracks merged onto the TuneDocument beat timeline.
- Tempo metadata; the first effective tempo becomes `tempoBpm`.
- Multiple tempo values are flattened to the first tempo in TuneDocument v1, with a visible warning; beat positions remain unchanged.

SMPTE time division and unsupported/corrupt data are rejected with an explicit import error.

## Pitch and compatibility rule

Import preserves MIDI pitches `0..127`, including pitches outside the current C4-C5 comb. MIDI import must not silently transpose, clamp, quantize or discard valid musical data merely to fit the current mechanism.

Mechanical compatibility belongs to roadmap steps 23-25. Until then, imported material can be valid TuneDocument data even when the current physical music box cannot compile every note.

## Local-file/privacy rule

The selected MIDI file is read locally in the browser. The source file is not uploaded, embedded in a project or added to a share URL by this step.

## Acceptance gate

Step 16 is complete when:

1. deterministic unit fixtures cover valid note/timing import, tempo metadata, out-of-current-range pitch preservation and unsupported timing rejection;
2. Compose exposes an obvious EN/JA MIDI-file action;
3. a selected supported file becomes the active editable TuneDocument;
4. successful import marks the tune edited and returns through the existing TuneDocument/mechanical path;
5. malformed/unsupported data produces readable feedback without replacing the last valid TuneDocument;
6. desktop/mobile browser tests cover local file import and localization;
7. no independent MIDI playback scheduler is introduced.
