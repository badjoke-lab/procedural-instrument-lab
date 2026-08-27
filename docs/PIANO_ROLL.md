# Piano Roll Editor

This document defines roadmap step 13 for the current Music Box creator lane. Read it with `docs/TUNE_DOCUMENT.md`, `docs/ROADMAP.md`, `docs/MUSIC_BOX_V1.md` and `AGENTS.md`.

## Purpose

The piano roll is the first user-authored composition surface. It edits `TuneDocument`; it is not an independent playback sequencer.

The authoritative path remains:

`Piano Roll -> TuneDocument -> normalized NoteEvent -> cylinder pin geometry -> mechanical contact/release -> tine vibration + audio`

## Current v1 editor scope

The first editor is intentionally bounded to the current eight-note comb:

- C4
- D4
- E4
- F4
- G4
- A4
- B4
- C5

It supports:

- selecting a visible note block;
- adding a note;
- deleting the selected note;
- changing pitch within the current comb;
- changing start beat;
- changing duration;
- preserving the last valid TuneDocument when a numeric input is temporarily invalid;
- editing a clone of the selected preset rather than mutating the shipped public-domain preset data.

A later compatibility/Auto Fit lane is responsible for arbitrary pitches, denser polyphony and mechanical conflict resolution. The piano roll must not silently rewrite user-authored data merely because the current mechanism cannot play it.

## Runtime behavior

Selecting a shipped preset resets the editable draft from that preset.

The first successful piano-roll edit:

1. stops autoplay;
2. marks the runtime tune as edited;
3. recompiles the editable TuneDocument into mechanical NoteEvents;
4. remounts the mechanism so stale engaged-pin or tine-vibration state cannot survive the edit;
5. regenerates visible cylinder pins through the existing `compileTune` path.

There is no second audio schedule owned by the editor.

## UI / responsive behavior

- Compose is discoverable from the main page.
- The editor is collapsible so the 3D mechanism remains the primary view.
- The note grid may scroll inside its own horizontal viewport; it must not cause page-level horizontal overflow.
- Selected-note controls must remain usable on narrow/mobile layouts.
- EN and JA copy must remain catalog-parity checked.

## Acceptance gate

Step 13 is complete only when:

1. TuneDocument edit operations have unit coverage;
2. invalid edits cannot replace the last valid document;
3. the main page can open the Piano Roll;
4. adding/editing/removing a note updates the editable TuneDocument;
5. an edit returns through TuneDocument -> NoteEvent -> `compileTune` rather than a separate playback path;
6. playback still works after an edit;
7. desktop and mobile Chromium runtime tests cover the editor;
8. opening the editor does not introduce page-level horizontal overflow;
9. EN/JA user-facing copy remains in parity;
10. existing preset selection, Customize, 3D view and mechanical causality remain green.

## Deferred from this step

- on-screen keyboard recording;
- computer-keyboard recording;
- MIDI import/export;
- microphone/audio-file input;
- arbitrary chromatic pitch ranges beyond the current comb;
- drag-to-resize/drag-to-move gestures beyond the current explicit controls;
- undo/redo history;
- project save/import;
- advanced mechanical conflict feedback.

Those remain later numbered roadmap steps unless the roadmap is explicitly changed.
