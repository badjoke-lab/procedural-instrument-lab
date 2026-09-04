# Real Cylinder Music Box Research

This document is the evidence base for Roadmap Step 44. It records real cylinder-music-box construction facts that may later justify new mechanism/customization parameters. It does **not** mean every historical feature should be implemented.

## Design conclusions for Procedural Instrument Lab

1. **Comb size must become a real design axis.** Real mechanisms span well beyond the current eight-note prototype. A current Reuge CH 3.72 uses a 72-note comb; a documented 1888 Jaccard mechanism has 93 comb teeth, 92 of them playing.
2. **Cylinder capacity is not just note range.** Current Reuge 72-note examples use more than 1,200 cylinder pins for three successive melodies. Cylinder dimensions, pin count/density and tune duration therefore need separate constraints.
3. **Bass tuning requires mass, not only tine length.** Historical combs use lead tuning weights under bass teeth to lower their resonant frequency.
4. **Damping is a first-class mechanism.** Cylinder boxes use wire dampers under many tooth tips, with lighter treble teeth sometimes using feather barbs. Damper strength varies with tooth/weight characteristics.
5. **Drive speed regulation is mechanically meaningful.** Historical examples use spring barrels and governors; documented compensated governors use a heavy flywheel and spring-loaded flyweights to smooth cylinder surface speed under varying load.
6. **Bedplate/base construction matters.** Documented mechanisms use forged or brass bases/bedplates; current 72-note Swiss movement listings also specify a solid brass bedplate. Comb bases can be brass and are machined to establish the comb height/angle relative to the cylinder.
7. **Case material is not a single cosmetic preset.** Current Reuge examples use walnut or stained oak, while historic boxes commonly use wooden cabinets. Case/body choices should remain distinct from mechanism metal choices.
8. **Interchangeable cylinders require a safe non-playing gap.** A documented Jaccard interchangeable-cylinder box aligns the comb with a break in cylinder pinning at tune end so the cylinder can be removed without damaging pins.

## Evidence

### Current 72-note Swiss cylinder movement

Reuge's current Auberson specification states:

- CH 3.72 movement,
- 72-note comb,
- one cylinder carrying three melodies in succession,
- more than 1,200 pins on the cylinder,
- 36 seconds per cycle,
- approximately 16 minutes of power reserve,
- walnut enclosure.

Reuge's Raya publishes the same 72-note / three-melody / 1,200+ pin / 36-second-cycle / ~16-minute movement facts with a stained-oak enclosure.

Sources:
- https://www.reuge.com/en/creations/traditionnelles/auberson
- https://www.reuge.com/en/creations/traditionnelles/raya

### Historical comb scale and interchangeable-cylinder drive

The Music Box Society International documents an 1888 Eugène Félix Jaccard mechanism with:

- 93 comb teeth, 92 playing,
- a forged bedplate,
- bass lead associated with the comb tuning,
- a double spring barrel and governor-controlled cylinder drive,
- interchangeable cylinders,
- a break in the cylinder pinning used to leave the comb clear when changing cylinders.

Source:
- https://mbsi.org/plaintextjournal/volume-67-no-3-may-june-2021/

### Comb tuning weights

MBSI defines tuning weights as lead weights attached beneath music-box comb teeth, especially in the bass, which lower vibration frequency. This is evidence that future tine customization cannot model pitch only by changing visible tine length.

Source:
- https://mbsi.org/glossary/?cat_id=57

### Dampers

MBSI's cylinder-box damper treatment describes curved wire dampers beneath tooth tips. Depending on tooth strength, wire dampers may extend from the bass through roughly one-half to three-quarters of the comb, with some remaining treble teeth using individual feather barbs. It also notes that damper wire strength varies with tooth/tuning-weight characteristics.

Source:
- https://mbsi.org/plaintextjournal/volume-68-no-5-september-october-2022/

### Governor and comb base construction

A documented restoration in MBSI describes a compensated governor using a heavy flywheel and spring-loaded flyweights to smooth cylinder surface speed under changing load. The same mechanism used tuning leads on combs soldered to original brass comb bases, with the bases machined for the required height and upward angle toward the pinned cylinder.

Source:
- https://mbsi.org/plaintextjournal/volume-70-no-1-january-february-2024/

### Cylinder construction

MBSI's glossary describes a musical-box cylinder as thin brass, about 0.5 mm, with tapered program pins driven through it and retained with sealing cement. It also notes internal zinc or brass cylinder separators used to maintain roundness.

Source:
- https://mbsi.org/glossary/?cat_id=40

### Spring barrel material

MBSI defines the spring barrel as the housing for the mainspring and notes that cylinder musical boxes usually use brass spring barrels.

Source:
- https://mbsi.org/glossary/?cat_id=56

### Modern bedplate example

A current/old-stock Swiss Reuge/Romance 72-note mechanism listing specifies a solid brass bedplate and reports roughly ten minutes of running time when fully wound. This is useful as a modern construction cross-check, but manufacturer/source documentation above should take precedence where facts conflict between models.

Source:
- https://www.musichouseshop.com/store/Movement72note.html

## Implementation implications

The next customization work should not expose arbitrary sliders first. Step 45 should compare the existing benchmark requirement report against evidence-backed mechanism families. Candidate parameters to evaluate are:

- comb note count / playable pitch set,
- cylinder length and radius,
- pin count/density budget and safe change gap,
- tine length/thickness/mass or tuning weight,
- damper type/strength,
- spring drive reserve and governor behavior,
- comb-base/bedplate material and geometry,
- case material/resonance boundary.

The current eight-note hand-crank mechanism remains the v1 baseline until benchmark analysis shows which real mechanism variants materially improve playable coverage without breaking mechanical causality.
