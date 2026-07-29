# Case Study: Nonlinear Systems (SNE Benchmarks)

PySNE ships with a curated suite of **Systems of Nonlinear Equations (SNE)** benchmarks in
`pysne.problems.benchmarks_sne`. Each problem is a standard test case from the root-finding
literature, defined with a known search space and a target number of solutions
(`expected_roots`), which makes them ideal for validating that the solver recovers **all**
roots — not just one.

Every problem here subclasses `SNEProblem`, so the objective is driven by an explicit set of
equations \(F(\mathbf{x}) = 0\) and solutions are filtered by residual tolerance
(\(1 - f(\mathbf{x}) < \epsilon\)) before duplicate roots are merged by clustering.

!!! info "The three-phase pipeline"
    All SNE benchmarks are solved by the same pipeline — **Iterative Clustering → SPO →
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
    The solver prints each root together with its residual \(1 - f(\mathbf{x})\) when
    `verbose=True`. Because these are stochastic global searches, the exact coordinates are
    produced at runtime; the benchmark target is the **count** in the `Expected roots` column
    below.

## Benchmark roster

| ID | System | Vars | Search space | Expected roots |
|----|--------|:----:|--------------|:--------------:|
| 1 | Exponential–trigonometric system | 2 | \([-10, 10]^2\) | 6 |
| 2 | Sine–exponential coupled system | 2 | \([-1, 3] \times [-17, 4]\) | 12 |
| 3 | Coupled exponential system | 6 | \([-5, 5]^6\) | 2 |
| 4 | Structural (thin-walled beam) system | 3 | \([-40, 40]^3\) | 6 |
| 5 | Symmetric linear + product constraint | 5 | \([-10, 10]^5\) | 3 |
| 6 | Combustion / unit-circle system | 8 | \([-1, 1]^8\) | 16 |
| 7 | Truncated Weierstrass equation | 1 | \([0, 5.05]\) | 9 |

---

## Problem 1 — Exponential–trigonometric system

A classic two-variable system that mixes exponential and trigonometric terms, producing several
well-separated roots across a wide domain.

\[
\begin{aligned}
f_1(\mathbf{x}) &= \exp(x_1 - x_2) - \sin(x_1 + x_2) \\
f_2(\mathbf{x}) &= x_1^2 \cdot x_2^2 - \cos(x_1 + x_2)
\end{aligned}
\]

- **Search space:** \(x_1, x_2 \in [-10, 10]\)
- **Expected roots:** 6

## Problem 2 — Sine–exponential coupled system

A stiff coupled system over an asymmetric domain; the exponential term makes the residual
landscape steep, so it is tuned with a larger cluster budget.

\[
\begin{aligned}
f_1(\mathbf{x}) &= \frac{1}{2}\sin(x_1 x_2) - \frac{x_2}{4\pi} - \frac{x_1}{2} \\
f_2(\mathbf{x}) &= \left(1 - \frac{1}{4\pi}\right)\left(\exp(2x_1) - e\right) + \frac{e \, x_2}{\pi} - 2 e x_1
\end{aligned}
\]

- **Search space:** \(x_1 \in [-1, 3]\), \(x_2 \in [-17, 4]\)
- **Expected roots:** 12

## Problem 3 — Coupled exponential system (6D)

A six-dimensional system where variables are chained through products and exponentials, leaving
only two valid roots inside the box.

\[
\begin{aligned}
f_1(\mathbf{x}) &= x_1 + \frac{x_2^2 x_4 x_6}{4} + 0.75 \\
f_2(\mathbf{x}) &= x_2 + 0.405 \exp(1 + x_1 x_2) - 1.405 \\
f_3(\mathbf{x}) &= x_3 - \frac{x_4 x_6}{2} + 1.5 \\
f_4(\mathbf{x}) &= x_4 - 0.605 \exp(1 - x_3^2) - 0.395 \\
f_5(\mathbf{x}) &= x_5 - \frac{x_2 x_6}{2} + 1.5 \\
f_6(\mathbf{x}) &= x_6 - x_1 x_5
\end{aligned}
\]

- **Search space:** \(x_i \in [-5, 5]\) for \(i = 1, \dots, 6\)
- **Expected roots:** 2

## Problem 4 — Structural (thin-walled beam) system

An engineering-flavoured system derived from cross-sectional area, moment-of-inertia, and
torsion relations of a thin-walled beam.

