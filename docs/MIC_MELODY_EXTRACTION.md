# Microphone melody extraction

Roadmap step 19 converts a completed local microphone recording into editable melody candidates. It is deliberately limited to practical monophonic material first.

## Source-of-truth boundary

The microphone recording is analysis input only. It is not a music-box playback source and does not schedule mechanical or audio events.

The required path remains:

`microphone recording -> local decoded PCM -> pitch/timing candidates -> editable TuneDocument -> later fit/validation -> pin geometry -> mechanical runtime`

Extraction must never write pins directly and must never make the original recording an alternate music-box player.

## Initial analysis model

- Decode the locally held recording with browser `AudioContext.decodeAudioData`.
- Mix decoded channels to mono for analysis.
- Analyze overlapping short frames locally in the browser.
- Use autocorrelation to estimate a stable fundamental frequency within a bounded practical range.
- Convert stable frequencies to MIDI pitch candidates.
- Group contiguous equal-pitch frames into note candidates and preserve their approximate start/duration timing.
- Convert seconds to the current TuneDocument tempo and quantize candidates to quarter-beat resolution for the first implementation.

This first model is intentionally optimized for humming, whistling and single-note instruments. Polyphonic recognition, source separation and production-grade transcription are not claimed.

## User-control boundary

Analysis occurs only after a recording exists and the user explicitly chooses `Extract melody` / `メロディーを抽出`.

A successful result becomes editable TuneDocument data. The user can then inspect or edit notes in the existing Piano Roll. Extraction failure leaves the existing TuneDocument unchanged and asks the user to retry with clearer monophonic material.

## Privacy

- Decoding and analysis are local/in-browser.
- No cloud speech/music/transcription API is used.
- Source microphone media is not uploaded.
- Source media is not automatically embedded in TuneDocument, future project files or share URLs.

## Verification

Unit tests use synthetic PCM with known frequencies/timing so pitch extraction can be checked without repeated real microphone recordings.

Browser automation may fake MediaRecorder and AudioContext decoding to prove the user-controlled path from local recording to editable TuneDocument candidates.

Actual microphone capture quality and platform codec/decoder behavior remain part of the minimal real-device gate. Later benchmark steps add broader synthetic-audio coverage for tempo, octave, silence and noise variants.
