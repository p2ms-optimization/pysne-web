# Algorithms

PySNE may combine several strategies:

- Multi-start numerical root finding.
- Clustering of converged points.
- Residual filtering.
- Basin of attraction visualization.
- Optional global search heuristics.

## Algorithm concept

```text
Generate initial points → Solve locally → Cluster candidates → Validate residuals → Return unique solutions
```

## Why multiple strategies?

Nonlinear systems can have multiple isolated solutions, repeated solutions, or solution sets that are hard to detect with only one initial point.
