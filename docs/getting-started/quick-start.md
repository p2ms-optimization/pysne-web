# Quick Start

This example solves a nonlinear system in two variables.

```python
from pysne.problems.base import SNEProblem
from pysne.solver import solve

class MySystem(SNEProblem):
    @property
    def name(self):
        return "Circle and parabola"

    def get_equations(self):
        return [
            lambda x: x[0]**2 + x[1]**2 - 1,
            lambda x: x[0] - x[1]**2,
        ]

    def get_info(self):
        domain = [(-2, 2), (-2, 2)]
        params = {"m_cluster": 250, "k_cluster": 10, "epsilon": 1e-7, "delta": 0.01}
        return domain, params

problem = MySystem()
domain, params = problem.get_info()
result = solve(problem, params, verbose=True)

for root in result["roots"]:
    print(root)
```

