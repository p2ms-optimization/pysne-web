# Case Study: Multimodal Benchmarks

Beyond systems of equations, PySNE can locate **many optima of a single objective function** —
the multimodal optimisation task. These benchmarks live in
`pysne.problems.benchmarks_multimodal` and are the standard functions used to test niching and
multi-solution optimisers (Rastrigin, Shubert, Six-Hump Camel Back, and more).

!!! abstract "How this differs from the SNE benchmarks"
    In the [SNE suite](nonlinear-systems.md) the goal is to solve `F(x) = 0`, and problems carry
    an `expected_roots` target. Here the goal is to find **all optima** of `g(x)`, so each
    problem instead declares an `optima_type`:

    - `"max"` — search for maxima only
    - `"min"` — search for minima only
    - `"both"` — search for maxima **and** minima (the default)

    The solver finds maxima directly; to find minima, the problem is wrapped in
    `MinimizedProblem` before solving. Success is measured by the **number of optima found**,
    not a fixed root count.

## Running a multimodal problem

```python
from pysne.problems.benchmarks_multimodal import get_multimodal_problems
from pysne.solver import solve_system

# Registry accepts integer IDs and named keys
problems = get_multimodal_problems()

# Six-Hump Camel Back (ID 2)
prob = problems[2]()
domain, params = prob.get_info()

result = solve_system(prob, params, verbose=True)
optima = result["roots"]

print(f"{prob.name}")
print(f"optima_type : {prob.optima_type}")
print(f"Optima found: {len(optima)}")
```

Finding both maxima and minima for a `"both"` problem:

```python
from pysne.problems.benchmarks_multimodal import get_multimodal_problems
from pysne.problems.base import MinimizedProblem
from pysne.solver import solve_system

prob = get_multimodal_problems()[1]()   # Two-N-Minima, optima_type = "both"
_, params = prob.get_info()

maxima = solve_system(prob, params, verbose=False)["roots"]
minima = solve_system(MinimizedProblem(prob), params, verbose=False)["roots"]

print(f"Maxima: {len(maxima)} | Minima: {len(minima)}")
```

## Benchmark roster

The registry exposes both numeric IDs and convenient string keys.

| Key | Function | Vars | Search space | optima_type |
|-----|----------|:----:|--------------|:-----------:|
| `1` / `two_n_minima` | Two-N-Minima | 2 | `[-4, 4]²` | both |
| `2` | Six-Hump Camel Back | 2 | `[-1.9, 1.9] × [-1.1, 1.1]` | both |
| `3` / `rastrigin` | Rastrigin | 2 | `[-1, 1]²` | both |
| `4` | Rastrigin | 3 | `[-1, 1]³` | both |
| `5` | Vincent | 2 | `[0.25, 10]²` | max |
| `6` | Shubert | 2 | `[-10, 10]²` | max |
| `7` | Shubert | 3 | `[-10, 10]³` | max |
| `schwefel` | Schwefel 2.22 | 3 | `[-4, 6]³` | both |
| `griewank` | Griewank | 2 | `[-600, 600]²` | both |
| `iwm` | IWM project (applied) | 25 | task-specific bounds | both |

---

## Two-N-Minima

A separable quartic whose one-dimensional profile has two minima per axis, giving a small,
well-understood set of optima — a good first sanity check.

```text
g(x) = Σᵢ ½·(xᵢ⁴ − 16·xᵢ² + 5·xᵢ)
```

- **Search space:** `x₁, x₂ ∈ [-4, 4]`
- **optima_type:** both

## Six-Hump Camel Back

A canonical low-dimensional multimodal test function with six local optima, two of which are
global minima.

```text
g(x) = (4 − 2.1·x₁² + x₁⁴/3)·x₁² + x₁·x₂ + (−4 + 4·x₂²)·x₂²
```

- **Search space:** `x₁ ∈ [-1.9, 1.9]`, `x₂ ∈ [-1.1, 1.1]`
- **optima_type:** both

## Rastrigin (2D / 3D)

A highly multimodal function with a regular lattice of local minima — the standard stress test
for niching. Available in 2D (`3`) and 3D (`4`) variants over a compact box.

```text
g(x) = Σᵢ (xᵢ² − 10·cos(2π·xᵢ) + 10)
```

- **Search space:** `xᵢ ∈ [-1, 1]`
- **optima_type:** both

## Vincent

An oscillatory function on a log-scaled domain, with maxima whose spacing shrinks toward the
lower bound.

```text
g(x) = ½·(sin(10·ln x₁) + sin(10·ln x₂))
```

- **Search space:** `x₁, x₂ ∈ [0.25, 10]`
- **optima_type:** max

## Shubert (2D / 3D)

A separable product of cosine sums that produces a large number of global maxima — one of the
hardest counting tasks in the suite. Provided in 2D (`6`) and 3D (`7`).

```text
g(x) = − Πⱼ Σ_{i=1}^{5} i·cos((i + 1)·xⱼ + i)
```

- **Search space:** `xⱼ ∈ [-10, 10]`
- **optima_type:** max

## Schwefel 2.22

A convex-but-nonsmooth function combining an absolute-value sum with a product term; its single
minimum at the origin makes it a useful precision check in higher dimensions.

```text
g(x) = Σᵢ |xᵢ| + Πᵢ |xᵢ|
```

- **Search space:** `xᵢ ∈ [-4, 6]` (3D)
- **optima_type:** both

## Griewank

A function with many regularly spaced local minima over a very wide domain, testing robustness
to scale.

```text
g(x) = Σᵢ xᵢ²/4000 − Πᵢ cos(xᵢ / √i) + 1
```

- **Search space:** `x₁, x₂ ∈ [-600, 600]`
- **optima_type:** both

## IWM (applied problem)

An applied 25-dimensional case in which each variable is a task duration bounded by
project-specific limits, showing how the same multimodal machinery extends to real planning
problems. Retrieve it with the `"iwm"` key.

---

## Method

Multimodal problems reuse PySNE's **Clustering → SDOA → Selection** pipeline, with the selection
stage adapted for optima rather than roots: candidates are filtered against a global threshold
derived from the best objective value found (`F_star`) and the `gamma` parameter, then merged by
proximity (`delta`). See [Algorithms](../documentation/algorithms.md) for details.

## See also

[Nonlinear Systems (SNE)](nonlinear-systems.md){ .md-button .md-button--primary }
[Algorithms](../documentation/algorithms.md){ .md-button }
[Example Gallery](../examples/index.md){ .md-button }