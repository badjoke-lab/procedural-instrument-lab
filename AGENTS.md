# AGENTS.md

These rules apply to automated agents and human contributors working in this repository.

## Read before changing code

Before implementation work, read the latest relevant repository documents on the branch being changed:

1. `docs/ARCHITECTURE.md`
2. `docs/ROADMAP.md`
3. the active instrument specification, currently `docs/MUSIC_BOX_V1.md`
4. `docs/PRESENTATION_CHECKLIST.md` for presentation/runtime work

Repository documents are the project source of truth. Do not rely on chat history, stale summaries, or assumptions when the repository contains a newer rule.

## Keep documentation synchronized

If a change alters product scope, architecture boundaries, runtime source-of-truth rules, mechanical behavior, acceptance criteria, development sequencing, information architecture, language/localization policy, composition/import/export/sharing boundaries, benchmark policy or instrument-expansion policy, update the relevant specification/roadmap in the same branch or pull request.

Do not silently change project direction in code only.

## Current scope

- The repository is instrument-neutral.
- The committed product is the procedural mechanical cylinder music box.
- Additional instruments are out of the current roadmap.
- Do not generalize music-box-specific code into a framework until actual reuse is demonstrated.

## Mechanical causality rule

For the music box, rendering must not decide playback timing. Mechanical state is authoritative.

The required visible causal chain is:

`tune/configuration -> pin geometry -> drive/cylinder state -> pin/tine engagement -> tine deflection -> release/pluck event -> tine vibration + audio`

A pin must not appear to pass through a tine while sound is emitted with no corresponding mechanical response. During engagement the affected tine visibly deflects from the same contact state. When the pin releases the tine, that release/pluck event drives both free vibration and audible output.

Do not replace this with detached timers, pre-scripted visual animation, independent audio scheduling, imported-source playback or export rendering that merely looks synchronized. Visual amplification is allowed only when it preserves the same mechanical event timing.

## Composition and import rule

Future piano-roll, keyboard, MIDI, microphone and audio-file inputs must converge on editable tune data before mechanical compilation. Imported audio is an input to melody recognition, not an alternate music-box player.

The direction is:

`input -> editable TuneDocument -> music-box fit/validation -> pin geometry -> mechanical runtime`

Source microphone/audio media should remain local/in-browser where practical and must never be silently uploaded, embedded into a project or included in a share URL.

## Benchmark-first verification rule

Do not make progress depend on high traffic, many real-user tune submissions or repeated manual device testing.

- Use synthetic tune fixtures to cover range, timing, density, simultaneous-note and known-invalid cases.
- Use controlled synthetic audio fixtures when recognition work begins.
- Add end-to-end benchmark/regression gates for conversion and mechanical invariants.
- Use benchmark reports plus real cylinder-music-box research to decide advanced Customize priorities.
- Reserve manual real-device checks for behavior automation cannot adequately prove, such as real audio startup, microphone/file picker/download behavior, touch gesture conflicts and practical performance.

## Information architecture rule

The primary instrument page stays concise and task-oriented. It should make main capabilities discoverable without requiring prior knowledge of music-box mechanics.

- Use simple user-facing language on the primary instrument page.
- Keep detailed operating instructions and mechanical explanations on `How to use`.
- Keep project background, implementation philosophy, inspiration/credits and relevant rights/provenance on `About`.
- `Customize` must be visibly discoverable.
- On narrow/mobile layouts, Customize controls remain normal document flow, not a fixed-height nested scroller.
- Future composition/import/export screens should be dedicated task surfaces instead of turning the primary instrument page into a dense control panel.

## UI language rule

- Default UI locale: English (`en`).
- First additional locale: Japanese (`ja`).
- User-facing strings go through the localization/message layer.
- Do not use bilingual labels as the normal UI.
- Code identifiers and mechanical parameter keys remain English and locale-independent.

## Branch and PR discipline

Prefer bounded branches/PRs that advance the next roadmap gate. A PR states which roadmap steps it advances and discloses remaining unverified behavior.

Do not mark a milestone complete solely because geometry renders or a data structure exists. Completion requires the corresponding current acceptance gate.

## Agent roles

Dedicated autonomous agents are not required merely to create more process. If agents are used, keep roles narrow:

- **mechanism agent**: geometry, kinematics, engagement/deflection/release and deterministic mechanical state,
- **audio agent**: synthesis/output driven by release/pluck events, never independent sequencing,
- **composition/import agent**: TuneDocument, editors, MIDI/mic/audio recognition and fit logic feeding the mechanical compiler,
- **UI/i18n agent**: information architecture, controls, message catalogs, accessibility, responsive behavior and locale behavior,
- **verification agent**: type/build/browser gates, synthetic fixtures, benchmarks and acceptance checks against current docs.

Agents must follow the same repository source-of-truth rules and must not invent a separate roadmap.
