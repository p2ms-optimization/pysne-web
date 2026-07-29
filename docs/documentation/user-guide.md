# User Guide

## Choosing a problem type

PySNE ships three base classes under `pysne.problems.base`, all subclassing
the abstract `BaseProblem`:

| Base class | Use it for |
|---|---|
| `SNEProblem` | Finding all real roots of a system `f_1(x) = 0, ..., f_k(x) = 0` |
| `MultimodalProblem` | Finding all global/local optima of a scalar function |
| `DiophantineProblem` | Integer-valued nonlinear systems (rounds candidates to integers) |

A `MinimizedProblem` wrapper is also available to flip any
`MultimodalProblem` from maximization to minimization without rewriting it.

## Defining a system (`SNEProblem`)

Subclass `SNEProblem` and implement:

- `name` (property) — a human-readable label
- `get_equations()` — return a list of callables `f_i(x)`, one per equation
- `get_info()` — return `(domain, params)`, where `domain` is
  `[(lo, hi), ...]` per variable

```python
from pysne.problems.base import SNEProblem
import numpy as np

class MySystem(SNEProblem):
    @property
    def name(self):
        return "My 2-equation system"

    def get_equations(self):
        return [
            lambda x: x[0]**2 + x[1]**2 - 4,
            lambda x: x[0] * x[1] - 1,
        ]

    def get_info(self):
        domain = [(-5, 5), (-5, 5)]
        params = {"m_cluster": 250, "k_cluster": 10, "epsilon": 1e-7, "delta": 0.01}
        return domain, params
```

You don't need to override `g_func`/`evaluate_fitness` — `SNEProblem` wires
them to `pysne.utils.objective_function`, which converts the residual sum
into a fitness value in `(0, 1]` via `F(x) = 1 / (1 + Σ|f_i(x)|)`.

## Defining a multimodal problem (`MultimodalProblem`)

Implement `g_func(x)` directly (your objective, to be **maximized** — flip
sign yourself, or wrap in `MinimizedProblem`, if you want a minimum) and
`get_info()`. See `pysne/problems/benchmarks_multimodal.py` for many
worked examples (Rastrigin, Six-Hump Camel Back, Shubert, Griewank, etc.).

## Defining a Diophantine problem (`DiophantineProblem`)

Two supported styles:

1. Override `get_info()` directly, same as `SNEProblem` — return
   `(integer_domain, params)`.
2. Override `get_integer_domain()` and `get_params()` separately.

Candidates are rounded to integers before fitness evaluation and domain
checks. The continuous "buffer" around your integer domain (controlled by
`create_continuous_bounds`, default margin `0.5`) lets the spiral search
move freely between the discrete allowed points.

## The `params` dictionary

| Key | Phase | Meaning |
|---|---|---|
| `m_cluster` | Clustering | Number of Sobol points sampled per clustering iteration |
| `k_cluster` | Clustering | Number of clustering iterations |
| `r_cl` | Clustering | Spiral contraction rate (default 0.95) |
| `theta_cl` | Clustering | Spiral rotation angle (default π/4) |
| `gamma` | Clustering | Fitness cutoff threshold below which points are ignored; interpreted as absolute for SNE/Diophantine problems, relative to the best value found for multimodal problems |
| `num_check_points` | Clustering | Number of interior points checked between a point and its nearest cluster center (see [Algorithms](algorithms.md)) |
| `sdoa_m` (or `m`) | Spiral Optimization | Number of points per SDOA run inside each cluster |
| `sdoa_k_max` (or `k_max`) | Spiral Optimization | Max SDOA iterations |
| `r` | Spiral Optimization | Spiral contraction rate for SDOA |
| `theta` | Spiral Optimization | Spiral rotation angle for SDOA |
| `epsilon` | Selection | Residual/accuracy tolerance to accept a candidate |
| `delta` | Selection | Minimum distance between two candidates to be considered distinct |

!!! tip
    Parameter names differ slightly between the clustering phase
    (`r_cl`/`theta_cl`) and the SDOA phase (`r`/`theta`) so you can tune them
    independently — see `perform_iterative_clustering` and
    `run_sdoa_on_clusters` in `pysne/solver.py`.

## Running the solver

```python
from pysne.solver import solve

problem = MySystem()
domain, params = problem.get_info()
result = solve(problem, params, verbose=True)

roots = result["roots"]
```

## Reading results

- `result["roots"]` (alias `result["optimals"]`) — the final, de-duplicated
  candidate points
- `result["clusters"]` — the raw `Cluster` objects from phase 1, useful for
  diagnostics/visualization
- `result["time_elapsed"]` — total wall-clock time

## Common pitfalls

- **Too few clusters found** — increase `m_cluster` and/or `k_cluster`, or
  loosen `gamma` so more candidate points survive the cutoff.
- **Merged solutions that should be distinct** — decrease `delta`.
- **Slow high-dimensional runs** — `m_cluster` typically needs to scale with
  dimension (see how the benchmark problems bump `m_cluster` for 3D+ systems
  in `benchmarks_multimodal.py`); Sobol sampling can also silently fall back
  to pseudo-random points if scipy's dimensionality limit is hit (a
  `UserWarning` is raised when this happens).
- **No guaranteed completeness** — like other stochastic global-search
  methods, PySNE improves coverage with more points/iterations but doesn't
  formally guarantee every solution is found.
