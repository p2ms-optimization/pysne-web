# Quick Start

This example solves a nonlinear system in two variables.

```python
import pysne as ps

system = ps.System([
    lambda x: x[0]**2 + x[1]**2 - 1,
    lambda x: x[0] - x[1]**2
])

solutions = ps.solve_all(
    system,
    bounds=[(-2, 2), (-2, 2)],
    tolerance=1e-10,
    max_solutions=20,
)

for solution in solutions:
    print(solution)
```

Next, open the [Interactive Graph Demo](../examples/interactive-graph.md) to explore a visual example.
