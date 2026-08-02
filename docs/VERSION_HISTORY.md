# Version History

## V11 — Randomized Shifts
Added randomized shift handoffs and shift-specific incident pools. Each new shift now varies production, source blend, water-quality starting values, chemical setpoints, storage, zone conditions, backwash-basin level, filter age/headloss/turbidity, and PFAS GAC status. Most shifts inherit one or two minor imperfect conditions, while some begin relatively stable. Each shift receives roughly 8–11 possible incident types, and incident types are removed from that shift's remaining pool after they occur to reduce repetition. A shift can also begin with an active incident already present at turnover.

## V10 — Routine Shift Work
Added scheduled plant rounds, process/lab checks, distribution reviews, chemical inventory, housekeeping, filter reviews, maintenance coordination, PFAS checks, and shift turnover.

## V9 — Backwash Sequence
Added a step-by-step generic automatic filter backwash sequence, permissives, valve/actuator command and feedback, and occasional actuator failures.

## V8 — PFAS GAC
Added a future-state PFAS granular activated carbon treatment page with media-service indicators, hydraulic headloss, laboratory PFOA/PFOS results, and PFAS-related incidents.

## V7 — Operator Incidents
Expanded process, equipment, instrumentation, distribution, and emergency incidents. Alarm acknowledgement no longer automatically clears scenario alarms.

## V6 — Filter / Backwash Realism
Staggered filter ages, lengthened modeled filter runs, added unnecessary-backwash penalties, and modeled backwash-basin refill using filtered water.

## V5 — Chemical Feed Detail
Separated dose setpoint, equivalent lb/MG, calculated lb/day feed demand, simulated liquid feed, and pump/generator output.

## V4 — SCADA Navigation
Converted the original long dashboard into dedicated SCADA-style pages.

## V1–V3
Established the treatment-process simulator, filter controls, distribution overview, storage, pressure zones, pump stations, alarms, and 12-hour shift scoring.
