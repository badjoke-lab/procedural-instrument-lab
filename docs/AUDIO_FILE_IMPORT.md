# Audio-file import

Roadmap step 20 establishes a local browser file-input boundary for user-owned audio. It does not yet transcribe the file into notes; melody extraction from imported files begins in step 21.

## Product boundary

- The user explicitly chooses a local audio file with the browser file picker.
- Practical browser audio formats are offered first: WAV, MP3, M4A/AAC, OGG and WebM where the current browser supports playback/decoding.
- The selected `File` remains local/in-browser and is exposed through a temporary object URL for preview during the current page session.
- The user can discard the selected file, which revokes the preview URL and clears the file input.
- Unsupported/non-audio file selections are rejected without changing TuneDocument or mechanism state.
- No selected source audio is uploaded, embedded into TuneDocument, written into a project file or included in a share URL.

## Separation from recognition and playback

Step 20 ends with a locally selected source file. Step 21 will decode suitable files and derive editable melody candidates.

The eventual path remains:

`local audio file -> local decode/analysis -> melody candidates -> editable TuneDocument -> fit/validation -> pin geometry -> mechanical runtime`

The imported file and its preview must never become an alternate music-box playback scheduler. Preview is only a source-audio inspection affordance.

## Verification

Browser automation may use synthetic in-memory file selections to prove:

- the file chooser accepts the declared audio formats,
- the selected filename/status/preview appear locally,
- TuneDocument is unchanged by step 20 import alone,
- discard clears the preview,
- unsupported files are rejected,
- EN/JA UI and desktop/mobile layout remain usable.

A real OS file picker and practical browser codec behavior remain part of the minimal real-device gate because automation cannot fully prove platform-specific chooser/decoder support.