\[
\begin{aligned}
f_1(\mathbf{x}) &= x_1 x_2 - (x_1 - 2x_3)(x_2 - 2x_3) - 165 \\
f_2(\mathbf{x}) &= \frac{x_1 x_2^3}{12} - \frac{(x_1 - 2x_3)(x_2 - 2x_3)^3}{12} - 9369 \\
f_3(\mathbf{x}) &= \frac{2 (x_2 - x_3)^2 (x_1 - x_3)^2 x_3}{x_1 + x_2 - 2x_3} - 6835
\end{aligned}
\]

- **Search space:** \(x_i \in [-40, 40]\) for \(i = 1, 2, 3\)
- **Expected roots:** 6

## Problem 5 — Symmetric linear system + product constraint (5D)

Four near-symmetric linear equations coupled to a single nonlinear product constraint. The
symmetry yields exactly three distinct real solutions.

\[
\begin{aligned}
f_1(\mathbf{x}) &= 2x_1 + x_2 + x_3 + x_4 + x_5 - 6 \\
f_2(\mathbf{x}) &= x_1 + 2x_2 + x_3 + x_4 + x_5 - 6 \\
f_3(\mathbf{x}) &= x_1 + x_2 + 2x_3 + x_4 + x_5 - 6 \\
f_4(\mathbf{x}) &= x_1 + x_2 + x_3 + 2x_4 + x_5 - 6 \\
f_5(\mathbf{x}) &= x_1 x_2 x_3 x_4 x_5 - 1
\end{aligned}
\]

- **Search space:** \(x_i \in [-10, 10]\) for \(i = 1, \dots, 5\)
- **Expected roots:** 3

## Problem 6 — Combustion / unit-circle system (8D)

The most demanding case in the suite: an eight-variable system combining bilinear reaction
terms with four unit-circle constraints, admitting sixteen roots.

\[
\begin{aligned}
f_1(\mathbf{x}) &= 4.731\text{e-}3 \cdot x_1 x_3 - 0.3578 \, x_2 x_3 - 0.1238 \, x_1 + x_7 - 1.637\text{e-}3 \, x_2 - 0.9338 \, x_4 - 0.3571 \\
f_2(\mathbf{x}) &= 0.2238 \, x_1 x_3 + 0.7623 \, x_2 x_3 + 0.2638 \, x_1 - x_7 - 0.07745 \, x_2 - 0.6734 \, x_4 - 0.6022 \\
f_3(\mathbf{x}) &= x_6 x_8 + 0.3578 \, x_1 + 4.731\text{e-}3 \, x_2 \\
f_4(\mathbf{x}) &= -0.7623 \, x_1 + 0.2238 \, x_2 + 0.3461 \\
f_5(\mathbf{x}) &= x_1^2 + x_2^2 - 1 \\
f_6(\mathbf{x}) &= x_3^2 + x_4^2 - 1 \\
f_7(\mathbf{x}) &= x_5^2 + x_6^2 - 1 \\
f_8(\mathbf{x}) &= x_7^2 + x_8^2 - 1
\end{aligned}
\]

- **Search space:** \(x_i \in [-1, 1]\) for \(i = 1, \dots, 8\)
- **Expected roots:** 16

## Problem 7 — Truncated Weierstrass equation (1D)

A single-variable equation built from a truncated Weierstrass series (\(s = 1.1\), \(\lambda =
1.5\), \(N = 20\)). Although one-dimensional, its highly oscillatory nature packs nine roots
into a short interval.

\[
f(x) = \sum_{k=1}^{20} \lambda^{(s-2)k} \cdot \sin\left(\lambda^k x\right), \quad s = 1.1, \ \lambda = 1.5
\]

- **Search space:** \(x \in [0, 5.05]\)
- **Expected roots:** 9

---

## Method & validation

For every problem above, PySNE follows the same procedure:

1. **Define** the equations and the bounded search space via `get_info()`.
2. **Cluster** the domain into candidate basins using iterative clustering.
3. **Optimise** locally inside each cluster with SPO to drive residuals toward zero.
4. **Select** valid roots by the residual criterion \(1 - F(\mathbf{x}) < \epsilon\) and merge
   duplicates within distance \(\delta\).

A run is considered successful when the number of recovered roots matches `expected_roots`
(PySNE's integration tests accept ≥ 80% recovery as a pass while tuning).

## See also

[Multimodal Benchmarks](multimodal-benchmarks.md){ .md-button .md-button--primary }
[Algorithms](../documentation/algorithms.md){ .md-button }
[References](../research/references.md){ .md-button }