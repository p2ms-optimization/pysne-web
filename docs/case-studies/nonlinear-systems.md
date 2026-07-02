# Case Study: Nonlinear Systems (SNE Benchmarks)

PySNE ships with a curated suite of **Systems of Nonlinear Equations (SNE)** benchmarks in
`pysne.problems.benchmarks_sne`. Each problem is a standard test case from the root-finding
literature, defined with a known search space and a target number of solutions
(`expected_roots`), which makes them ideal for validating that the solver recovers **all**
roots — not just one.

Every problem here subclasses `SNEProblem`, so the objective is driven by an explicit set of
equations `F(x) = 0` and solutions are filtered by residual tolerance (`1 - f(x) < epsilon`)
before duplicate roots are merged by clustering.

!!! info "The three-phase pipeline"
    All SNE benchmarks are solved by the same pipeline — **Iterative Clustering → SDOA →
    Selection**. See [Algorithms](../documentation/algorithms.md) for the full method.

## Running the suite

Each problem is retrieved from a registry, instantiated, and passed to `solve_system` together
with its recommended parameters.

```python
from pysne.problems.benchmarks_sne import get_problem_set
from pysne.solver import solve_system

# 1. Load the registry of benchmark problems (IDs 1–7)
problems = get_problem_set()

# 2. Instantiate a single problem, e.g. Problem 1
problem = problems[1]()

# 3. Pull its domain and tuned parameters
domain, params = problem.get_info()
expected = params["expected_roots"]

# 4. Solve for ALL roots inside the domain
result = solve_system(problem, params, verbose=True)

roots = result["roots"]        # numpy array of solution vectors
clusters = result["clusters"]  # candidate regions detected by clustering

print(f"{problem.name}")
print(f"Expected roots : {expected}")
print(f"Roots found    : {len(roots)}")
```

To sweep every problem in one pass:

```python
from pysne.problems.benchmarks_sne import get_problem_set
from pysne.solver import solve_system

for pid, factory in get_problem_set().items():
    problem = factory()
    _, params = problem.get_info()
    result = solve_system(problem, params, verbose=False)
    print(f"Problem {pid}: found {len(result['roots'])} / {params['expected_roots']} roots")
```

!!! note "Reproducing the results"
    The solver prints each root together with its residual `1 - f(x)` when `verbose=True`.
    Because these are stochastic global searches, the exact coordinates are produced at
    runtime; the benchmark target is the **count** in the `Expected roots` column below.

## Benchmark roster

| ID | System | Vars | Search space | Expected roots |
|----|--------|:----:|--------------|:--------------:|
| 1 | Exponential–trigonometric system | 2 | `[-10, 10]²` | 6 |
| 2 | Sine–exponential coupled system | 2 | `[-1, 3] × [-17, 4]` | 12 |
| 3 | Coupled exponential system | 6 | `[-5, 5]⁶` | 2 |
| 4 | Structural (thin-walled beam) system | 3 | `[-40, 40]³` | 6 |
| 5 | Symmetric linear + product constraint | 5 | `[-10, 10]⁵` | 3 |
| 6 | Combustion / unit-circle system | 8 | `[-1, 1]⁸` | 16 |
| 7 | Truncated Weierstrass equation | 1 | `[0, 5.05]` | 9 |

---

## Problem 1 — Exponential–trigonometric system

A classic two-variable system that mixes exponential and trigonometric terms, producing several
well-separated roots across a wide domain.

```text
f₁(x) = exp(x₁ − x₂) − sin(x₁ + x₂)
f₂(x) = x₁² · x₂² − cos(x₁ + x₂)
```

- **Search space:** `x₁, x₂ ∈ [-10, 10]`
- **Expected roots:** 6

## Problem 2 — Sine–exponential coupled system

A stiff coupled system over an asymmetric domain; the exponential term makes the residual
landscape steep, so it is tuned with a larger cluster budget.

```text
f₁(x) = ½·sin(x₁·x₂) − x₂ / (4π) − x₁ / 2
f₂(x) = (1 − 1/(4π))·(exp(2x₁) − e) + e·x₂ / π − 2e·x₁
```

- **Search space:** `x₁ ∈ [-1, 3]`, `x₂ ∈ [-17, 4]`
- **Expected roots:** 12

## Problem 3 — Coupled exponential system (6D)

A six-dimensional system where variables are chained through products and exponentials, leaving
only two valid roots inside the box.

