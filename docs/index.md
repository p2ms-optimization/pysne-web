---
hide:
  - toc
---

<div class="pysne-hero">
  <div>
    <span class="pysne-eyebrow">Open Source</span>
    <h1 class="pysne-title">PySNE</h1>
    <div class="pysne-subtitle">Finding All Solutions of System of Nonlinear Equations</div>
    <p class="pysne-desc">
      PySNE is an open-source Python project for solving systems of nonlinear equations. It provides powerful algorithms, interactive visualization, and reproducible examples for research and education.
    </p>
    <div class="pysne-actions">
      <a class="md-button md-button--primary" href="getting-started/">Get Started →</a>
      <a class="md-button" href="github/">View on GitHub</a>
    </div>
  </div>
  <div class="pysne-visual-card">
    <svg class="pysne-surface-svg" viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nonlinear surface visualization">
      <defs>
        <linearGradient id="surf" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#dff2ff"/>
          <stop offset=".55" stop-color="#7bb9ee"/>
          <stop offset="1" stop-color="#0c5fa8"/>
        </linearGradient>
        <radialGradient id="dot" cx="40%" cy="35%" r="70%">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".4" stop-color="#28a8e0"/>
          <stop offset="1" stop-color="#043f73"/>
        </radialGradient>
      </defs>
      <rect width="760" height="440" rx="18" fill="#ffffff"/>
      <g transform="translate(50,38)">
        <path d="M90 255 C160 90 235 135 310 255 S470 420 585 250" fill="none" stroke="#d9e7f3" stroke-width="2"/>
        <path d="M85 290 C160 140 240 180 315 290 S475 410 600 285" fill="none" stroke="#c7dceb" stroke-width="2"/>
        <path d="M120 220 C190 60 250 120 330 220 S500 375 610 205" fill="url(#surf)" opacity=".88"/>
        <path d="M120 220 C190 60 250 120 330 220 S500 375 610 205 L610 280 C500 420 410 345 330 285 S185 155 120 290 Z" fill="url(#surf)" opacity=".7"/>
        <g opacity=".36" stroke="#064a82" stroke-width="1">
          <path d="M145 205 C225 265 350 275 590 220" fill="none"/>
          <path d="M155 180 C235 240 365 250 590 195" fill="none"/>
          <path d="M165 155 C245 215 380 225 580 170" fill="none"/>
          <path d="M175 130 C255 190 395 205 565 150" fill="none"/>
          <path d="M190 105 C270 165 410 180 545 130" fill="none"/>
        </g>
        <g opacity=".28" fill="none" stroke="#ee8b4a" stroke-width="2">
          <ellipse cx="180" cy="315" rx="58" ry="18"/>
          <ellipse cx="420" cy="340" rx="72" ry="22"/>
          <ellipse cx="540" cy="295" rx="58" ry="18"/>
        </g>
        <g>
          <circle cx="185" cy="165" r="13" fill="#f97316" stroke="#fff" stroke-width="4"/>
          <circle cx="305" cy="235" r="13" fill="url(#dot)" stroke="#fff" stroke-width="4"/>
          <circle cx="420" cy="335" r="13" fill="#16a34a" stroke="#fff" stroke-width="4"/>
          <circle cx="520" cy="120" r="13" fill="#7c3aed" stroke="#fff" stroke-width="4"/>
          <circle cx="595" cy="205" r="13" fill="#ef4444" stroke="#fff" stroke-width="4"/>
        </g>
        <text x="40" y="360" fill="#062b4f" font-size="18">x₁</text>
        <text x="620" y="350" fill="#062b4f" font-size="18">x₂</text>
        <text x="42" y="70" fill="#062b4f" font-size="18" transform="rotate(-90 42 70)">f(x₁, x₂)</text>
      </g>
    </svg>
  </div>
</div>

