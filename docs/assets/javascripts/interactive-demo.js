(function () {
  function $(selector) { return document.querySelector(selector); }

  function initGraph() {
    const svg = $('#pysne-interactive-graph');
    if (!svg) return;

    const maxSolutions = $('#max-solutions');
    const systemSelector = $('#system-selector');
    const label = $('#solution-label');

    let currentData = { roots: [], f1_paths: [], f2_paths: [] };

    // Pan and Zoom State
    let viewBox = { x: 0, y: 0, w: 740, h: 460 };
    let isPanning = false;
    let startPoint = { x: 0, y: 0 };

    function updateViewBox() {
      svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    }

    svg.addEventListener('mousedown', e => {
      isPanning = true;
      startPoint = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', e => {
      if (!isPanning) return;
      const dx = (e.clientX - startPoint.x) * (viewBox.w / svg.clientWidth);
      const dy = (e.clientY - startPoint.y) * (viewBox.h / svg.clientHeight);
      viewBox.x -= dx;
      viewBox.y -= dy;
      startPoint = { x: e.clientX, y: e.clientY };
      updateViewBox();
    });

    window.addEventListener('mouseup', () => { isPanning = false; });

    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomIntensity = 0.1;
      const wheel = e.deltaY < 0 ? 1 : -1;
      const zoom = Math.exp(wheel * zoomIntensity);

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const svgX = viewBox.x + (mouseX / rect.width) * viewBox.w;
      const svgY = viewBox.y + (mouseY / rect.height) * viewBox.h;

      viewBox.w /= zoom;
      viewBox.h /= zoom;
      viewBox.x = svgX - (mouseX / rect.width) * viewBox.w;
      viewBox.y = svgY - (mouseY / rect.height) * viewBox.h;

      updateViewBox();
    }, { passive: false });


    function render() {
      const count = Math.max(0, parseInt(maxSolutions ? maxSolutions.value : 7, 10));
      let solutions = currentData.roots ? currentData.roots.slice(0, count) : [];
      let contoursHTML = "";
      
      if (currentData.f1_paths) {
        contoursHTML += currentData.f1_paths.map(d => `<path d="${d}" fill="none" stroke="#2563eb" stroke-width="1.5" opacity="0.4" />`).join('');
      }
      if (currentData.f2_paths) {
        contoursHTML += currentData.f2_paths.map(d => `<path d="${d}" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.4" />`).join('');
      }

      const markers = solutions.map((s, idx) => {
        return `<g class="solution-dot" data-index="${idx + 1}" data-x="${s.x}" data-y="${s.y}">
          <circle cx="${s.map_x}" cy="${s.map_y}" r="9" fill="${s.c}" opacity=".22"/>
          <circle cx="${s.map_x}" cy="${s.map_y}" r="6" fill="${s.c}" stroke="#fff" stroke-width="2"/>
        </g>`;
      }).join('');

      svg.innerHTML = `
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d8e7f4" stroke-width="1" opacity=".7"/>
          </pattern>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="#ffffff"/>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" opacity=".65"/>
        ${contoursHTML}
        ${markers}
      `;

      svg.querySelectorAll('.solution-dot').forEach((dot) => {
        dot.addEventListener('mouseenter', function () {
          const index = this.dataset.index;
          const x = Number(this.dataset.x).toFixed(3);
          const y = Number(this.dataset.y).toFixed(3);
          if (label) label.textContent = `Solution #${index}: x₁=${x}, x₂=${y}`;
        });
      });
    }

    function loadSystem(id) {
      fetch(`../../assets/data/problem${id}-roots.json`)
        .then(r => r.json())
        .then(data => {
          currentData = data;
          
          // Reset viewbox when changing systems
          viewBox = { x: 0, y: 0, w: 740, h: 460 };
          updateViewBox();

          // Update slider max to actual number of roots
          if (maxSolutions && data.roots) {
            maxSolutions.max = data.roots.length;
            if (parseInt(maxSolutions.value, 10) > data.roots.length) {
              maxSolutions.value = data.roots.length;
            }
          }
          
          render();
        })
        .catch(err => console.error("Failed to load real roots:", err));
    }

    if (maxSolutions) {
      maxSolutions.addEventListener('input', render);
      maxSolutions.addEventListener('change', render);
    }

    if (systemSelector) {
      systemSelector.addEventListener('change', (e) => loadSystem(e.target.value));
      loadSystem(systemSelector.value); // initial load
    } else {
      loadSystem(1); // fallback
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraph);
  } else {
    initGraph();
  }
})();
