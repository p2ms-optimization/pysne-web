# PySNE Web

MkDocs website for **PySNE: Finding All Solutions of System of Nonlinear Equations**.

Recommended repositories:

- Code: <https://github.com/p2ms-optimization/pysne>
- Website: <https://github.com/p2ms-optimization/pysne-web>

## Local development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Open:

```text
http://127.0.0.1:8000
```

## Build

```bash
mkdocs build --strict
```

The generated static site will be available in the `site/` folder.

## Deploy to GitHub Pages

This project includes:

```text
.github/workflows/static.yml
```

Push to the `main` branch, then enable GitHub Pages source as **GitHub Actions** in repository settings.
