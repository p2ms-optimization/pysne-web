# User Guide

## Define the nonlinear system

A nonlinear system can be written as:

```text
F(x) = 0
```

where `F` contains several nonlinear equations and `x` contains the variables.

## Choose the search space

For practical computation, PySNE needs a bounded domain:

```python
bounds = [(-3, 3), (-3, 3)]
```

## Find solutions

```python
solutions = ps.solve_all(system, bounds=bounds)
```

## Validate results

A candidate point is accepted if the residual is below a configured tolerance.
