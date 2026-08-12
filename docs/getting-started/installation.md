# Installation

Install PySNE from PyPI when available:

```bash
pip install pysne
```

For development version:

```bash
git clone https://github.com/p2ms-optimization/pysne.git
cd pysne
pip install -e .
```

## Requirements

- Python 3.8 or newer
- NumPy
- SciPy

Plotting (see [Visualization](../examples/visualization.md)) needs
matplotlib, which is an optional extra rather than a core dependency:

```bash
pip install pysne[plot]
```
