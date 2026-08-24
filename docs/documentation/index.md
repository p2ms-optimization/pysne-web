# Documentation Overview

The PySNE documentation is organized into three main sections:

- **[Algorithms](algorithms.md)**: A conceptual overview of PySNE's three-phase pipeline (Iterative Clustering, Spiral Optimization, and Final Selection) and how it addresses different problem types.
- **[User Guide](user-guide.md)**: A practical walkthrough for defining and solving problems, including systems of equations, multimodal optimization, and Diophantine (integer-constrained) problems.
- **[API Reference](api-reference.md)**: Full function-level documentation of the solver, problem classes, hyperparameters, and internal components.

## Main concepts

- **Spiral Optimization (SPO)**: A local search technique that migrates a population of points toward a best point through a rotate-and-shrink transformation.
- **Iterative Clustering**: A technique to scatter and group candidate solutions, allowing the solver to locate *all* solutions simultaneously across the domain.
- **Problem Types**: PySNE natively handles systems of nonlinear equations (`SNEProblem`), general continuous optimization (`MultimodalProblem`), and integer-constrained optimization (`DiophantineProblem`).
- **Domain & Hyperparameters**: Problems are defined with continuous or integer bounds and tuned using a dictionary of parameters (e.g., `m_cluster`, `gamma`, `epsilon`, `delta`).
