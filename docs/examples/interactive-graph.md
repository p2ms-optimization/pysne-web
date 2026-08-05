# Interactive Graph Demo

Visualize solution sets of nonlinear systems in 2D. Each marker represents a solution where `F(x) = 0`.

<div class="interactive-panel">
  <div>
    <div class="graph-stage">
      <svg id="pysne-interactive-graph" viewBox="0 0 740 460" role="img" aria-label="Interactive nonlinear system graph"></svg>
    </div>
    <div class="graph-note">
      <strong id="solution-label">Hover a solution marker to inspect its coordinates.</strong><br>
      This demo visualizes detected solutions, approximate contour lines, and basin-like regions. You can replace this mock visualization with real PySNE output later.
    </div>
  </div>
  <div class="graph-controls">
    <label>System
      <select id="system-selector">
        <option value="1">Problem 1 (2D)</option>
        <option value="2">Problem 2 (2D)</option>
        <option value="7">Problem 7 (1D Weierstrass)</option>
      </select>
    </label>
    <label>Max Solutions
      <input id="max-solutions" type="range" min="0" max="16" value="7">
    </label>

  </div>
</div>

## Sample Python usage

```python
import pysne as ps

system = ps.System([
    lambda x: x[0]**2 + x[1] - 1,
    lambda x: x[0] - x[1]**2
])

solutions = ps.solve_all(
    system,
    bounds=[(-3, 3), (-3, 3)],
    tolerance=1e-10,
    max_solutions=50
)

ps.plot_solutions(system, solutions)
```
