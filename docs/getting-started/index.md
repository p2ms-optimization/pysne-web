# Getting Started

PySNE is designed to help researchers, students, and developers solve systems of nonlinear equations and explore the structure of their solutions.

## What PySNE provides

- A simple Python interface for defining nonlinear systems.
- Algorithms to search for multiple or all detected solutions.
- Visualization tools for solution landscapes and basins of attraction.
- Reproducible examples for education and research.

## Basic workflow

```python
import numpy as np
from pysne.problems.base import SNEProblem
from pysne.solver import solve

class MySystem(SNEProblem):
    @property
    def name(self):
        return "My system"

    def get_equations(self):
        return [
            lambda x: x[0]**2 + x[1]**2 - 1,
            lambda x: x[0] - np.exp(-x[1]),
        ]

    def get_info(self):
        domain = [(-2, 2), (-2, 2)]
        params = {"m_cluster": 250, "k_cluster": 10, "epsilon": 1e-7, "delta": 0.01}
        return domain, params

problem = MySystem()
domain, params = problem.get_info()
result = solve(problem, params)
print(result["roots"])
```
