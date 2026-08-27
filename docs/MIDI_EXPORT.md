# MIDI Export

This document defines Roadmap step 17 for the Music Box creator lane. Read it with `docs/TUNE_DOCUMENT.md`, `docs/MIDI_IMPORT.md`, `docs/ROADMAP.md`, `docs/MUSIC_BOX_V1.md` and `AGENTS.md`.

## Purpose

MIDI export is note-data interchange. It exports the current editable `TuneDocument`; it is not a second playback or rendering path.

The authoritative composition/runtime relationship remains:

`editable TuneDocument -> music-box fit/validation -> pin geometry -> mechanical runtime`

MIDI export is a derived file view of the TuneDocument and does not decide music-box note timing.

## Current export scope

The first export writes Standard MIDI File format 0 with one PPQ track.

It preserves:

- MIDI-compatible pitch (`0..127`), including pitches outside the current C4-C5 physical comb;
- `startBeat`;
- `durationBeats`;
- `tempoBpm` as a tempo meta event.

The default export resolution is 480 PPQ. Beat positions and durations are rounded to ticks at that resolution. Every exported note receives a positive duration of at least one tick.

## Current limitations

- TuneDocument v1 stores one tempo, so export writes one tempo at tick zero.
- Per-note velocity, channels, program changes, controllers, lyrics, markers and arbitrary source-MIDI metadata are not represented by TuneDocument v1 and therefore are not recreated.
- Importing a complex MIDI and exporting it again is a TuneDocument round trip, not a byte-for-byte MIDI preservation feature.
- Compatibility/Auto Fit remains a later stage. Export does not silently transpose or remove notes that the current physical music box cannot play.

## File behavior

The browser creates the `.mid` locally and downloads it. No server upload is required. The filename is derived from the editable tune title and sanitized for common filesystem-invalid characters.

## Acceptance gate

Step 17 is complete only when:

1. the encoder has unit coverage;
2. exported data can be parsed by the project's supported MIDI importer with pitch/timing/duration/tempo preserved within export resolution;
3. pitches outside the current comb survive export;
4. Compose exposes an EN/JA MIDI export control;
5. browser automation verifies a real `.mid` download whose file header is `MThd`;
6. desktop/mobile layouts keep the export control readable with no page-level horizontal overflow;
7. existing TuneDocument, import, editing and mechanical runtime gates remain green.
