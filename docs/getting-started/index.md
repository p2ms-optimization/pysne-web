# Getting Started

PySNE is designed to help researchers, students, and developers solve systems of nonlinear equations and explore the structure of their solutions.

## What PySNE provides

- A simple Python interface for defining nonlinear systems.
- Algorithms to search for multiple or all detected solutions.
- Visualization tools for solution landscapes and basins of attraction.
- Reproducible examples for education and research.

## Basic workflow

```python
import pysne as ps

system = ps.System([
    "x**2 + y**2 - 1",
    "x - exp(-y)"
])

solutions = ps.solve_all(system, bounds=[(-2, 2), (-2, 2)])
print(solutions)
```

!!! note
    This is starter documentation content. Replace the API examples with your real PySNE implementation when the package is ready.
