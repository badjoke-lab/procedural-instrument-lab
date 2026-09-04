# Hosted Sharing Decision

## Decision

Music Box v1 will not add server-hosted project pages or project storage.

The supported sharing hierarchy is:

1. native `.musicbox.json` project files as the guaranteed server-free path,
2. compact URL-fragment sharing when the editable project state fits the explicit URL size budget,
3. no hosted upload fallback in v1.

This keeps sharing reconstructable without introducing a database, object storage, account system, upload endpoint or moderation surface.

## Why hosted sharing is deferred

The current server-free paths already cover the core user need: another person can receive editable tune/configuration state and reopen it locally. Hosted pages would add persistent user-controlled content and therefore create additional privacy, copyright, moderation, abuse, retention and operating-cost obligations.

There is not yet evidence that those obligations are justified by a product need that native project files and compact URLs cannot meet. Hosted sharing therefore remains deferred rather than partially implemented.

## Privacy and rights boundary

- Source microphone/audio files are never embedded in project files or share URLs.
- Source microphone/audio files must not be silently uploaded.
- A future hosted system must define persistence and deletion behavior before accepting uploads.
- A future hosted system must define copyright/abuse reporting and moderation scope before public project pages are enabled.
- A future hosted system must preserve the versioned Music Box Project validation boundary rather than accepting arbitrary client state.

## Reconsideration criteria

Hosted sharing may be reconsidered only when at least one concrete need cannot be met reasonably by native project-file sharing or compact URL fragments, and the proposed design has an explicit answer for all of the following:

- what is stored and for how long,
- whether accounts or anonymous ownership are required,
- deletion and recovery behavior,
- privacy implications,
- copyright/abuse/moderation handling,
- storage, bandwidth and operational cost,
- schema/version migration,
- failure behavior when the hosted service is unavailable.

Until those criteria are met, server-free sharing remains the product boundary.
