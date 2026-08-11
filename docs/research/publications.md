# Publications

## PySNE undergraduate theses

`pysne` originated as two companion undergraduate theses (*Tugas Akhir*) at
Institut Teknologi Bandung, both supervised by the same advisor — who is
also a co-author of the foundational clustering paper the library builds
on (see [Foundational literature](#foundational-literature) below).

!!! note
    Both theses have been submitted and are pending graduation assessment.
    They are not yet publicly available; this page will be updated with a
    repository link / DOI once they are.

---

**Design of a Python Library for a Spiral Optimization Algorithm with
Clustering for Finding All Roots of Systems of Nonlinear Equations**

- Author: Aldy Nugraha Hermawan (NIM 10822012)
- Institut Teknologi Bandung, Actuarial Science Study Program
- Advisor: Adhe Kania, S.Si., M.Si., Ph.D.
- July 2026 — undergraduate thesis, submitted, pending graduation assessment

Covers the real- and integer-domain sides of `pysne`: the SNE root-finding
implementation of Spiral Optimization with Clustering (SPOC), the library's
low-discrepancy initialization methods, and its extension to integer
(Diophantine) problems. Compares several low-discrepancy sequences for
initializing the search and finds Korobov sequences give the most
consistent results, which is why they were adopted as the library's
default. Reports that SPOC in `pysne` recovers all reference roots across
the benchmark systems tested, and that the integer extension reproduces
known reference solutions while also surfacing additional numerically
valid ones in some cases.

---

**Design of a Python Library Based on the Spiral Optimization Algorithm
with Clustering for Finding All Optimal Solutions of Multimodal
Functions**

- Author: Azarya Benhanan Isriyanto (NIM 10822041)
- Institut Teknologi Bandung, Actuarial Science Study Program
- Advisor: Adhe Kania, S.Si., M.Si., Ph.D.
- July 2026 — undergraduate thesis, submitted, pending graduation assessment

Covers the multimodal-optimization side of `pysne`: combining SPOC with
Sobol-sequence sampling to locate every optimum (both peaks and valleys)
of a multimodal function in a single run, rather than just the global
optimum. Introduces the `num_check_points` multi-point-check parameter
specifically to prevent over-merging of clusters on aggressive,
closely-packed landscapes. Validated on standard benchmark functions from
low dimensions up to 8-D, reporting a 100% solution discovery rate across
the tested cases for both SNE and multimodal problems.

---

## Foundational literature

`pysne`'s core algorithm — Spiral Optimization with Clustering (SPOC) — is
built directly on this line of work:

- Tamura, K., Yasuda, K. (2011). *Spiral Dynamics Inspired Optimization.*
  Journal of Advanced Computational Intelligence and Intelligent
  Informatics, 15, 1116–1122.
  <br>The original spiral optimization algorithm that SPO is based on.

- Sidarto, K.A., Kania, A. (2015). *Finding all solutions of systems of
  nonlinear equations using spiral optimization with clustering.*
  Journal of Advanced Computational Intelligence and Intelligent
  Informatics, 19(5), 697–707.
  <br>Introduces the clustering technique `pysne`'s `SNEProblem` pipeline
  implements, for finding *all* roots of a nonlinear system in a single run.

The two theses above extend this same clustering idea in two directions
that `pysne` implements as separate problem types: general multimodal
optimization (`MultimodalProblem`) and integer-constrained problems
(`DiophantineProblem`).

## Related pages

- [Algorithms](../documentation/algorithms.md) — how SPOC/SPO and clustering work inside `pysne`.
- [References](references.md) — additional background reading.