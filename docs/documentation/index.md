# Documentation Overview

PySNE documentation is organized around four key areas:

1. Defining nonlinear systems.
2. Searching for all solutions.
3. Validating convergence and residuals.
4. Visualizing the solution landscape.

## Main concepts

- **System**: a set of nonlinear equations.
- **Variable bounds**: search space for candidate solutions.
- **Residual**: value of `||F(x)||`, used to validate whether a point is a solution.
- **Basin of attraction**: region of initial points that converge to the same solution.
