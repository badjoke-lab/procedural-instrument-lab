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
- crank, visible gears and cylinder are derived from one drive state,
- the user can rotate the 3D crank directly with pointer/touch input,
- manual crank movement uses the same drive/contact/audio path as automatic playback,
- selected mechanical parameters can be changed through builder controls and regenerate the relevant geometry,
- builder controls cannot bypass `MusicBoxConfig` validation,
- camera orbit/zoom works and a reset view is available,
- speed can be changed without separating animation from sound,
- the default UI language is English,
- user-facing UI strings are routed through a localization-ready message layer rather than duplicated as hard-coded component text,
- repository verification runs typecheck, mechanism tests and production build.

## Builder scope

The initial builder exposes a bounded set of mechanically meaningful controls:

- cylinder length,
- tine spacing,
- driver gear tooth count,
- cylinder gear tooth count.

These controls are not cosmetic presets. Each value must flow into the same instrument configuration used by geometry, drive kinematics and contact mapping. Invalid configurations must be rejected rather than rendered silently.

Broad appearance customization is deferred until the mechanism and direct interaction are stable.

## Language scope

English is the required v1 UI locale. Japanese is planned as the first additional locale, but Japanese translation is not a mechanical-v1 completion blocker.

When Japanese is added, locale switching should use a compact control such as `EN / JA`; bilingual labels are not the default UI style.

## Next mechanism milestones

1. Complete direct crank interaction and the bounded mechanical builder controls, then verify them in CI.
2. Improve synthesis and restrained mechanical noise only after direct mechanical interaction is stable.
3. Improve enclosure/material detail and mobile interaction without hiding the inspectable mechanism.
4. Add the Japanese message catalog and locale switch after the core interaction surface is stable enough that translation keys will not churn unnecessarily.

## Scope rule

No second instrument work is required for v1. The repository name keeps expansion possible, but music-box completion has priority over generic framework work.
