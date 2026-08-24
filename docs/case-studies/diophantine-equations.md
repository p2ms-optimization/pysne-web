# Case Study: Diophantine Equations

PySNE extends its root-finding capabilities to integer domains through the **Diophantine Equations** case study, based on the research paper *"A method for finding numerical solutions to Diophantine equations using Spiral Optimization Algorithm with Clustering (SOAC)"* (Sumarti et al., 2023).

Diophantine equations are systems containing two or more unknowns where only integer solutions are required. The modified PySNE algorithm locates multiple integer roots simultaneously by executing the clustering and spiral optimization phases in a continuous space, but evaluating candidates as rounded integers.

## Running a Diophantine problem

Problems can be defined by subclassing `DiophantineProblem`. Here is how a simple linear Diophantine equation ($15x + 11y = 12$) is formulated and solved:

```python
import numpy as np
from pysne.problems.base import DiophantineProblem
from pysne.solver import solve_system

class Problem1(DiophantineProblem):
    @property
    def name(self):
        return "15x + 11y = 12 (Linear)"

    def get_equations(self):
        return [lambda var: 15*var[0] + 11*var[1] - 12]

    def get_info(self):
        domain = [(-50, 50), (-50, 50)]
        params = {
            'm_cluster': 475, 'k_cluster': 10, 'gamma': 0.01,
            'epsilon': 1e-7, 'delta': 0.1, 'spo_m': 30,
            'spo_k_max': 10, 'r': 0.95, 'theta': np.pi/4
        }
        return domain, params

problem = Problem1()
domain, params = problem.get_info()
result = solve_system(problem, params, verbose=True)

for i, root in enumerate(result["roots"]):
    print(f"Solution {i+1}: {root}")
```

## Benchmark roster

The methodology was tested across several benchmark problems of varying complexity, covering polynomials, exponential forms, and systems of linear/nonlinear equations. 

| Problem | Form | Vars | Search space | Expected roots |
|---------|------|:----:|--------------|:--------------:|
| 1 | Linear polynomial ($15x + 11y = 12$) | 2 | $[-50, 50]^2$ | 7 |
| 2a | Quadratic multivariable ($\sum_{i=1}^9 x_i^2 = 720$) | 9 | $[1, 26]^9$ | 84+ |
| 3 | High order polynomial ($x_1^3 + x_2^3 = 1008$) | 2 | $[1, 10]^2$ | 1 |
| 4 | Markoff-Hurwitz ($\sum x_i^2 = k \prod x_i$) | $n$ | Varies by $n, k$ | Varies |
| 5a | Ramanujan-Nagell ($x^2 + 7 = y^n$) | 3 | $x,y \in [1,500], n \in [3,50]$ | 7 |
| 9 | Pell Equation ($x^2 - ny^2 = k$) | 3 | $x \in [400, 500]$, $y,z \in [1, 100]$ | 1 |
| 10 | Linear Diophantine system (7 eqs) | 7 | $[-10, 10]^7$ | 1 |
| 12 | Nonlinear Diophantine system (9 eqs) | 10 | $[0, 10]^{10}$ | 1 |

---

## Problem 1 — Simple linear equation

A standard two-variable equation testing basic integer recovery over a bounded domain.
$$ 15x + 11y = 12 $$

- **Search space:** $x, y \in [-50, 50]$
- **Expected roots:** 7 (e.g., $(25, -33), (3, -3), (-19, 27)$)

## Problem 4 — Markoff-Hurwitz Equations

A generalized form of the Markoff equation. Solutions to this equation (with integer $x_i > 0$) are called Markoff numbers. The search space and number of expected solutions vary heavily depending on $n$ and $k$.
$$ x_1^2 + x_2^2 + \dots + x_n^2 = k x_1 x_2 \dots x_n $$

## Problem 5a — Ramanujan-Nagell Equation

An exponential Diophantine equation. 
$$ x^2 + 7 = y^n, \quad \text{where} \quad \text{gcd}(x, y) = 1, \ n \ge 3 $$

- **Search space:** $x \in [1, 500], n \in [3, 50]$
- **Expected roots:** 7 

## Problem 10 — System of Linear Diophantine Equations

A complex system of 7 linear equations with 7 variables, serving as a stress-test for algorithmic efficiency compared to discrete Particle Swarm Optimization (PSO).
$$
\begin{aligned}
x_1 - 1 &= 0 \\
3x_1 + x_2 - 6 &= 0 \\
4x_1 + 3x_2 + x_3 + x_5 - 15 &= 0 \\
3x_1 + 4x_2 + 3x_3 + x_4 + x_5 + x_6 - 20 &= 0 \\
\dots
\end{aligned}
$$

- **Search space:** $x_i \in [-10, 10]$ for $i = 1, \dots, 7$
- **Expected roots:** 1

---

## Method & validation

The Diophantine solver follows the same Iterative Clustering $\rightarrow$ SPO $\rightarrow$ Selection pipeline as continuous problems, with a critical distinction:
- **Integer Evaluation**: While points move through a continuous real space during clustering and spiral optimization (using a continuous buffer zone around integer bounds), their fitness is evaluated by rounding coordinates to the nearest integer.
- **Selection**: Candidates are definitively rounded and validated against the residual tolerance $\epsilon$. The Euclidean distance threshold $\delta$ ensures duplicate integer solutions found by different clusters are merged.

## See also

[Nonlinear Systems (SNE)](nonlinear-systems.md){ .md-button }
[Multimodal Benchmarks](multimodal-benchmarks.md){ .md-button }
[Algorithms](../documentation/algorithms.md){ .md-button .md-button--primary }
