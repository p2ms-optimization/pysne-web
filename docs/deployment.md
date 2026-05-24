# Deployment Guide

This website is designed to be deployed automatically to **GitHub Pages** from the `main` branch.

## Repository

Recommended web repository:

```text
https://github.com/p2ms-optimization/pysne-web
```

## GitHub Pages setting

After pushing this project to GitHub, open:

```text
Settings > Pages > Build and deployment > Source
```

Then choose:

```text
GitHub Actions
```

## Automatic deployment

The workflow file is located here:

```text
.github/workflows/static.yml
```

Every commit pushed to the `main` branch will run:

```bash
pip install -r requirements.txt
mkdocs build --strict
```

Then it uploads the generated `site/` folder and publishes it to GitHub Pages.

## Local preview

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

## Custom domain later

If PySNE later uses a custom domain, for example:

```text
pysne.org
```

add a file named `CNAME` inside the `docs/` folder containing only the domain name:

```text
pysne.org
```

Then update `site_url` in `mkdocs.yml`.
