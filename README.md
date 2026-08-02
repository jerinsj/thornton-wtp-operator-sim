# Thornton WTP Operator Simulator

A browser-based educational water-treatment operator simulation inspired by publicly available information about water treatment operations in Thornton, Colorado.

## Status

Current game version: **V12 — Randomized Shifts / Real-Time Pace**

The simulator models a 12-hour operator shift with treatment-process control, filters and backwashing, chemical feed, distribution monitoring, alarms, PFAS GAC future-state training, routine operator workload, and randomized shift handoffs.

## V12 simulation speed

The old 1–10 simulated-minutes-per-real-second range has been removed.

The speed control now has two settings:

- **30 sec/s** — 1 real second advances the game by 30 simulated seconds.
- **1 min/s** — 1 real second advances the game by 1 simulated minute.

This gives the player more time to navigate SCADA pages, recognize alarms, diagnose conditions, and make operating decisions.

## Randomized shifts

Each new shift/reload generates a randomized starting handoff rather than resetting to one perfect baseline.

Starting conditions can vary across production, source blend, raw/process water quality, chemical setpoints, city demand, storage, pressure zones, backwash-basin level, filter run age/headloss/turbidity, and future-state PFAS GAC status.

Most shifts inherit zero to two minor imperfect conditions from the prior shift. Examples include a filter already approaching backwash review, a recovering backwash basin, marginal disinfectant residual, elevated raw turbidity, reduced storage, or PFAS GAC media in a watch range.

Each shift receives a randomized subset of about **8–11 incident types** from the larger incident catalog. Once an incident type occurs, it is removed from that shift's remaining pool to reduce repetition. A shift may also begin with an active incident already present at turnover.

## Major features

- SCADA-style multi-page operator interface
- 12-hour simulated shift
- randomized shift handoffs and incident pools
- raw-water and treatment-process changes
- coagulant, ozone, chlorine, ammonia, and pH controls
- chemical dose displays in mg/L, lb/MG, lb/day, and simulated feed-rate units
- six biofilters with staggered filter runs
- multi-step automatic backwash simulation
- backwash-supply basin inventory and refill from filtered water
- generic valve/actuator command-versus-feedback failures during backwash
- distribution demand, storage, pressure-zone, pump-station, and PRV monitoring
- main-break, fire-flow, pump-trip, communications, power, and process incidents
- alarm acknowledgement plus operator-response decision workflow
- future-state PFAS granular activated carbon (GAC) treatment page
- PFAS laboratory-result workflow in parts per trillion rather than a fake continuous analyzer
- routine rounds, lab checks, chemical inventory, housekeeping, maintenance coordination, and shift turnover
- water-quality, efficiency, alarm-response, distribution, and routine-operations scoring

## GitHub Pages

This project is designed to work as a static GitHub Pages site from the repository root.

To enable it: **Settings → Pages → Deploy from a branch → `main` → `/(root)`**.

## Important disclaimer

This is an **independent educational simulation**. It is **not affiliated with, endorsed by, or an official product of the City of Thornton, Colorado**.

The simulation intentionally does **not** reproduce actual PLC/RTU/SCADA logic, exact alarm/trip setpoints, real valve or instrument tags, real backwash control logic, actual pump curves, infrastructure locations, communications/security details, or real operating SOPs.

Randomized values, incident frequencies, and simulation timing are gameplay assumptions, not City of Thornton operational data.

Do not use this simulator as an operating procedure, regulatory reference, or substitute for plant-specific training.

## Project layout

```text
.
├── index.html
├── README.md
├── .nojekyll
├── app/
│   ├── patch-v12.js
│   └── parts/
│       ├── part-00.txt
│       └── ... part-09.txt
└── docs/
    ├── REALISM_BOUNDARIES.md
    └── VERSION_HISTORY.md
```
