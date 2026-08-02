# Thornton WTP Operator Simulator

A browser-based educational water-treatment operator simulation inspired by publicly available information about water treatment operations in Thornton, Colorado.

## Status

Current game version: **V16 — Interactive HMI**

V16 adds a true Home screen, browser save/resume, targeted training scenarios, animated SCADA-style tanks/valves/pumps, and live schematic status tied to the simulation.

## V16 highlights

- Home screen with **Start New Shift**, **Resume Shift**, and **Scenario**
- Browser localStorage save/resume for an in-progress shift
- Targeted scenario modes:
  - Source-water challenge
  - Chemical / analyzer challenge
  - Filter / backwash challenge
  - Distribution challenge
  - PFAS GAC challenge
  - Randomized shift
- Interactive generalized SCADA schematics on treatment, filters, PFAS, chemicals, distribution, tanks, and pump-station pages
- Animated valve states: **OPEN / CLOSED / MOVING / FAULT**
- Backwash valves follow the generic automatic sequence and actuator-fault model
- Chemical feed-pump symbols react to feed-system events
- Distribution pump symbols react to RUN / OFF / TRIP states
- Tank graphics track live modeled storage levels
- PRV schematic changes state when the modeled pressure-control condition becomes abnormal
- Clickable generalized training valves can be inspected and visually commanded without representing actual Thornton valve tags or SOPs

## Existing simulation systems

- 12-hour shift with randomized handoff conditions
- 30 simulated seconds or 1 simulated minute per real second
- raw-water turbidity / TOC / source-blend changes
- dynamic pH and alkalinity
- operator-adjustable caustic trim
- ferric, ozone, chlorine, ammonia, and caustic feed systems
- lab analysis including pH and alkalinity
- six biofilters with realistic staggered runs
- detailed generic automatic filter backwash sequence
- actuator/position-feedback failures
- modeled 430,000-gallon backwash-supply basin and filtered-water makeup
- distribution demand, tanks, pressure zones, pumps, and PRVs
- future-state PFAS GAC treatment and laboratory-result workflow
- routine rounds, lab checks, inventories, housekeeping, maintenance coordination, and turnover
- incident/alarm diagnosis and response scoring

## GitHub Pages

The playable version is published from the repository root with GitHub Pages.

## Important disclaimer

This is an **independent educational simulation**. It is **not affiliated with, endorsed by, or an official product of the City of Thornton, Colorado**.

The simulator intentionally does not reproduce actual PLC/RTU/SCADA logic, real valve or instrument tags, exact alarm/trip setpoints, actual pump curves, control-system architecture, infrastructure locations, security details, or real operating SOPs.

The graphical schematics in V16 are generalized HMI training graphics, not Thornton P&IDs or actual SCADA screens. Randomized values, incident frequencies, chemistry coefficients, valve commands, and simulation timing are gameplay assumptions.

Do not use this simulator as an operating procedure, regulatory reference, or substitute for plant-specific training.

## Project layout

```text
.
├── index.html
├── README.md
├── .nojekyll
├── app/
│   ├── patch-v12.js
│   ├── patch-v13.js
│   ├── patch-v14.js
│   ├── patch-v16.js
│   └── parts/
│       ├── part-00.txt
│       └── ... part-09.txt
└── docs/
    ├── REALISM_BOUNDARIES.md
    └── VERSION_HISTORY.md
```
