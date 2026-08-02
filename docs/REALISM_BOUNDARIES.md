# Realism Boundaries

The goal of this project is to feel like a water-treatment operator simulation without recreating a real utility's sensitive control environment.

## Appropriate realism

The game may model:

- general drinking-water treatment concepts
- water-quality trends
- chemical-dose relationships
- filter aging and headloss
- generic gravity-filter backwash phases
- generic actuator command/feedback failures
- distribution demand and storage balancing
- laboratory sampling
- PFAS GAC adsorption concepts
- routine operator rounds and shift turnover
- high-level troubleshooting decisions

## Intentionally fictionalized or omitted

The project should not reproduce:

- actual City of Thornton PLC code or register maps
- real remote I/O addressing
- actual SCADA tag databases
- exact control narratives or permissives
- exact valve lineups
- station-specific bypass procedures
- real alarm setpoints
- exact tank or pump locations
- actual pump curves or hydraulic grade lines
- communications topology
- credentials or security configuration
- detailed emergency-response procedures

## PFAS

The PFAS page represents a future-state GAC treatment concept for training. PFAS concentrations are treated as laboratory values rather than continuous online analyzer signals. Final facility details should remain generalized unless they are both publicly available and appropriate for an educational simulation.

## Backwash

The backwash sequence is a generic training sequence. It is not intended to duplicate Thornton's final automatic sequence, timing, actuator naming, wash rates, or interlocks.

## Use

This application is for education and simulation only. It is not an SOP, regulatory compliance tool, or operational decision-support system.
