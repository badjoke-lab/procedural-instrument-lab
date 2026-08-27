# Computer keyboard input

This specification covers roadmap step 15 for the current Music Box product.

## Purpose

Computer-keyboard input lets desktop users perform the current C4-C5 music-box range without external MIDI hardware. It extends the existing on-screen keyboard recording path rather than creating a second composition timeline.

## Mapping

The initial physical-key mapping uses `KeyboardEvent.code` so the performance controls stay tied to physical key positions:

- A -> C4
- S -> D4
- D -> E4
- F -> F4
- G -> G4
- H -> A4
- J -> B4
- K -> C5

The range intentionally matches the currently playable diatonic comb. Chromatic or wider input waits for the compatibility/advanced-mechanism work that can represent those notes honestly.

## Authoritative path

`computer key down/up -> performed timing -> TuneDocument note -> NoteEvent -> cylinder pin geometry -> mechanical runtime`

Immediate key-down preview is allowed for input feedback. It is not the final playback scheduler and does not bypass the recorded TuneDocument or mechanical release/pluck path.

## Interaction rules

- Computer keys work only while the Compose drawer containing the keyboard is open.
- Pressing a mapped key gives immediate preview feedback and uses the same visible active-key state as the on-screen keyboard.
- Recording occurs only after the explicit Record action already used by the on-screen keyboard.
- Key down/up timing uses the same active recording session, beat conversion, quantization, minimum duration and TuneDocument extension rules as on-screen pointer input.
- Auto-repeat must not create duplicate key-down events.
- Alt/Ctrl/Meta modified shortcuts are not treated as music input.
- Input/select/textarea/contenteditable targets retain normal typing behavior; music shortcuts must not steal their keys.
- Losing window focus clears held computer-key visual state rather than leaving a stuck key.

## Acceptance gate

Step 15 is complete when:

1. A/S/D/F/G/H/J/K visibly map to C4-C5 in the Compose guidance;
2. mapped key down/up gives immediate preview and active-key feedback while Compose is open;
3. Record captures computer-key timing into ordinary TuneDocument notes using the existing recording model;
4. recorded computer-key notes regenerate the cylinder through the same compiler/mechanical runtime as Piano Roll and on-screen keyboard notes;
5. typing in form/editable controls is not intercepted as music input;
6. unit tests cover the stable physical-key mapping and desktop browser tests cover preview, recording and editable-control exclusion;
7. EN/JA guidance is synchronized;
8. no independent final-playback scheduler is introduced.
