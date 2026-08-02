# Thornton WTP Operator Simulator

A browser-based educational water-treatment operator simulation inspired by publicly available information about water treatment operations in Thornton, Colorado.

## Status

Current game version: **V13 — pH, Alkalinity & Caustic Control**

The simulator models a 12-hour operator shift with treatment-process control, filters and backwashing, chemical feed, distribution monitoring, alarms, PFAS GAC future-state training, routine operator workload, randomized shift handoffs, and dynamic pH/alkalinity chemistry.

## V13 pH / alkalinity chemistry

V13 adds dynamic source-water pH and alkalinity plus an operator-adjustable caustic-soda trim dose.

- Raw-water pH and alkalinity vary with source blend, time, randomized handoff conditions, and source-chemistry incidents.
- Ferric coagulation consumes alkalinity in the game model.
- Post-coagulation alkalinity is tracked separately from raw and finished alkalinity.
- The former direct pH-target slider is replaced by a **caustic dose** control in mg/L.
- Caustic dose is also displayed as lb/MG, calculated lb/day, simulated gal/hr, and metering-pump output.
- Finished pH responds to caustic differently depending on source alkalinity / buffer capacity.
- Lab checks now include raw pH, raw alkalinity, post-coag alkalinity, finished pH, finished alkalinity, and caustic dose.
- New conditions include source alkalinity/pH shifts, caustic-feed deviations, low/high finished pH, and low finished alkalinity.

Thornton public planning documents describe caustic soda for pH adjustment at TWTP and identify alkalinity as an important treatment/stability parameter. The game chemistry is generalized and does not reproduce Thornton's actual dose ranges, injection-point selection, pump calibration, control logic, or alarm setpoints.

## Simulation speed

The speed control has two settings:

- **30 sec/s** — 1 real second advances the game by 30 simulated seconds.
- **1 min/s** — 1 real second advances the game by 1 simulated minute.

## Randomized shifts

Each new shift/reload generates a randomized starting handoff rather than resetting to one perfect baseline.

Starting conditions can vary across production, source blend, raw/process water quality, pH/alkalinity, chemical setpoints, city demand, storage, pressure zones, backwash-basin level, filter run age/headloss/turbidity, and future-state PFAS GAC status.

Most shifts inherit zero to two minor imperfect conditions from the prior shift. Each shift receives a randomized subset of about **8–11 incident types** from the larger incident catalog, and a shift may begin with an active incident already present at turnover.

## Major features

- SCADA-style multi-page operator interface
- 12-hour simulated shift
- randomized shift handoffs and incident pools
- dynamic raw-water pH and alkalinity
- adjustable caustic-soda trim
- ferric/alkalinity interaction
- lab pH and alkalinity analysis
- coagulant, ozone, chlorine, ammonia, and caustic controls
- chemical dose displays in mg/L, lb/MG, lb/day, and simulated feed-rate units
- six biofilters with staggered filter runs
- multi-step automatic backwash simulation
- backwash-supply basin inventory and refill from filtered water
- generic valve/actuator command-versus-feedback failures during backwash
- distribution demand, storage, pressure-zone, pump-station, and PRV monitoring
- main-break, fire-flow, pump-trip, communications, power, and process incidents
- alarm acknowledgement plus operator-response decision workflow
- future-state PFAS granular activated carbon (GAC) treatment page
- routine rounds, lab checks, chemical inventory, housekeeping, maintenance coordination, and shift turnover
- water-quality, efficiency, alarm-response, distribution, and routine-operations scoring

## GitHub Pages

This project is designed to work as a static GitHub Pages site from the repository root.

To enable it: **Settings → Pages → Deploy from a branch → `main` → `/(root)`**.

## Important disclaimer

This is an **independent educational simulation**. It is **not affiliated with, endorsed by, or an official product of the City of Thornton, Colorado**.

The simulation intentionally does **not** reproduce actual PLC/RTU/SCADA logic, exact alarm/trip setpoints, real valve or instrument tags, real backwash control logic, actual pump curves, infrastructure locations, communications/security details, or real operating SOPs.

Randomized values, chemistry coefficients, incident frequencies, and simulation timing are gameplay assumptions, not City of Thornton operational data.

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
│   └── parts/
│       ├── part-00.txt
│       └── ... part-09.txt
└── docs/
    ├── REALISM_BOUNDARIES.md
    └── VERSION_HISTORY.md
```
