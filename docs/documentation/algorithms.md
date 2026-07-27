# Algorithms

PySNE's solver combines two techniques from the spiral-optimization
literature: **Spiral Optimization (SPO)**, proposed by
Tamura & Yasuda (2011), for local search, and a **clustering extension**
proposed by Sidarto & Kania (2015) that lets a single run locate *all*
roots or optima in a bounded domain, rather than just one.

## Why clustering, not just SPO?

A single SPO run migrates a population of points toward one best point —
it converges to a single maximum. Nonlinear systems and multimodal
functions, however, often have several distinct roots or optima scattered
across the domain. Running SPO once isn't enough to find them all.

PySNE addresses this with a **two-phase pipeline**: first, an iterative
clustering phase spreads out candidate regions likely to contain distinct
solutions; then SPO is run independently *within each cluster*, so
multiple solutions can be refined simultaneously in a single overall call
to `pysne.solve`.

```text
Sobol-sample the domain
        │
        ▼
Phase 1 — Iterative Clustering  (localize candidate regions)
        │
        ▼
Phase 2 — SPO per cluster      (refine each region to a precise point)
        │
        ▼
Phase 3 — Final Selection       (validate + deduplicate, per problem type)
```

## Phase 1: Iterative clustering

Implemented in `perform_iterative_clustering`.

1. **Initialize.** Sample `m_cluster` points across the domain using a
   Sobol sequence — a low-discrepancy sequence that covers the space more
   uniformly than pseudo-random sampling, which matters for not missing
   isolated roots. The single best-fitness point seeds the first cluster.
2. **Repeat for `k_cluster` iterations:**
      - Evaluate every point's fitness.
      - Points that clear a `gamma` cutoff and aren't already cluster
        centers are handed to the point-assignment logic (below), which
        decides whether each point should start a new cluster, replace an
        existing cluster's center, or just do nothing.
      - Every point in the population is then migrated using the same
        spiral (rotate-and-shrink) transformation that drives SPO itself,
        pulling the whole population toward the current best point each
        round. This is what lets clustering "sweep" the domain over
        several iterations rather than sampling it once.

**Deciding what a point does to the cluster list.** For a candidate point
`y` and its nearest existing cluster center `x_C`, PySNE samples a handful
of points in between (`num_check_points` of them) and compares fitness at
`y`, at `x_C`, and at the in-between points:

- If the in-between points dip *lower* than both `y` and `x_C`, there's a
  valley separating them — they belong to different solutions, so `y`
  starts a new cluster.
- If an in-between point is *higher* than both `y` and `x_C`, a better
  candidate lies between them — a new cluster forms at `y`, and the search
  recurses toward that better in-between point.
- If neither of those holds and `y` is simply better than `x_C`, `y`
  replaces the cluster's center.
- Otherwise, the cluster is left alone (only its radius is refreshed to
  the current point's distance).

**The `gamma` cutoff behaves differently depending on the problem type:**
for systems of equations (SNE) and Diophantine problems it's an
*absolute* fitness threshold; for general multimodal optimization it's
*relative* to the current best fitness found so far. This reflects a
difference in what "not worth clustering around" means for each: an SNE
residual has a fixed target (a fitness of 1.0 means an exact root),
whereas an arbitrary objective function's "good enough" is inherently
relative to what's achievable.

## Phase 2: SPO refinement per cluster

Implemented in `run_spo_on_clusters`, calling `spiral_dynamics_optimization`
once per cluster found in Phase 1.

For each cluster:

1. A local search domain is built as a hypercube around the cluster's
   center and radius, clipped to the global domain.
2. `spo_m` new initial points are Sobol-sampled inside that local
   hypercube — a fresh, dense sample confined to the region likely to
   contain the actual solution.
3. SPO runs on that local domain for up to `spo_k_max` iterations, using
   the same spiral update as clustering but with its own `spo_r` /
   `spo_theta` parameters (independent from the clustering phase's `r_cl`
   / `theta_cl`), refining the cluster down to a single precise candidate
   point.
4. For systems of equations, this loop can stop early once the residual
   tolerance `epsilon` is met, rather than always running the full
   `spo_k_max` iterations.

Because SPO is a maximizer, minimization problems are handled by wrapping
them in `MinimizedProblem`, which negates the objective so the same spiral
search can be reused unchanged.

## Phase 3: Final selection

Once every cluster has produced a refined candidate, `problem.select_final_optimal`
filters and deduplicates them — but the *criteria* differ meaningfully by
problem type:

| Problem type | Acceptance test | Deduplication |
|---|---|---|
| **SNE** (`SNEProblem`) | In-domain and `1.0 - fitness < epsilon` (fitness close to the maximum of 1.0 = near-zero residual). | Points within `delta` of each other are merged, keeping the higher-fitness one. |
| **Multimodal** (`MultimodalProblem`) | In-domain, optionally above a `gamma`-relative quality floor, **and** a local peak check — a candidate is discarded if nudging it slightly in any dimension increases its fitness (i.e. it isn't actually a local optimum). | Same `delta`-based merge. |
| **Diophantine** (`DiophantineProblem`) | Candidates are rounded to integers, checked against the integer domain, and accepted if `1.0 - fitness <= epsilon`. | Deduplicated as exact integer tuples, then optionally sorted before comparison so permutation-symmetric solutions (e.g. swapped variables) count as duplicates. |

This is why PySNE structures problems around subclasses rather than a
single generic solver: each problem type needs a different notion of "is
this candidate actually a valid, distinct solution?"

## Tuning at a glance

See the full [Params dictionary](api-reference.md#params-dictionary) for
every key. As a rough guide:

- **More expected solutions / higher-dimensional domains** → increase
  `m_cluster` and `k_cluster` so clustering has enough points and sweeps
  to separate them.
- **Tight equation systems needing high precision** → lower `epsilon`,
  and give SPO more room with `spo_k_max`.
- **Solutions close together in space** → lower `delta` so they aren't
  merged into one; too low, however, risks treating numerically-close
  duplicates of the same root as distinct.
- **Multimodal landscapes with many shallow local optima** → tune `gamma`
  to filter out weak peaks during clustering (`-inf` disables this
  filtering entirely).

## References

- Tamura, K., Yasuda, K. (2011). *Spiral Dynamics Inspired Optimization.*
  Journal of Advanced Computational Intelligence and Intelligent
  Informatics, 15, 1116–1122.
- Sidarto, K.A., Kania, A. (2015). *Finding all solutions of systems of
  nonlinear equations using spiral dynamics optimization with clustering.*
  Journal of Advanced Computational Intelligence and Intelligent
  Informatics, 19(5), 697–707.

!!! note
    PySNE's `MultimodalProblem` and `DiophantineProblem` variants extend
    the same clustering idea to general optimization and integer-constrained
    problems respectively — see the [Publications](../research/publications.md)
    page for the related papers behind those extensions once it's filled in.

## Related pages

- [API Reference](api-reference.md) — full function-level documentation of the pipeline described above.
- [User Guide](user-guide.md) — practical walkthrough of defining and solving a problem.