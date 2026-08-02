# Thornton WTP Operator Simulator

A browser-based educational water-treatment operator simulation inspired by publicly available information about water treatment operations in Thornton, Colorado.

## Status

Current game version: **V11 — Randomized Shifts**

The simulator models a 12-hour operator shift with treatment-process control, filters and backwashing, chemical feed, distribution monitoring, alarms, PFAS GAC future-state training, routine operator workload, and randomized shift handoffs.

## V11: every shift is different

Each new shift/reload now generates a randomized starting handoff rather than resetting to one perfect baseline.

Starting conditions can vary across:

- TWTP production and source blend
- raw-water turbidity, TOC, and odor loading
- settled and filtered turbidity
- finished disinfectant residual and pH
- chemical-control setpoints
- city demand and other-system supply
- potable-storage levels and pressure-zone conditions
- backwash-supply basin level
- individual filter run age, headloss, and turbidity
- future-state PFAS GAC headloss, media service, and sample age

Most shifts inherit one or two minor imperfect conditions from the prior shift, while some begin relatively stable. Examples include a filter already approaching backwash review, a recovering backwash basin, marginal disinfectant residual, elevated raw turbidity, reduced storage, or PFAS GAC media already in a watch range.

The overall game contains a larger incident catalog, but each shift receives a **randomized subset of about 8–11 incident types** drawn from treatment/process, equipment/instrumentation, distribution, and PFAS categories. Once an incident type occurs, it is removed from that shift's remaining incident pool to reduce repetitive events. A shift may also begin with an active incident already present at turnover.

## Major features

- SCADA-style multi-page operator interface
- 12-hour simulated shift
- randomized shift profiles and handoff conditions
- shift-specific randomized incident pools
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

## Run locally

The GitHub build is packaged for HTTP/static hosting. The easiest options are GitHub Pages or another simple local static web server.

## GitHub Pages

This project is designed to work as a static GitHub Pages site from the repository root.

To enable it: **Settings → Pages → Deploy from a branch → `main` → `/(root)`**.

## Important disclaimer

This is an **independent educational simulation**. It is **not affiliated with, endorsed by, or an official product of the City of Thornton, Colorado**.

The simulation uses public, high-level treatment concepts as inspiration, but it intentionally does **not** reproduce actual control-system configuration or operationally sensitive details.

The following are simplified, fictionalized, or intentionally omitted:

- actual PLC / RTU / SCADA logic
- exact alarm and trip setpoints
- real valve or instrument tags
- exact backwash sequence logic and timing
- actual pump curves and control strategies
- exact tank, station, valve, or infrastructure locations
- credentials, communications architecture, or cybersecurity details
- real operating SOPs and emergency procedures
- actual operating-condition distributions or alarm frequencies
- final PFAS facility control details that are not publicly established

Randomized starting values and incident frequencies are training-game assumptions, not City of Thornton operational data.

Do not use this simulator as an operating procedure, regulatory reference, or substitute for plant-specific training.

## Project layout

```text
.
├── index.html
├── README.md
├── .nojekyll
├── app/
│   ├── v11-randomized-shifts.js
│   └── parts/
│       ├── part-00.txt
│       └── ... part-09.txt
└── docs/
    ├── REALISM_BOUNDARIES.md
    └── VERSION_HISTORY.md
```

## Development direction

Future versions can further modularize the application, add trend-history screens, scheduled maintenance, additional shift scenarios, and more educational explanations while preserving the project's infrastructure-safety boundaries.
