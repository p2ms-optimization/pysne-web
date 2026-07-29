# Case Study: Multimodal Benchmarks

Beyond systems of equations, PySNE can locate **many optima of a single objective function** —
the multimodal optimisation task. These benchmarks live in
`pysne.problems.benchmarks_multimodal` and are the standard functions used to test niching and
multi-solution optimisers (Rastrigin, Shubert, Six-Hump Camel Back, and more).

!!! abstract "How this differs from the SNE benchmarks"
    In the [SNE suite](nonlinear-systems.md) the goal is to solve \(F(\mathbf{x}) = 0\), and
    problems carry an `expected_roots` target. Here the goal is to find **all optima** of
    \(g(\mathbf{x})\), so each problem instead declares an `optima_type`:

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
| `1` / `two_n_minima` | Two-N-Minima | 2 | \([-4, 4]^2\) | both |
| `2` | Six-Hump Camel Back | 2 | \([-1.9, 1.9] \times [-1.1, 1.1]\) | both |
| `3` / `rastrigin` | Rastrigin | 2 | \([-1, 1]^2\) | both |
| `4` | Rastrigin | 3 | \([-1, 1]^3\) | both |
| `5` | Vincent | 2 | \([0.25, 10]^2\) | max |
| `6` | Shubert | 2 | \([-10, 10]^2\) | max |
| `7` | Shubert | 3 | \([-10, 10]^3\) | max |
| `schwefel` | Schwefel 2.22 | 3 | \([-4, 6]^3\) | both |
| `griewank` | Griewank | 2 | \([-600, 600]^2\) | both |
| `iwm` | IWM project (applied) | 25 | task-specific bounds | both |

---

## Two-N-Minima

A separable quartic whose one-dimensional profile has two minima per axis, giving a small,
well-understood set of optima — a good first sanity check.

\[
g(\mathbf{x}) = \sum_{i} \frac{1}{2}\left(x_i^4 - 16 x_i^2 + 5 x_i\right)
\]

- **Search space:** \(x_1, x_2 \in [-4, 4]\)
- **optima_type:** both

## Six-Hump Camel Back

A canonical low-dimensional multimodal test function with six local optima, two of which are
global minima.

\[
g(\mathbf{x}) = \left(4 - 2.1 x_1^2 + \frac{x_1^4}{3}\right) x_1^2 + x_1 x_2 + \left(-4 + 4 x_2^2\right) x_2^2
\]

- **Search space:** \(x_1 \in [-1.9, 1.9]\), \(x_2 \in [-1.1, 1.1]\)
- **optima_type:** both

## Rastrigin (2D / 3D)

A highly multimodal function with a regular lattice of local minima — the standard stress test
for niching. Available in 2D (`3`) and 3D (`4`) variants over a compact box.

\[
g(\mathbf{x}) = \sum_{i} \left(x_i^2 - 10 \cos(2\pi x_i) + 10\right)
\]

- **Search space:** \(x_i \in [-1, 1]\)
- **optima_type:** both

## Vincent

An oscillatory function on a log-scaled domain, with maxima whose spacing shrinks toward the
lower bound.

\[
g(\mathbf{x}) = \frac{1}{2}\left(\sin(10 \ln x_1) + \sin(10 \ln x_2)\right)
\]

- **Search space:** \(x_1, x_2 \in [0.25, 10]\)
- **optima_type:** max

## Shubert (2D / 3D)

A separable product of cosine sums that produces a large number of global maxima — one of the
hardest counting tasks in the suite. Provided in 2D (`6`) and 3D (`7`).

\[
g(\mathbf{x}) = -\prod_{j} \sum_{i=1}^{5} i \cos\left((i + 1) x_j + i\right)
\]

- **Search space:** \(x_j \in [-10, 10]\)
- **optima_type:** max

## Schwefel 2.22

A convex-but-nonsmooth function combining an absolute-value sum with a product term; its single
minimum at the origin makes it a useful precision check in higher dimensions.

\[
g(\mathbf{x}) = \sum_{i} |x_i| + \prod_{i} |x_i|
\]

- **Search space:** \(x_i \in [-4, 6]\) (3D)
- **optima_type:** both

## Griewank

A function with many regularly spaced local minima over a very wide domain, testing robustness
to scale.

\[
g(\mathbf{x}) = \sum_{i} \frac{x_i^2}{4000} - \prod_{i} \cos\left(\frac{x_i}{\sqrt{i}}\right) + 1
\]

- **Search space:** \(x_1, x_2 \in [-600, 600]\)
- **optima_type:** both

## IWM (applied problem)

An applied 25-dimensional case in which each variable is a task duration bounded by
project-specific limits, showing how the same multimodal machinery extends to real planning
problems. Retrieve it with the `"iwm"` key.

---

## Method

Multimodal problems reuse PySNE's **Clustering → SPO → Selection** pipeline, with the selection
stage adapted for optima rather than roots: candidates are filtered against a global threshold
derived from the best objective value found (\(F^*\)) and the `gamma` parameter, then merged by
proximity (\(\delta\)). See [Algorithms](../documentation/algorithms.md) for details.

## See also

[Nonlinear Systems (SNE)](nonlinear-systems.md){ .md-button .md-button--primary }
[Algorithms](../documentation/algorithms.md){ .md-button }
[Example Gallery](../examples/index.md){ .md-button }