# AGENTS.md

These rules apply to automated agents and human contributors working in this repository.

## Read before changing code

Before implementation work, read the latest relevant repository documents on the branch being changed:

1. `docs/ARCHITECTURE.md`
2. `docs/ROADMAP.md`
3. the active instrument specification, currently `docs/MUSIC_BOX_V1.md`

Repository documents are the project source of truth. Do not rely on chat history, stale summaries, or assumptions when the repository contains a newer rule.

## Keep documentation synchronized

If a change alters any of the following, update the relevant specification/roadmap in the same branch or pull request:

- product scope,
- architecture boundaries,
- runtime source-of-truth rules,
- mechanical behavior,
- acceptance criteria,
- development sequencing,
- language/localization policy,
- instrument-expansion policy.

Do not silently change project direction in code only.

## Current scope

- The repository is instrument-neutral.
- v1 is the procedural mechanical cylinder music box only.
- Additional instruments are optional future work.
- Do not generalize music-box-specific code into a framework until actual reuse is demonstrated by another instrument.

## Mechanical causality rule

For the music box, rendering must not decide playback timing. Mechanical state is authoritative.

The intended causal chain is:

`tune/configuration -> pin geometry -> drive/cylinder state -> contact -> pluck event -> tine animation + audio`

Do not replace this with detached timers, pre-scripted visual animation, or independent audio scheduling that merely looks synchronized.

## UI language rule

- Default UI locale: English (`en`).
- First planned additional locale: Japanese (`ja`).
- User-facing strings should go through the localization/message layer.
- Do not use bilingual labels as the normal UI.
- Code identifiers and mechanical parameter keys remain English and locale-independent.

## Branch and PR discipline

Prefer bounded branches/PRs that advance the next roadmap gate. A PR should state which roadmap phase/gate it advances and disclose any remaining unverified behavior.

Do not mark a mechanical milestone complete solely because geometry renders. Completion requires the corresponding behavior/acceptance gate in the current specification or roadmap.

## Agent roles

Dedicated autonomous agents are not required merely to create more process. If agents are used, use narrow roles:

- **mechanism agent**: geometry, kinematics, contact and deterministic mechanical state,
- **audio agent**: synthesis/output driven by pluck events, never independent sequencing,
- **UI/i18n agent**: controls, message catalogs, accessibility and locale behavior,
- **verification agent**: build/type checks and acceptance-gate checks against current docs.

Agents must follow the same repository source-of-truth rules and must not invent a separate roadmap.
