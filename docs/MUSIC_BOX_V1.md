# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose core instrument is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. The cylinder layout, contact events, tine motion and sound must share the same mechanical state.

## Vertical-slice acceptance criteria

- no external 3D model is required,
- base, crank, cylinder, pins and comb/tines are generated in code,
- tune events generate physical pin positions,
- cylinder phase is the authoritative playback state,
- pin contact is derived from explicit 3D pin-tip and tine-contact geometry rather than a detached playback timer,
- pin contact triggers the corresponding tine,
- the same contact-entry event triggers audible output,
- each tine visibly decays after being plucked,
- one full revolution produces one contact entry per configured pin across materially different sampling rates,
- camera orbit/zoom works,
- speed can be changed without separating animation from sound,
- the default UI language is English,
- user-facing UI strings are routed through a localization-ready message layer rather than duplicated as hard-coded component text,
- repository verification runs typecheck, mechanism tests and production build.

## Language scope

English is the required v1 UI locale. Japanese is planned as the first additional locale, but Japanese translation is not a mechanical-v1 completion blocker.

When Japanese is added, locale switching should use a compact control such as `EN / JA`; bilingual labels are not the default UI style.

## Next mechanism milestones

1. Complete and verify explicit cylinder-pin / tine contact geometry. The implementation exists on the active vertical-slice branch; CI must be green before this milestone is considered complete.
2. Add a visible gear train derived from a single crank/cylinder state.
3. Expand from the demonstration note set to a configurable comb.
4. Regenerate the cylinder when tune or mechanical dimensions change.
5. Add direct crank interaction.
6. Improve synthesis and mechanical noise only after causal mechanism correctness is stable.
7. Add the Japanese message catalog and locale switch after the core interaction surface is stable enough that translation keys will not churn unnecessarily.

## Scope rule

No second instrument work is required for v1. The repository name keeps expansion possible, but music-box completion has priority over generic framework work.
