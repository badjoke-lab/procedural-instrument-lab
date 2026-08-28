# Microphone recording

Roadmap step 18 establishes local microphone capture. It does not yet recognize notes.

## Product boundary

- Microphone permission is requested only after an explicit user action.
- Capture uses browser `getUserMedia({ audio: true })` and `MediaRecorder` where available.
- The recorded clip remains a local browser Blob/object URL for preview during the current page session.
- No microphone media is uploaded, embedded into TuneDocument, written into a project file or included in a share URL.
- Stopping, failing, discarding or leaving the recorder must release active media tracks.
- The user can preview the captured clip and discard/re-record it.

## Separation from melody recognition

Step 18 ends at a captured local audio clip. Step 19 will analyze suitable monophonic recordings into editable TuneDocument note candidates.

Do not make the captured recording an alternate music-box player. The eventual path remains:

`microphone capture -> local audio -> melody recognition -> editable TuneDocument -> fit/validation -> pin geometry -> mechanical runtime`

## Verification

Automated browser coverage may fake `getUserMedia` and `MediaRecorder` to prove UI/state/privacy lifecycle without requiring CI hardware or permission prompts. It must verify that permission is not requested before the explicit Start action, stopping releases the stream, a local preview is created, and discard removes it.

Real microphone permission, device capture quality and platform-specific MediaRecorder behavior remain a minimal real-device gate because browser automation cannot prove physical microphone behavior.
