# On-screen keyboard input

This specification covers roadmap step 14 for the current Music Box product.

## Purpose

The on-screen keyboard lets a user perform notes instead of placing every note manually in the Piano Roll. Performance input must become editable `TuneDocument` data before it reaches the mechanical compiler.

## Authoritative path

`pointer press/release -> performed timing -> TuneDocument note -> NoteEvent -> cylinder pin geometry -> mechanical runtime`

The keyboard may preview a pressed pitch immediately for usability, but preview audio is not an authoritative playback timeline and must not replace the recorded TuneDocument/mechanical path.

## Recording behavior

- Recording starts only after an explicit Record action.
- Key-down and key-up timestamps are measured locally in the browser.
- Elapsed time is converted to beats using the active TuneDocument `tempoBpm`.
- Initial recording quantization is 1/4 beat.
- A tap shorter than the quantize step still creates a minimum 1/4-beat note.
- If a performance passes the existing document end, `lengthBeats` expands to contain the recorded note.
- Recorded notes are ordinary TuneDocument notes and remain editable in the Piano Roll.
- Recording a note must stop active mechanical playback before applying the updated document, so stale contact/release state cannot leak into the new cylinder.

## Initial keyboard range

The first UI exposes the current playable diatonic range C4-C5: C4, D4, E4, F4, G4, A4, B4, C5. Wider/chromatic input belongs to later compatibility/advanced mechanism work unless the current mechanism range is expanded first.

## Acceptance gate

Step 14 is complete when:

1. the Compose area exposes an obvious localized on-screen keyboard;
2. pressing a key provides immediate local feedback;
3. Record captures press start and release duration into TuneDocument;
4. the recorded note appears in the Piano Roll and regenerates visible cylinder pins through the existing compiler path;
5. desktop/mobile browser tests cover Record -> key press/release -> edited-state -> Piano Roll note count change -> playable mechanism;
6. EN/JA copy and How to use are synchronized;
7. no independent note scheduler is introduced for final playback.
