# TuneDocument v1

`TuneDocument` is the canonical editable melody representation for the Music Box creation pipeline.

It exists between input/editing features and the mechanical compiler:

`preset / piano roll / keyboard / MIDI / microphone / audio recognition -> TuneDocument -> fit/validation -> mechanical NoteEvent -> cylinder pins`

No input path may bypass `TuneDocument` by scheduling independent playback. The existing mechanical causality chain remains authoritative after conversion to `NoteEvent`.

## Schema

Version 1 contains:

- `version`: integer schema version, currently `1`.
- `id`: stable document identifier.
- `title`: user-facing document title. Localization of shipped preset labels remains preset metadata; user-created documents store their own title.
- `tempoBpm`: positive tempo metadata used by editing, performance input, MIDI and later export.
- `lengthBeats`: positive editable timeline length. One accepted document is mapped across one normalized cylinder revolution by the current compiler boundary.
- `notes[]`: editable note objects with stable `id`, MIDI-compatible integer `pitch` (`0..127`), `startBeat`, and positive `durationBeats`.

Notes must start at or after beat zero and must end within `lengthBeats`. Note IDs must be unique inside a document.

## Why beats are canonical

Editable composition, MIDI, keyboard recording and recognized melody all need a timeline that preserves musical timing without tying source data to cylinder angle. Beats provide that common editing coordinate. Cylinder normalization happens only at the TuneDocument-to-mechanical boundary.

## Duration rule

`durationBeats` is retained even though the current cylinder mechanism triggers a pluck from note onset and does not yet mechanically model arbitrary note sustain. Duration is required for future editing, MIDI interchange, recognition correction, fit analysis and articulation work. The current conversion intentionally maps onset to a pin while preserving duration in the source document.

## Preset rule

Shipped `TunePreset` entries are backed by `TuneDocument`; their legacy mechanical `events` field is derived from the document for the current runtime. Preset note events must not become a second hand-authored source of truth.

## Validation boundary

`validateTuneDocument` rejects malformed documents before mechanical compilation. Mechanical compatibility such as comb range, pin density and simultaneous-note constraints remains a later compatibility/Auto Fit stage; TuneDocument itself may validly contain music the current mechanism cannot yet play.

This distinction is required so imported or composed music is not destructively changed merely to make parsing succeed.

## Versioning and persistence

The schema is explicitly versioned from the beginning because step 32 will embed TuneDocument in the native Music Box Project format. Future schema changes must either remain backwards-readable or add an explicit migration path before old saved projects are claimed as supported.

## Privacy and rights

TuneDocument stores editable note/timing data, not microphone recordings or imported source audio. Future microphone/audio inputs must not silently embed or upload source media when producing a TuneDocument.
