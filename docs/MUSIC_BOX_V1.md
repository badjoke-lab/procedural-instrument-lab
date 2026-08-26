# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose core instrument is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. The cylinder layout, contact events, tine motion and sound must share the same mechanical state.

## Vertical-slice acceptance criteria

- no external 3D model is required,
- base, crank, cylinder, pins and comb/tines are generated in code,
- tune events generate physical pin positions,
- cylinder phase is the authoritative playback state,
- pin contact triggers the corresponding tine,
- the same contact event triggers audible output,
- each tine visibly decays after being plucked,
- camera orbit/zoom works,
- speed can be changed without separating animation from sound,
- the default UI language is English,
- user-facing UI strings are routed through a localization-ready message layer rather than duplicated as hard-coded component text.

## Language scope

English is the required v1 UI locale. Japanese is planned as the first additional locale, but Japanese translation is not a mechanical-v1 completion blocker.

When Japanese is added, locale switching should use a compact control such as `EN / JA`; bilingual labels are not the default UI style.

## Next mechanism milestones

1. Replace the simplified angular contact window with explicit cylinder/comb contact geometry.
2. Add a visible gear train derived from a single crank/cylinder state.
3. Expand from the demonstration note set to a configurable comb.
4. Regenerate the cylinder when tune or mechanical dimensions change.
5. Add direct crank interaction.
6. Improve synthesis and mechanical noise only after causal mechanism correctness is stable.
7. Add the Japanese message catalog and locale switch after the core interaction surface is stable enough that translation keys will not churn unnecessarily.

## Scope rule

No second instrument work is required for v1. The repository name keeps expansion possible, but music-box completion has priority over generic framework work.