```text
f₁(x) = x₁ + (x₂²·x₄·x₆)/4 + 0.75
f₂(x) = x₂ + 0.405·exp(1 + x₁·x₂) − 1.405
f₃(x) = x₃ − (x₄·x₆)/2 + 1.5
f₄(x) = x₄ − 0.605·exp(1 − x₃²) − 0.395
f₅(x) = x₅ − (x₂·x₆)/2 + 1.5
f₆(x) = x₆ − x₁·x₅
```

- **Search space:** `xᵢ ∈ [-5, 5]` for `i = 1..6`
- **Expected roots:** 2

## Problem 4 — Structural (thin-walled beam) system

An engineering-flavoured system derived from cross-sectional area, moment-of-inertia, and
torsion relations of a thin-walled beam.

```text
f₁(x) = x₁·x₂ − (x₁ − 2x₃)·(x₂ − 2x₃) − 165
f₂(x) = (x₁·x₂³)/12 − ((x₁ − 2x₃)·(x₂ − 2x₃)³)/12 − 9369
f₃(x) = [2·(x₂ − x₃)²·(x₁ − x₃)²·x₃] / (x₁ + x₂ − 2x₃) − 6835
```

- **Search space:** `xᵢ ∈ [-40, 40]` for `i = 1..3`
- **Expected roots:** 6

## Problem 5 — Symmetric linear system + product constraint (5D)

Four near-symmetric linear equations coupled to a single nonlinear product constraint. The
symmetry yields exactly three distinct real solutions.

```text
f₁(x) = 2x₁ + x₂ + x₃ + x₄ + x₅ − 6
f₂(x) = x₁ + 2x₂ + x₃ + x₄ + x₅ − 6
f₃(x) = x₁ + x₂ + 2x₃ + x₄ + x₅ − 6
f₄(x) = x₁ + x₂ + x₃ + 2x₄ + x₅ − 6
f₅(x) = x₁·x₂·x₃·x₄·x₅ − 1
```

- **Search space:** `xᵢ ∈ [-10, 10]` for `i = 1..5`
- **Expected roots:** 3

## Problem 6 — Combustion / unit-circle system (8D)

The most demanding case in the suite: an eight-variable system combining bilinear reaction
terms with four unit-circle constraints, admitting sixteen roots.

```text
f₁(x) = 4.731e-3·x₁·x₃ − 0.3578·x₂·x₃ − 0.1238·x₁ + x₇ − 1.637e-3·x₂ − 0.9338·x₄ − 0.3571
f₂(x) = 0.2238·x₁·x₃ + 0.7623·x₂·x₃ + 0.2638·x₁ − x₇ − 0.07745·x₂ − 0.6734·x₄ − 0.6022
f₃(x) = x₆·x₈ + 0.3578·x₁ + 4.731e-3·x₂
f₄(x) = −0.7623·x₁ + 0.2238·x₂ + 0.3461
f₅(x) = x₁² + x₂² − 1
f₆(x) = x₃² + x₄² − 1
f₇(x) = x₅² + x₆² − 1
f₈(x) = x₇² + x₈² − 1
```

- **Search space:** `xᵢ ∈ [-1, 1]` for `i = 1..8`
- **Expected roots:** 16

## Problem 7 — Truncated Weierstrass equation (1D)

A single-variable equation built from a truncated Weierstrass series (`s = 1.1`, `λ = 1.5`,
`N = 20`). Although one-dimensional, its highly oscillatory nature packs nine roots into a
short interval.

```text
f(x) = Σ_{k=1}^{20} λ^((s−2)·k) · sin(λ^k · x),   s = 1.1,  λ = 1.5
```

- **Search space:** `x ∈ [0, 5.05]`
- **Expected roots:** 9

---

## Method & validation

For every problem above, PySNE follows the same procedure:

1. **Define** the equations and the bounded search space via `get_info()`.
2. **Cluster** the domain into candidate basins using iterative clustering.
3. **Optimise** locally inside each cluster with SDOA to drive residuals toward zero.
4. **Select** valid roots by the residual criterion `1 − f(x) < epsilon` and merge duplicates
   within distance `delta`.

A run is considered successful when the number of recovered roots matches `expected_roots`
(PySNE's integration tests accept ≥ 80% recovery as a pass while tuning).

## See also

[Multimodal Benchmarks](multimodal-benchmarks.md){ .md-button .md-button--primary }
[Algorithms](../documentation/algorithms.md){ .md-button }
[References](../research/references.md){ .md-button }