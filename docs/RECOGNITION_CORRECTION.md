# Recognition correction

Roadmap step 22 adds a review boundary between microphone/audio recognition and the accepted editable tune.

## Required flow

`local source -> recognition -> candidate TuneDocument -> piano-roll correction -> explicit accept -> accepted TuneDocument -> fit/validation -> pin geometry -> mechanical runtime`

Recognition success must not immediately replace the accepted tune or regenerate cylinder pins. The recognized candidate is shown in the existing piano roll, where pitch, start beat, duration, add/remove operations and keyboard edits can be corrected before acceptance.

## Acceptance and discard

- `Accept recognized melody` promotes the current candidate to the accepted TuneDocument and only then allows the existing mechanical compiler path to regenerate pins.
- `Discard candidate` restores the previously accepted tune unchanged.
- Recognition failure leaves the accepted tune unchanged and does not open review state.
- MIDI import remains a direct editable-data import rather than a recognition candidate and clears any stale recognition review state.
- MIDI export exports the accepted TuneDocument, not an unaccepted recognition candidate.

## Source-media boundary

The microphone Blob or selected audio File remains temporary local source media. Review state contains note/timing data only. Source media never becomes music-box playback, pin geometry, project data or share state.

## Verification

Browser automation must prove that a recognized synthetic A4 candidate can be displayed, corrected in the piano roll, discarded without changing the accepted tune, and accepted only through an explicit action. It must also prove EN/JA review controls and retain the existing recognition-failure preservation gate.
