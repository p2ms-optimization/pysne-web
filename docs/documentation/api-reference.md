# API Reference

Every `pysne` search tells the same two-part story. First, a swarm of
Sobol-sampled points spirals inward across the whole domain, clumping
together wherever it senses a root or optimum nearby — that's the
**clustering** phase. Then, inside each of those clusters, a second,
tighter spiral takes over to zero in on the precise point — that's
**Spiral Optimization (SPO)**. Same rotate-and-shrink move both times,
just played out at a different scale: wide and exploratory first, then
narrow and exact.

This page is the reference for that pipeline: the solver that drives it
(`pysne/solver.py`), the problem classes you plug into it
(`pysne/problems/base.py`), the clustering step
(`pysne/clustering/`), the SPO engine itself
(`pysne/optimizers/spo/`), and the shared utilities
(`pysne/utils.py`) that tie it all together.

## `pysne.solve`

```python
pysne.solve(problem, params, verbose=False)
```
[:material-code-tags: source](../_modules/pysne/solver.md#__codelineno-0-147)

Public alias for `solve_system`. This is the main entry point for finding
roots (or optimal points) of a problem.

```python
pysne.solve_system(problem, params, verbose=False)
```
[:material-code-tags: source](../_modules/pysne/solver.md#__codelineno-0-90)

Solves a system by running the full three-phase pipeline:

1. **Clustering** — localizes potential root/optimum regions (`perform_iterative_clustering`).
2. **Optimization** — runs SPO on each cluster to refine candidate points (`run_spo_on_clusters`).
3. **Selection** — filters and de-duplicates candidates into final validated results, via `problem.select_final_optimal(...)`.

### Parameters

| Name | Type | Description |
|---|---|---|
| `problem` | `BaseProblem` subclass | An instance of `SNEProblem`, `MultimodalProblem`, `DiophantineProblem`, or `MinimizedProblem`. See [Problem classes](#problem-classes) below. |
| `params` | dict | Hyperparameters for clustering and SPO. See [Params dictionary](#params-dictionary) below. |
| `verbose` | bool, optional | If `True`, prints elapsed time and the number of clusters / valid results found. Default: `False`. |

### Returns

`dict` with the keys:

| Key | Type | Description |
|---|---|---|
| `roots` | `numpy.ndarray` | Validated result points (same array as `optimals`). |
| `optimals` | `numpy.ndarray` | Alias of `roots` — used when the problem is a general optimization rather than strict root-finding. |
| `clusters` | `list` | The `Cluster` objects found during Phase 1. |
| `time_elapsed` | `float` | Computation time in seconds. |

### Example: solving a system of nonlinear equations

```python
import pysne
from pysne.problems.base import SNEProblem

class MySystem(SNEProblem):
    @property
    def name(self):
        return "My 2-variable system"

    def get_equations(self):
        return [
            lambda x: x[0]**2 + x[1]**2 - 1,
            lambda x: x[0] - x[1]**2,
        ]

    def get_info(self):
        domain = [(-2, 2), (-2, 2)]
        params = {
            "m_cluster": 300, "r_cl": 0.95, "theta_cl": 3.14159 / 4, "k_cluster": 10,
            "epsilon": 1e-7, "delta": 0.01,
            "spo_m": 200, "spo_k_max": 230, "r": 0.95, "theta": 3.14159 / 4,
            "gamma": -float("inf"),
        }
        return domain, params

problem = MySystem()
domain, params = problem.get_info()
result = pysne.solve(problem, params, verbose=True)

for root in result["roots"]:
    print(root)
```

---

## Problem classes

`pysne.problems.base` defines the abstract base class and the concrete
problem types that plug into `pysne.solve`. Every problem you define
subclasses one of these.

### `BaseProblem` (abstract)
[:material-code-tags: source](../_modules/pysne/problems/base.md#__codelineno-0-5)

The shared contract every problem type implements.

| Member | Kind | Description |
|---|---|---|
| `name` | property (abstract) | Human-readable problem name. Must be implemented by subclasses. |
| `optima_type` | property | `"max"`, `"min"`, or `"both"`. Defaults to `"both"`. |
| `g_func(x)` | abstract method | The core objective function. Receives `x` and returns a fitness value. |
| `get_info()` | abstract method | Returns `(domain, params)` — the search space bounds and hyperparameter dict. |
| `evaluate_fitness(x)` | abstract method | Fitness evaluation used during SPO/clustering (usually delegates to `g_func`). |
| `select_final_optimal(candidates)` | abstract method | Filters/deduplicates raw candidate points into the final result set. |

On `__init__`, `BaseProblem` calls `self.get_info()` to set `self.domain`
and derives `self.n_var = len(self.domain)`. `self.equations` defaults to
`None` and is set by subclasses that use equation systems.

### `SNEProblem` — Systems of Nonlinear Equations
[:material-code-tags: source](../_modules/pysne/problems/base.md#__codelineno-0-56)

`problem_type = "SNE"`

For finding roots of a system `F(x) = 0`.

- `get_equations()` — override to return a list of callables `f_i(x)`; defaults to `[]`.
- `g_func(x)` — evaluates `objective_function(x, self.equations)`.
- `evaluate_fitness(x)` — same as `g_func(x)`.
- `select_final_optimal(candidates)` (alias: `select_final_roots`) — keeps a candidate if it's inside the domain **and** `1.0 - evaluate_fitness(x) < epsilon`, then deduplicates nearby points using `filter_unique_roots(..., delta)`.

!!! note
    Confirmed: `pysne.utils.objective_function` computes `F(x) = 1 / (1 + Σ|f_i(x)|)`,
    turning root-finding into maximization. `F(x)` is in `(0, 1]`, approaching
    `1.0` as the residual approaches zero — see [Utility functions](#utility-functions-pysneutils) below.

### `MultimodalProblem` — general optimization with multiple optima
[:material-code-tags: source](../_modules/pysne/problems/base.md#__codelineno-0-94)

`problem_type = "Multimodal"`

For finding several local/global optima of `g_func`, not just roots.

- `evaluate_fitness(x)` — same as `g_func(x)`.
- `select_final_optimal(candidates)`:
    1. Computes `F_star`, the best fitness among in-domain candidates.
    2. If `gamma` is set (and not `-inf`), discards any candidate with `f(x) <= (1 - epsilon) * F_star` — a relative-quality cutoff against the best candidate found.
    3. Applies a **local peak check**: perturbs each dimension by ±`epsilon` and discards the candidate if any neighbor has strictly higher fitness (i.e. it isn't a local maximum).
    4. Deduplicates the remaining peaks via `filter_unique_roots(..., delta)`.

### `DiophantineProblem` — integer-constrained problems
[:material-code-tags: source](../_modules/pysne/problems/base.md#__codelineno-0-148)

`problem_type = "Diophantine"`

For problems where solutions must be integers.

- Supports two subclassing styles:
    1. Override `get_info()` directly, returning `(integer_domain, params)` — same style as `SNEProblem`.
    2. Override `get_integer_domain()` and `get_params()` separately.
- Internally converts the integer domain to a continuous search domain via `create_continuous_bounds(...)` — this continuous domain is what SPO actually searches over.
- `g_func(x)` / `evaluate_fitness(x)` — round `x` to the nearest integers before evaluating; `evaluate_fitness` returns `0.0` if the rounded point falls outside `integer_domain`.
- `select_final_optimal(candidates)` (alias: `select_final_roots`) — rounds and deduplicates candidates as integer tuples, keeps them if `1.0 - f(x) <= epsilon`, deduplicates via `filter_unique_roots(..., delta)`, and optionally sorts symmetric-solution problems via `sort_unique_roots(..., sort=...)` (controlled by a `sort_solutions` params flag, or auto-enabled for a known set of symmetric benchmark class names).

### `MinimizedProblem` — minimization wrapper
[:material-code-tags: source](../_modules/pysne/problems/base.md#__codelineno-0-237)

`problem_type` — inherited from the wrapped problem (defaults to `"Multimodal"`).

A wrapper that negates an existing problem's fitness so SPO (which maximizes)
can be used to *minimize* the original problem.

```python
minimized = MinimizedProblem(original_problem)
```

- Copies `domain`, `n_var`, `equations`, and `problem_type` from `original_prob`.
- `g_func(x)` / `evaluate_fitness(x)` — return the **negated** value from the original problem.
- `select_final_optimal(candidates)` — if the original problem overrides `select_final_optimal` with custom logic (i.e. it isn't just the default `MultimodalProblem` behavior), that custom logic is reused (domain-filtered, deduplicated by `delta`); otherwise it falls back to `MultimodalProblem`'s default peak-filtering behavior.

---

## Params dictionary

`params` is a plain `dict` shared across the clustering and SPO phases.
Keys marked "aliased" accept either a prefixed or short form; the prefixed
form takes precedence when both are present (see `solve_system`'s handling
of `spo_r`/`r`, etc.).

| Key | Aliases | Typical values seen | Description |
|---|---|---|---|
| `epsilon` | — | `1e-7`–`1e-3` | Residual/quality tolerance for accepting a candidate. |
| `delta` | — | `0.0001`–`0.5` | Minimum distance between candidates for them to be treated as distinct (deduplication radius). |
| `gamma` | — | `-inf`, `0.1`–`0.9` | Cutoff threshold used during clustering to decide which sampled points are worth clustering around. Behavior depends on `problem.problem_type`: for **SNE**/**Diophantine** problems it's used as an **absolute** fitness cutoff (`F(y) > gamma`); for **Multimodal** problems it's a **relative** cutoff against the current best (`F(y) > gamma * F_best`, only when `F_best > 0`). `-inf` (or `None`) disables filtering entirely. |
| `m_cluster` | — | `250`–`16384` | Number of Sobol-sampled points used during the clustering phase (`perform_iterative_clustering`). |
| `k_cluster` | — | `5`–`490` | Number of clustering iterations — each iteration re-evaluates all `m_cluster` points, clusters them, then migrates them via the spiral update. |
| `r_cl` | — | `0.95`–`0.984` | Clustering-phase spiral radius factor. Combined with `theta_cl` to build the rotation-and-scale matrix `S_n = r_cl · R_n(theta_cl)` that migrates sample points toward the current best point each iteration. Falls back to `0.95` if omitted. |
| `theta_cl` | — | `π/4` typically | Clustering-phase spiral rotation angle, used to build `R_n` via `get_rotation_matrix(n, theta_cl)`. Falls back to `π/4` if omitted. |
| `spo_m` | `m` | `20`–`512` | Number of Sobol-sampled initial points generated per cluster for SPO (the optimization phase, distinct from `m_cluster`). |
| `spo_r` | `r` | `0.95`–`0.984` | SPO step/convergence radius factor (optimization phase only — separate from `r_cl`). |
| `spo_theta` | `theta` | `π/16`–`π/4` | SPO rotation angle parameter (optimization phase only — separate from `theta_cl`). |
| `spo_k_max` | `k_max` | `75`–`500` | Maximum SPO iterations per cluster. |
| `num_check_points` | — | `1`–`3` | Confirmed: used in `process_point_for_clustering`. Controls how many evenly-spaced intermediate points are sampled between a candidate `y` and its nearest cluster center to decide whether a valley, a better peak, or neither lies between them. Defaults to `1` if omitted. |
| `init_method` | — | `"sobol"` | Initial point sampling method for SPO within a cluster. |
| `expected_roots` | — | integer | Benchmark-only metadata (number of known roots), not consumed by the solver itself — used for validating results in test/benchmark scripts. |
| `sort_solutions` | — | bool | `DiophantineProblem`-only: forces sorting of symmetric solution sets. Auto-enabled for a known set of benchmark class names if not set explicitly. |

---

## Internals (not part of the public API)

These are used internally by `solve_system` and aren't intended to be
called directly, but are documented here for contributors.

### `Cluster`
[:material-code-tags: source](../_modules/pysne/clustering/model.md#__codelineno-0-3)

```python
Cluster(center, radius)
```

Represents a localized search region: the set of all points `y` satisfying
`||center - y|| < radius`. Used to group candidate solutions so the
algorithm can search for multiple distinct roots/optima in parallel.

| Attribute | Type | Description |
|---|---|---|
| `center` | `numpy.ndarray` | Center coordinate of the cluster. |
| `radius` | `float` | Radius of the cluster's region. |

### `perform_iterative_clustering(problem, params, history=None)`
[:material-code-tags: source](../_modules/pysne/clustering/modified_clustering_process.md#__codelineno-0-120)

The clustering phase (Phase 1 of `solve_system`). Locates candidate
root/optimum regions before SPO refines them.

Pipeline:

1. Generates `m_cluster` initial points via Sobol sampling over `problem.domain`.
2. Builds the spiral transformation matrix `S_n = r_cl · R_n(theta_cl)` (falling back to `r_cl=0.95`, `theta_cl=π/4` if not set), where `R_n` comes from `get_rotation_matrix`.
3. Seeds the first `Cluster` at the best-fitness point found so far, with radius = half the smallest domain span.
4. Runs `k_cluster` iterations. Each iteration:
      - Re-evaluates fitness for all `m_cluster` points.
      - For every in-domain point whose fitness clears the `gamma` cutoff (absolute for SNE/Diophantine, relative to `F_best` for Multimodal) and that isn't already a cluster center, calls `process_point_for_clustering` to assign or create a cluster.
      - Migrates every point via the spiral update: `new_point = S_n @ point - (S_n - I_n) @ x_best`, pulling the whole population toward the current best point each round.

**Parameters**

| Name | Type | Description |
|---|---|---|
| `problem` | `BaseProblem` subclass | The problem being solved; used for `.domain`, `.n_var`, `.evaluate_fitness`, `.problem_type`. |
| `params` | dict | See [Params dictionary](#params-dictionary) — expects `m_cluster`, `k_cluster`, `gamma`, `r_cl`, `theta_cl`, `num_check_points`. |
| `history` | list, optional | If provided, appended in-place with per-step debug records (useful for visualizing the clustering process). |

**Returns**

`list[Cluster]` — the distinct clusters found.

### `process_point_for_clustering(y, clusters, problem, gamma, params, history=None)`
[:material-code-tags: source](../_modules/pysne/clustering/modified_clustering_process.md#__codelineno-0-8)

Decides how a single point `y` affects the current cluster list, by
comparing `y` against its nearest existing cluster center `x_C` through
`num_check_points` intermediate points sampled between them.

- If no clusters exist yet, `y` seeds the first one.
- Otherwise, finds the nearest cluster and samples `num_check_points` points between `y` and its center, evaluating fitness at each.
- **Case 1 (Valley):** if the minimum intermediate fitness is lower than both `F(y)` and `F(x_C)`, there's a valley between them — `y` starts a new cluster (radius = half the distance to `x_C`).
- **Case 2 (Mid better):** if the maximum intermediate fitness beats both `F(y)` and `F(x_C)`, a better point lies between them — a new cluster is created at `y`, and the function recurses on the best intermediate point.
- **Case 3 (Update center):** if `F(y) > F(x_C)` (and neither of the above triggered), `y` replaces the cluster's center.
- Otherwise, only the nearest cluster's radius is updated (to half the distance to `y`).

**Parameters**

| Name | Type | Description |
|---|---|---|
| `y` | `numpy.ndarray` | The point being evaluated. |
| `clusters` | `list[Cluster]` | Current cluster list (mutated/extended in place and returned). |
| `problem` | `BaseProblem` subclass | Used for `.evaluate_fitness` and `.domain`. |
| `gamma` | float | The (already-resolved) cutoff for this call — note this is the per-point cutoff value passed down from `perform_iterative_clustering`, not necessarily the raw `params['gamma']`. |
| `params` | dict | Used for `num_check_points`. |
| `history` | list, optional | If provided, appended in-place with a debug record of which case was triggered. |

**Returns**

`list[Cluster]` — the updated cluster list.

### `run_spo_on_clusters(clusters, problem, params)`
[:material-code-tags: source](../_modules/pysne/solver.md#__codelineno-0-10)

Runs SPO on each cluster produced by the clustering phase to refine root
candidates.

For every cluster, this function:

1. Builds a local hypercube domain from the cluster's center and radius, clipped to the global domain.
2. For `problem_type == "Diophantine"`, enforces a minimum effective radius of `1.0` and re-centers degenerate domains.
3. Generates `spo_m` initial points inside the local domain via a Sobol sequence (`generate_sobol_points`).
4. Runs `spiral_optimization` on the local domain, maximizing `problem.evaluate_fitness` (SPO here is used as a maximizer, i.e. `minimization=False` — which is also why `MinimizedProblem` exists, to reframe minimization problems as maximization).

**Parameters**

| Name | Type | Description |
|---|---|---|
| `clusters` | `list` | `Cluster` objects from the clustering phase. |
| `problem` | `BaseProblem` subclass | The problem instance being solved. |
| `params` | dict | Hyperparameter dict — see [Params dictionary](#params-dictionary). |

**Returns**

`numpy.ndarray` — one candidate point per cluster, optimized by SPO.

---

## Optimizer engine (SPO)

`pysne.optimizers.spo` — the Spiral Optimization Algorithm used
to refine candidates within each cluster.

### `spiral_optimization(objective_func, domain, params, minimization=False, custom_initial_points=None, equations=None, epsilon=None, return_history=False)`
[:material-code-tags: source](../_modules/pysne/optimizers/spo/engine.md#__codelineno-0-6)

The core SPO loop. Migrates a population of search points toward the
current best point each iteration via a spiral (rotate-and-shrink)
transformation, until `k_max` iterations elapse or (for equation systems)
the residual drops below `epsilon`.

**Parameters**

| Name | Type | Description |
|---|---|---|
| `objective_func` | callable | Fitness function. Called vectorized first (`objective_func(search_points)`); falls back to a per-point list comprehension if the output shape doesn't match `(m,)`. |
| `domain` | list of tuple | Search space bounds for this call — typically the local cluster hypercube built by `run_spo_on_clusters`, not the global domain. |
| `params` | dict | Reads `m` (default `20`), `r` (default `0.95`), `theta` (default `π/4`), `k_max` (default `100`) — the already-resolved SPO params (see [Params dictionary](#params-dictionary)). |
| `minimization` | bool, optional | If `True`, tracks the minimum fitness instead of the maximum. `run_spo_on_clusters` always calls this with `False` (SPO maximizes; see `MinimizedProblem` for how minimization problems are reframed). |
| `custom_initial_points` | array-like, optional | If given, used as the initial population instead of generating new Sobol points; `m` is inferred from its length. |
| `equations` | list of callable, optional | If provided (i.e. solving an SNE), enables early stopping: the loop breaks once `1.0 - best_value <= epsilon`. |
| `epsilon` | float, optional | Early-stopping tolerance; defaults to `1e-7` if not given. |
| `return_history` | bool, optional | If `True`, also returns the list of best-value-per-iteration. |

**Returns**

- `x_star` (`numpy.ndarray`) — the best point found, or
- `(x_star, history)` if `return_history=True`, where `history` is a `list[float]` of the best fitness value after each iteration (including the initial one).

**Algorithm summary**

1. Initializes `m` search points (Sobol-sampled over `domain`, or `custom_initial_points` if given).
2. Precomputes `S_n = r · R_n(theta)` via `get_rotation_matrix`.
3. Tracks the best point `x_star` by evaluating all points.
4. For up to `k_max` iterations: moves every point via `new_points = S_n @ points - (S_n - I_n) @ x_star` (vectorized), re-evaluates, and updates `x_star` if a better point is found. Breaks early if solving an SNE and the residual clears `epsilon`.

### `get_rotation_matrix(n, theta)`
[:material-code-tags: source](../_modules/pysne/optimizers/spo/matrix.md#__codelineno-0-3)

Builds an `n × n` orthogonal rotation matrix by composing pairwise-plane
rotations across every unique `(i, j)` pair of dimensions, each by angle
`theta`. For `n == 1`, returns the `1×1` identity (no rotation possible in
one dimension).

| Name | Type | Description |
|---|---|---|
| `n` | int | Dimensionality of the search space. |
| `theta` | float | Rotation angle in radians (typically `π/4` in standard SPO). |

**Returns** `numpy.ndarray` of shape `(n, n)`.

### `generate_sobol_points(num_points, dimension, domain)`
[:material-code-tags: source](../_modules/pysne/initialization/sampling.md#__codelineno-0-5)

`pysne.initialization.sampling` — generates a low-discrepancy Sobol
sequence scaled to `domain`, used to seed both the clustering phase and
each SPO run with a uniform initial population. Falls back to plain
pseudo-random uniform sampling if Sobol generation fails (e.g.
dimensionality limits).

| Name | Type | Description |
|---|---|---|
| `num_points` | int | Number of points to generate. Ideally a power of two (`2^m`) for the Sobol sequence's spatial-balance properties. |
| `dimension` | int | Dimensionality of the sample space. |
| `domain` | list of tuple | Per-dimension bounds `[(min_1, max_1), ...]`. |

**Returns** `numpy.ndarray` of shape `(num_points, dimension)`.

---

## Utility functions (`pysne.utils`)

Shared helpers used across the solver, clustering, and problem classes.

### `objective_function(x, system_of_equations)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-5)

Converts a system of equations into a maximization-friendly fitness value:

```text
F(x) = 1 / (1 + Σ |f_i(x)|)
```

Returns a float in `(0, 1]` — `1.0` for an exact root, decaying toward `0`
as the residual grows. Returns `0.0` (with a `RuntimeWarning`) if evaluation
raises a `TypeError`, `ValueError`, or `ZeroDivisionError` (e.g. overflow or
division by zero in one of the equations).

### `is_in_domain(point, domain)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-38)

Returns `True` if `point[i]` falls within `domain[i] = (lo, hi)` for every
dimension `i` (inclusive bounds), else `False`.

### `validate_solutions(roots, equations, domain, epsilon)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-59)

Filters a list of candidate roots, keeping only those that are in-domain
**and** whose maximum absolute residual across all equations is strictly
below `epsilon`. Note: unlike `objective_function`'s combined/normalized
fitness, this checks residuals directly and per-equation (`max`, not `sum`).

### `create_continuous_bounds(integer_domain, margin=0.5)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-93)

Used by `DiophantineProblem` to expand each integer-domain dimension by
`margin` on both sides, giving SPO a continuous space to search that still
reaches the integer values at the domain's edges. E.g.
`[(-50, 50)] → [(-50.5, 50.5)]` with the default `margin=0.5`.

### `filter_unique_roots(candidates, delta)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-123)

Deduplicates a list of `(point, fitness)` tuples: sorts by fitness
descending, then greedily keeps points that are further than `delta` from
every already-kept point. If a new candidate is within `delta` of an
existing one, it's discarded unless it has *higher* fitness, in which case
it replaces the existing entry. Returns a `numpy.ndarray` of the surviving
points only (fitness values dropped).

### `sort_unique_roots(roots, sort=False)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-211)

Removes duplicate solutions from a list of coordinate tuples. If
`sort=True`, each solution's coordinates are sorted before comparison, so
permutations of the same values (e.g. symmetric solutions) are treated as
duplicates; if `False`, only exact-order duplicates are removed.

### `calculate_sobol_discrepancy(num_points=None, dimension=None, points=None, domain=None)`
[:material-code-tags: source](../_modules/pysne/utils.md#__codelineno-0-149)

Diagnostic/QA helper (not part of the solving pipeline) that measures how
uniformly a set of points covers the search space, via `scipy.stats.qmc.discrepancy`.
Either pass `points` (optionally with `domain`, to rescale into `[0, 1]^d`
first) to measure an existing set, or pass `num_points` + `dimension` to
generate and measure a fresh scrambled Sobol sequence. Lower discrepancy
means a more even distribution. Returns `-1.0` (with a warning) on failure
or invalid arguments.

---

## Related pages

- [Algorithms](algorithms.md) — conceptual overview of the clustering + SPO pipeline.
- [User Guide](user-guide.md) — practical walkthrough of defining and solving a system.