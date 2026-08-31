# Pin Geometry Render Boundary

This bounded repair does not change music-box contact travel, tine rest position, release timing or visual acceptance criteria.

It removes duplicated pin placement math from the renderer. `pinRenderGeometry()` in the music-box mechanism module is now the source for the rendered pin stem center, spherical tip center and stem rotation. Contact resolution continues to consume the same radial pin-tip geometry through `pinTipWorldPosition()`.

The intent is structural: future fixes to pin geometry must not leave a second renderer-only polar calculation behind.

This change is not evidence that the remaining perceptual pin/tine/release mismatch is solved. Issue #10 remains open, and experimental PRs #35 and #36 remain rejected/unmerged.
