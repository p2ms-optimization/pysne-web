# Case Study: Solving Nonlinear Systems

## Example: Circle-Exponential System

Find all solutions of the system:

```text
x₁² + x₂² - 1 = 0
x₁ - e^(-x₂) = 0
```

## Objective

The objective is to detect all valid solutions inside a bounded search space and verify them using residual tolerance.

## Process

1. Define equations.
2. Generate initial points.
3. Run local solvers from multiple starting points.
4. Cluster duplicate candidate solutions.
5. Validate each candidate using residual value.

## Key Results

- Multiple candidate solutions can be detected.
- Duplicate solutions are merged by clustering.
- Final output is filtered by residual tolerance.
- Visualization helps explain the solution landscape.

[Read the documentation](../documentation/index.md)
