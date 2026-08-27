# Music Box v1

## Goal

Build a browser-based, hand-cranked cylinder music box whose core instrument is generated from code and whose visible mechanism drives playback.

This is not a music-box-themed player. Cylinder layout, pin/tine engagement, tine deformation, release, vibration and sound must share the same mechanical state.

The primary page must also be understandable to a first-time user who does not already know how a mechanical music box works.

## Vertical-slice acceptance criteria

- no external 3D model is required,
- base, crank, cylinder, pins and comb/tines are generated in code,
- tune events generate physical pin positions,
- cylinder phase is the authoritative playback state,
- pin/tine engagement is derived from explicit 3D geometry rather than a detached playback timer,
- engagement produces a mechanically derived deflection amount for the corresponding tine,
- the affected tine visibly bends/deflects while the pin is engaging it,
- leaving engagement emits exactly one release/pluck event for that pin pass,
- the same release/pluck event starts visible free vibration and audible output,
- each tine visibly decays after release,
- one full revolution produces one release/pluck event per configured pin across materially different sampling rates,
- crank, visible gears and cylinder derive from one drive state,
- the user can rotate the 3D crank directly with pointer/touch input,
- manual crank movement uses the same drive/contact/deflection/release/audio path as automatic playback,
- selected mechanical parameters can be changed through customization controls and regenerate relevant geometry,
- customization controls cannot bypass `MusicBoxConfig` validation,
- camera orbit/zoom works and a reset view is available,
- speed can be changed without separating mechanism, vibration and sound,
- customization is directly discoverable and mobile controls use normal page flow,
- detailed operation/mechanism instructions are available from `How to use`,
- project background and inspiration/credits are available from `About`,
- English and Japanese use the same localization layer,
- repository verification runs typecheck, mechanism tests, production build and browser runtime checks.

## Mechanical motion quality

A real music-box tine is not visually static at the moment a pin produces a note. For v1, the browser model must make the causal sequence inspectable:

`pin approaches -> tine engages/deflects -> pin releases -> tine vibrates -> vibration decays`

Full rigid-body or material finite-element simulation is not required. A compact deterministic contact model is acceptable when all visible motion is derived from the same pin/cylinder geometry and release event used for sound.

Because real tine amplitudes can be too small to read at ordinary browser scale, a restrained visual amplification factor may be used. It must change only visible amplitude, never the event timing or which tine is moving.

## Visual/mechanical detail quality

The current primitive geometry is a functional baseline, not the final v1 presentation target. Before v1 completion:

- the comb should read as a mechanically plausible rooted assembly rather than disconnected floating bars,
- cylinder ends/shaft/supports and pins should read as connected machine parts,
- gears, shafts, bearings/supports and crank connections should become mechanically convincing,
- materials/lighting should distinguish wood, steel/brass-like parts, pins and tines without obscuring contact,
- the default/reset inspection view should show the mechanism clearly, while orbit/zoom allows close contact inspection.

## Primary-page copy rule

The primary music-box page stays concise and task-oriented. Detailed instructions belong on `How to use`; implementation philosophy and inspiration/credits belong on `About`. `Customize` / `カスタマイズ` remains the user-facing name for the configurable mechanism section.

## Customization scope

The current exposed v1 controls are cylinder length, tine spacing, driver gear tooth count and cylinder gear tooth count. They flow into the same configuration used by geometry, drive kinematics and contact mapping. Invalid configurations are rejected while preserving the last valid mechanism.

Broad appearance customization and free-form tune composition are not part of the current completion gate.

## How to use scope

The dedicated How to use page explains Play/Stop, speed, orbit/zoom, Reset view, direct crank manipulation, Customize, language switching and the minimum mechanism background needed to understand cylinder, pins, comb/tines and gears. As the contact model improves, this page must describe the visible deflection/release/vibration sequence accurately.

## About / credits scope

The About page contains project purpose, mechanical-causality philosophy and inspiration/credits. External inspiration that did not contribute copied code/assets is credited with `Inspired by` wording. The current verified inspiration reference is the supplied McGreenBeats X post.

## Audio quality scope

- every audible tine sound is triggered by the mechanical release/pluck event,
- restrained contact/mechanical noise may be derived from the same event,
- no independent audio sequencer, look-ahead note scheduler or decorative timer may decide when notes occur,
- v1 synthesis may use a compact procedural model rather than sampled recordings.

## Language scope

English is the default v1 UI locale and Japanese is the first additional locale. New primary-page, Customize, How to use and About copy must be added to both catalogs together.

## Current finishing schedule

1. Synchronize ROADMAP/spec/checklist so tine engagement, deflection, release, vibration and geometry realism are explicit completion requirements.
2. Replace boolean-only contact with an engagement state that includes mechanically derived deflection.
3. Render tine deflection from a rooted comb/tine pivot while the pin remains engaged.
4. Emit release/pluck on engagement exit and drive both free vibration and audio from it.
5. Tune visual amplification so the motion remains legible on desktop/mobile without inventing timing.
6. Improve comb, cylinder, pin, shaft and support geometry.
7. Improve gears, crank and supporting mechanical connections.
8. Improve materials and lighting while preserving inspectability.
9. Refine default/reset camera and close inspection behavior.
10. Lock the causal chain with mechanism regression tests.
11. Extend desktop/mobile browser gates for the revised mechanism and existing information architecture/localization.
12. Publish to GitHub Pages.
13. Perform real-device display/interaction checks.
14. Perform Play/audio/speed/manual-crank/performance checks.
15. Apply only defects/polish required by those checks.
16. Mark Music Box v1 complete only after all gates pass.

## Scope rule

No additional instrument work is part of this v1 plan. Music-box completion has priority over any generic framework or expansion work.
