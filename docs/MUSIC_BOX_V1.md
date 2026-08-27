# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose core instrument is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. The cylinder layout, contact events, tine motion and sound must share the same mechanical state.

The primary page must also be understandable to a first-time user who does not already know how a mechanical music box works.

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
- selected mechanical parameters can be changed through customization controls and regenerate the relevant geometry,
- customization controls cannot bypass `MusicBoxConfig` validation,
- camera orbit/zoom works and a reset view is available,
- speed can be changed without separating animation from sound,
- the primary page exposes customization clearly enough that it is discoverable without scrolling inside a hidden/nested panel,
- narrow/mobile layouts put customization controls in normal page flow rather than a fixed-height nested scrolling region,
- detailed operation/mechanism instructions are available from a dedicated `How to use` page instead of making the primary page verbose,
- project background and inspiration/credits are available from a dedicated `About` page,
- the default UI language is English,
- Japanese is supported through the same message layer,
- repository verification runs typecheck, mechanism tests, production build and browser runtime checks.

## Primary-page copy rule

The primary music-box page should be concise and task-oriented.

- Explain the product in one short, plain-language line.
- Do not require terms such as `pin contact`, `tine`, `drive state` or `mechanical causality` to understand the main controls.
- Link to `How to use` for detailed instructions and beginner-oriented mechanism explanation.
- Link to `About` for implementation philosophy and inspiration/credits.
- Use `Customize` / `カスタマイズ` as the primary user-facing name for the configurable mechanism section rather than `Builder` / `ビルダー`.

## Customization scope

The current exposed v1 customization controls are a bounded set of mechanically meaningful parameters:

- cylinder length,
- tine spacing,
- driver gear tooth count,
- cylinder gear tooth count.

These controls are not cosmetic presets. Each value must flow into the same instrument configuration used by geometry, drive kinematics and contact mapping. Invalid configurations must be rejected rather than rendered silently.

Broad appearance customization and free-form tune composition are not part of the current completion gate.

## How to use scope

The dedicated How to use page should explain, in ordinary language:

- Play / Stop,
- speed control,
- orbit/rotate and zoom,
- Reset view,
- direct crank manipulation,
- Customize controls,
- language switching,
- the minimum mechanism background needed to understand cylinder, pins, comb/tines and gears.

The explanation may be detailed there; the primary page should remain simple.

## About / credits scope

The About page should contain:

- what the project is trying to demonstrate,
- the rule that sound/animation remain downstream of mechanical contact,
- project/repository context where useful,
- inspiration/credits.

When an external work inspired the interaction/presentation concept but code/assets were not copied, use `Inspired by` wording rather than implying derivation. The current inspiration reference is the McGreenBeats X post supplied for the project; link the post directly. Add another source/repository only when its relationship to that inspiration is verified.

## Audio quality scope

Phase 5 may improve timbre, but it must not change the source of playback timing.

- every audible tine sound remains triggered by the same mechanical contact-entry event used for visible tine vibration,
- restrained mechanical click/noise may be emitted by that same pluck event,
- no independent audio sequencer, look-ahead note scheduler or decorative timer may decide when notes occur,
- v1 synthesis may use a compact procedural model rather than sampled recordings,
- the initial quality model uses a fundamental plus quieter upper partials with shorter decays and a short filtered contact transient,
- music-box-specific synthesis remains under `src/instruments/music-box/` until another instrument proves a shared audio abstraction is useful.

## Language scope

English is the default v1 UI locale. Japanese is the first additional locale. All new primary-page, Customize, How to use and About copy must be added to both catalogs together.

Locale switching should use a compact control such as `EN / JA`; bilingual labels are not the default UI style.

## Current finishing milestones

1. Fix mobile customization discoverability and remove nested scrolling.
2. Add concise primary-page capability copy plus `Customize`, `How to use` and `About` navigation.
3. Add the localized How to use and About pages, including inspiration credit.
4. Extend browser tests for the new navigation/mobile-flow behavior.
5. Publish to GitHub Pages and re-check the revised UI on a real mobile device.
6. Complete the remaining Play/audio/crank/performance real-device checks.

## Scope rule

No additional instrument work is part of this v1 plan. Music-box completion has priority over any generic framework or expansion work.