<div class="pysne-card-grid">
  <div class="pysne-card"><span class="pysne-icon">&lt;/&gt;</span><h3>Easy to Use</h3><p>Simple Python API to define nonlinear systems and find all solutions reliably.</p></div>
  <div class="pysne-card"><span class="pysne-icon">↗</span><h3>Interactive Visualization</h3><p>Explore solution spaces, convergence, and basins of attraction interactively.</p></div>
  <div class="pysne-card"><span class="pysne-icon">□</span><h3>Research Oriented</h3><p>Advanced algorithms and tools for complex systems and difficult problems.</p></div>
  <div class="pysne-card"><span class="pysne-icon">●</span><h3>Open Source</h3><p>Fully open source on GitHub with active community and reproducible examples.</p></div>
</div>

<h2 class="pysne-section-title">Explore PySNE</h2>

<div class="pysne-explore-grid">
  <a class="pysne-mini-card" href="getting-started/"><span class="pysne-icon">🚀</span><div><h3>Getting Started</h3><p>Install PySNE and solve your first system.</p></div></a>
  <a class="pysne-mini-card" href="examples/"><span class="pysne-icon">▦</span><div><h3>Examples</h3><p>Browse examples of nonlinear systems.</p></div></a>
  <a class="pysne-mini-card" href="case-studies/"><span class="pysne-icon">▥</span><div><h3>Case Studies</h3><p>Real-world problems and solutions.</p></div></a>
  <a class="pysne-mini-card" href="research/"><span class="pysne-icon">⚗</span><div><h3>Research</h3><p>Papers, preprints, and references.</p></div></a>
</div>

<div class="pysne-demo-grid">
  <div class="pysne-demo-card">
    <div class="pysne-thumb">
      <svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg"><rect width="460" height="170" fill="#f7fbff"/><g stroke="#cfe2f3" fill="none"><path d="M10 120 C100 60 155 140 230 90 S360 55 445 115"/><path d="M10 90 C100 35 155 110 230 65 S360 30 445 85"/><path d="M10 145 C100 85 155 160 230 115 S360 80 445 140"/></g><g><circle cx="90" cy="75" r="7" fill="#ef4444"/><circle cx="210" cy="95" r="7" fill="#2563eb"/><circle cx="330" cy="72" r="7" fill="#16a34a"/><circle cx="370" cy="120" r="7" fill="#f97316"/></g></svg>
    </div>
    <div class="pysne-demo-card-content"><h3>Interactive Graph Example</h3><p>Visualize solution sets of nonlinear systems in 2D.</p><p><a href="examples/interactive-graph/">Try the Interactive Graph →</a></p></div>
  </div>
  <div class="pysne-demo-card">
    <div class="pysne-thumb">
      <svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg"><rect width="460" height="170" fill="#fff"/><path d="M35 110 C95 25 150 80 205 105 S325 135 415 70" fill="none" stroke="#0b78bf" stroke-width="26" opacity=".55"/><path d="M35 130 C95 45 150 100 205 125 S325 155 415 90" fill="none" stroke="#062b4f" stroke-width="14" opacity=".45"/><circle cx="105" cy="52" r="9" fill="#f97316"/><circle cx="245" cy="93" r="9" fill="#7c3aed"/><circle cx="350" cy="111" r="9" fill="#16a34a"/></svg>
    </div>
    <div class="pysne-demo-card-content"><h3>Image Link Example</h3><p>Visualization of solutions for a polynomial system in 3D.</p><p><a href="examples/image-video-demo/">View Full Example →</a></p></div>
  </div>
  <div class="pysne-demo-card">
    <div class="pysne-thumb">
      <svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg"><rect width="460" height="170" fill="#062b4f"/><circle cx="230" cy="85" r="28" fill="#ef1f1f"/><polygon points="222,70 222,100 248,85" fill="#fff"/><g stroke="#38bdf8" opacity=".45"><line x1="70" y1="40" x2="165" y2="110"/><line x1="165" y1="110" x2="280" y2="60"/><line x1="280" y1="60" x2="390" y2="120"/></g></svg>
    </div>
    <div class="pysne-demo-card-content"><h3>YouTube Video Example</h3><p>Watch a quick demo of PySNE in action.</p><p><a href="examples/image-video-demo/">Watch on YouTube →</a></p></div>
  </div>
</div>
