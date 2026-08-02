# Thornton WTP Operator Simulator

A browser-based educational water-treatment operator simulation inspired by publicly available information about water treatment operations in Thornton, Colorado.

## Status

Current game version: **V10 — Routine Shift Work**

The simulator models a 12-hour operator shift with treatment-process control, filters and backwashing, chemical feed, distribution monitoring, alarms, PFAS GAC future-state training, and routine operator workload.

## Major features

- SCADA-style multi-page operator interface
- 12-hour simulated shift
- Raw-water and treatment-process changes
- Coagulant, ozone, chlorine, ammonia, and pH controls
- Chemical dose displays in mg/L, lb/MG, lb/day, and simulated feed-rate units
- Six biofilters with staggered filter runs
- Multi-step automatic backwash simulation
- Backwash-supply basin inventory and refill from filtered water
- Generic valve/actuator command-versus-feedback failures during backwash
- Distribution demand, storage, pressure-zone, pump-station, and PRV monitoring
- Main-break, fire-flow, pump-trip, communications, power, and process incidents
- Alarm acknowledgement plus operator-response decision workflow
- Future-state PFAS granular activated carbon (GAC) treatment page
- PFAS laboratory-result workflow in parts per trillion rather than a fake continuous analyzer
- Routine rounds, lab checks, chemical inventory, housekeeping, maintenance coordination, and shift turnover
- Water-quality, efficiency, alarm-response, distribution, and routine-operations scoring

## Run locally

No build step is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For the most consistent browser behavior, you can also serve the folder with any basic static web server.

## GitHub Pages

This project is designed to work as a static GitHub Pages site from the repository root.

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
- final PFAS facility control details that are not publicly established

Do not use this simulator as an operating procedure, regulatory reference, or substitute for plant-specific training.

## Project layout

```text
.
├── index.html
├── README.md
├── .nojekyll
└── docs/
    ├── REALISM_BOUNDARIES.md
    └── VERSION_HISTORY.md
```

## Development direction

Future versions can separate the current single-file application into modular CSS and JavaScript files, add trend-history screens, scheduled maintenance, shift scenarios, and additional educational explanations while preserving the project's infrastructure-safety boundaries.
