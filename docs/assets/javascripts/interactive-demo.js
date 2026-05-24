(function () {
  function $(selector) { return document.querySelector(selector); }

  function initGraph() {
    const svg = $('#pysne-interactive-graph');
    if (!svg) return;

    const maxSolutions = $('#max-solutions');
    const tolerance = $('#tolerance');
    const showBasins = $('#show-basins');
    const randomize = $('#randomize-view');
    const label = $('#solution-label');

    const baseSolutions = [
      { x: -2.05, y: 1.55, c: '#ef4444' },
      { x: -1.55, y: -1.10, c: '#2563eb' },
      { x: -0.35, y: 0.45, c: '#0284c7' },
      { x: 0.75, y: 1.60, c: '#16a34a' },
      { x: 1.85, y: 0.20, c: '#f97316' },
      { x: 1.35, y: -1.40, c: '#7c3aed' },
      { x: -1.25, y: 0.85, c: '#0891b2' },
      { x: 0.00, y: -1.70, c: '#84cc16' },
      { x: 2.20, y: 1.15, c: '#db2777' },
      { x: -2.25, y: -0.25, c: '#0ea5e9' }
    ];

    function mapX(x) { return 60 + ((x + 3) / 6) * 620; }
    function mapY(y) { return 420 - ((y + 2.5) / 5) * 360; }

    function render() {
      const count = Math.max(2, parseInt(maxSolutions ? maxSolutions.value : 7, 10));
      const tol = tolerance ? tolerance.value : '1e-10';
      const basins = showBasins ? showBasins.checked : true;
      const solutions = baseSolutions.slice(0, count);
      let seedShift = Math.random() * 15;

      const contours = [];
      for (let i = 0; i < 20; i++) {
        const y = 80 + i * 16;
        const amp = 10 + i * 0.6;
        const d = `M 70 ${y} C 180 ${y - amp}, 230 ${y + amp + seedShift}, 330 ${y} S 500 ${y - amp}, 660 ${y + 5}`;
        contours.push(`<path d="${d}" fill="none" stroke="#cfe2f3" stroke-width="1" opacity="${0.35 + i * 0.018}"/>`);
      }

      const basinShapes = solutions.map((s, idx) => {
        const cx = mapX(s.x), cy = mapY(s.y);
        return `<ellipse cx="${cx}" cy="${cy}" rx="${54 + idx * 2}" ry="${34 + idx}" fill="${s.c}" opacity=".10"/>`;
      }).join('');

      const markers = solutions.map((s, idx) => {
        const cx = mapX(s.x), cy = mapY(s.y);
        return `<g class="solution-dot" data-index="${idx + 1}" data-x="${s.x}" data-y="${s.y}">
          <circle cx="${cx}" cy="${cy}" r="9" fill="${s.c}" opacity=".22"/>
          <circle cx="${cx}" cy="${cy}" r="6" fill="${s.c}" stroke="#fff" stroke-width="2"/>
        </g>`;
      }).join('');

      svg.innerHTML = `
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d8e7f4" stroke-width="1" opacity=".7"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="740" height="460" rx="14" fill="#ffffff"/>
        <rect x="40" y="40" width="660" height="380" fill="url(#grid)" opacity=".65"/>
        ${basins ? basinShapes : ''}
        ${contours.join('')}
        <line x1="60" y1="240" x2="680" y2="240" stroke="#9cb6ca" stroke-width="1"/>
        <line x1="370" y1="60" x2="370" y2="420" stroke="#9cb6ca" stroke-width="1"/>
        <text x="350" y="445" fill="#062b4f" font-size="15">x₁</text>
        <text x="22" y="240" fill="#062b4f" font-size="15">x₂</text>
        ${markers}
      `;

      svg.querySelectorAll('.solution-dot').forEach((dot) => {
        dot.addEventListener('mouseenter', function () {
          const index = this.dataset.index;
          const x = Number(this.dataset.x).toFixed(3);
          const y = Number(this.dataset.y).toFixed(3);
          if (label) label.textContent = `Solution #${index}: x₁=${x}, x₂=${y}, ||F(x)|| < ${tol}`;
        });
      });
    }

    [maxSolutions, tolerance, showBasins].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });
    if (randomize) randomize.addEventListener('click', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraph);
  } else {
    initGraph();
  }
})();
