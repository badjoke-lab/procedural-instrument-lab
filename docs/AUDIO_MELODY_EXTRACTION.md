# Audio melody extraction

Roadmap step 21 converts a user-selected local audio file into editable melody candidates.

## Boundary

The selected `File` remains local/in-browser. Analysis begins only after an explicit user action. The source file is decoded locally and must never be uploaded, embedded into TuneDocument/project/share state, or used as an alternate music-box playback source.

The required path is:

`local audio File -> local decode -> monophonic pitch/timing analysis -> editable TuneDocument -> existing music-box compiler -> pin geometry -> mechanical runtime`

The file path reuses the same recognition core as microphone extraction so pitch/timing behavior does not diverge by input source.

## Initial scope

- optimize for clear monophonic material,
- preserve detected MIDI pitches in TuneDocument even when the current comb cannot preview them,
- convert timing against the current TuneDocument tempo,
- require explicit extraction before replacing editable tune data,
- keep the prior TuneDocument unchanged when decoding or recognition fails,
- keep source-file preview/discard independent from mechanical playback.

## Verification

Automated browser tests use synthetic/fake decoded audio with known frequency so no OS file picker or real codec is required in CI. They must prove successful local-file extraction, editable-note output, discard cleanup, failure-state TuneDocument preservation and EN/JA copy. Real file-picker and platform codec behavior remain in the minimal real-device gate.
