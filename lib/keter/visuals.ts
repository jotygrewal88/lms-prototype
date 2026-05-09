// Keter / Anderson static SVG diagram strings. Each export is a complete,
// self-contained <svg> element that the SlideFrame renders via
// dangerouslySetInnerHTML when a slide sets `diagram` to one of these values.
//
// Color palette (matches the prototype's Tailwind accent + semantic palette):
//   Neutral structural lines + text: #475569 (slate-600)
//   Light fills / backgrounds:       #F1F5F9 (slate-100)
//   Amber  (energy / warning):       fill #FEF3C7, stroke #D97706, text #92400E
//   Blue   (informational):          fill #DBEAFE, stroke #2563EB, text #1E3A8A
//   Teal   (process / secondary):    fill #CCFBF1, stroke #0D9488, text #115E59
//   Coral  (heat / active):          fill #FFE4E6, stroke #E11D48, text #881337
//   Green  (safe / success):         fill #DCFCE7, stroke #16A34A, text #14532D
//   Red    (critical / danger):      fill #FEE2E2, stroke #DC2626, text #7F1D1D
//   Purple (highlight / spare):      fill #EDE9FE, stroke #7C3AED, text #4C1D95
//
// Slide-mounted diagrams (rendered inside SlideFrame's diagram container)
// use viewBox aspect ratios near 2.7–3.1 to fill the container's effective
// 16:9 inner box (~856 × 315) without leaving large empty horizontal
// margins. Inline figures (used inside markdown text sections) use whatever
// aspect their data calls for since they render at natural height.
//
// All SVGs use width="100%", transparent backgrounds, and font-family
// ui-sans-serif, system-ui, sans-serif. Colors are inlined (no CSS classes)
// so the SVG is portable into any container.

export const pressEnergySources: string = `<svg width="100%" viewBox="0 0 900 290" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <polygon points="475,88 545,88 520,118 500,118" fill="none" stroke="#475569" stroke-width="1"/>
  <rect x="285" y="100" width="120" height="115" rx="6" fill="none" stroke="#475569" stroke-width="1"/>
  <text x="345" y="153" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">Clamp unit</text>
  <text x="345" y="171" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">(mold area)</text>
  <rect x="425" y="120" width="220" height="70" rx="6" fill="none" stroke="#475569" stroke-width="1"/>
  <text x="535" y="160" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">Injection unit</text>
  <rect x="265" y="215" width="400" height="22" rx="4" fill="none" stroke="#475569" stroke-width="1" opacity="0.6"/>
  <text x="465" y="262" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">Press #12 (350-ton)</text>
  <rect x="20" y="20" width="190" height="56" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="115" y="44" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">Electrical</text>
  <text x="115" y="62" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">Main panel, heaters</text>
  <line x1="210" y1="55" x2="288" y2="105" stroke="#475569" stroke-width="0.5" stroke-dasharray="4 3" marker-end="url(#arrow1)"/>
  <rect x="690" y="20" width="190" height="56" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="0.5"/>
  <text x="785" y="44" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">Hydraulic</text>
  <text x="785" y="62" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">Clamp, accumulator</text>
  <line x1="690" y1="55" x2="640" y2="125" stroke="#475569" stroke-width="0.5" stroke-dasharray="4 3" marker-end="url(#arrow1)"/>
  <rect x="20" y="220" width="190" height="56" rx="8" fill="#CCFBF1" stroke="#0D9488" stroke-width="0.5"/>
  <text x="115" y="244" text-anchor="middle" fill="#115E59" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">Pneumatic</text>
  <text x="115" y="262" text-anchor="middle" fill="#115E59" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">Ejection, core pulls</text>
  <line x1="210" y1="240" x2="280" y2="225" stroke="#475569" stroke-width="0.5" stroke-dasharray="4 3" marker-end="url(#arrow1)"/>
  <rect x="690" y="220" width="190" height="56" rx="8" fill="#FFE4E6" stroke="#E11D48" stroke-width="0.5"/>
  <text x="785" y="244" text-anchor="middle" fill="#881337" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">Thermal</text>
  <text x="785" y="262" text-anchor="middle" fill="#881337" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">Barrel, mold</text>
  <line x1="690" y1="240" x2="640" y2="195" stroke="#475569" stroke-width="0.5" stroke-dasharray="4 3" marker-end="url(#arrow1)"/>
</svg>`;

export const lotoSequence: string = `<svg width="100%" viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <rect x="20" y="50" width="142" height="120" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="91" y="92" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">1. Notify</text>
  <text x="91" y="120" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Operators,</text>
  <text x="91" y="138" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">supervisor,</text>
  <text x="91" y="156" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">maintenance lead</text>
  <line x1="162" y1="110" x2="180" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow2)"/>
  <rect x="184" y="50" width="142" height="120" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="255" y="92" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">2. Shut down</text>
  <text x="255" y="120" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">End cycle,</text>
  <text x="255" y="138" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">retract clamp,</text>
  <text x="255" y="156" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">main power off</text>
  <line x1="326" y1="110" x2="344" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow2)"/>
  <rect x="348" y="50" width="142" height="120" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="0.5"/>
  <text x="419" y="92" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">3. Isolate energy</text>
  <text x="419" y="120" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Electrical, hydraulic,</text>
  <text x="419" y="138" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">pneumatic, thermal</text>
  <text x="419" y="156" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">— all four sources</text>
  <line x1="490" y1="110" x2="508" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow2)"/>
  <rect x="512" y="50" width="142" height="120" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="0.5"/>
  <text x="583" y="92" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">4. Lock &amp; tag</text>
  <text x="583" y="120" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">One lock per worker,</text>
  <text x="583" y="138" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">dated tag, group</text>
  <text x="583" y="156" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">lockout if needed</text>
  <line x1="654" y1="110" x2="672" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow2)"/>
  <rect x="676" y="50" width="104" height="120" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="0.5"/>
  <text x="728" y="92" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">5. Verify</text>
  <text x="728" y="110" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">zero state</text>
  <text x="728" y="138" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Try-test-try.</text>
  <text x="728" y="156" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Gauges read zero.</text>
  <text x="400" y="200" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-style="italic">All five steps required, in order, before any work begins on the press</text>
</svg>`;

export const injectionMoldingCycle: string = `<svg width="100%" viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <text x="400" y="28" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="500">Continuous cycle — repeats every 30–90 seconds</text>
  <rect x="35" y="60" width="160" height="100" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="115" y="100" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">Clamping</text>
  <text x="115" y="124" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Mold closes</text>
  <text x="115" y="142" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">~5% of cycle</text>
  <line x1="195" y1="110" x2="225" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow3)"/>
  <rect x="225" y="60" width="160" height="100" rx="8" fill="#FFE4E6" stroke="#E11D48" stroke-width="0.5"/>
  <text x="305" y="100" text-anchor="middle" fill="#881337" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">Injection &amp; Hold</text>
  <text x="305" y="124" text-anchor="middle" fill="#881337" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Plastic injected</text>
  <text x="305" y="142" text-anchor="middle" fill="#881337" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">~10–15% of cycle</text>
  <line x1="385" y1="110" x2="415" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow3)"/>
  <rect x="415" y="60" width="160" height="100" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="0.5"/>
  <text x="495" y="100" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">Cooling</text>
  <text x="495" y="124" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Part solidifies</text>
  <text x="495" y="142" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">~50–70% of cycle</text>
  <line x1="575" y1="110" x2="605" y2="110" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow3)"/>
  <rect x="605" y="60" width="160" height="100" rx="8" fill="#CCFBF1" stroke="#0D9488" stroke-width="0.5"/>
  <text x="685" y="100" text-anchor="middle" fill="#115E59" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">Ejection &amp; Reset</text>
  <text x="685" y="124" text-anchor="middle" fill="#115E59" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Mold opens, part out</text>
  <text x="685" y="142" text-anchor="middle" fill="#115E59" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">~5–10% of cycle</text>
  <path d="M 685 160 Q 685 220 400 220 Q 115 220 115 160" fill="none" stroke="#475569" stroke-width="0.5" stroke-dasharray="4 3" marker-end="url(#arrow3)"/>
  <text x="400" y="247" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-style="italic">Cycle repeats</text>
</svg>`;

export const defectWorkflow: string = `<svg width="100%" viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <rect x="20" y="100" width="170" height="76" rx="8" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="105" y="132" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">1. Identify</text>
  <text x="105" y="156" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Spot the defect</text>
  <line x1="190" y1="138" x2="220" y2="138" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow4)"/>
  <rect x="220" y="100" width="170" height="76" rx="8" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="305" y="132" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">2. Classify</text>
  <text x="305" y="156" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Match defect type</text>
  <line x1="390" y1="138" x2="420" y2="138" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow4)"/>
  <rect x="420" y="100" width="170" height="76" rx="8" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="505" y="132" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600">3. Check parameters</text>
  <text x="505" y="156" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Compare to setpoint</text>
  <line x1="590" y1="138" x2="620" y2="55" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow4)"/>
  <line x1="590" y1="138" x2="620" y2="221" stroke="#475569" stroke-width="0.5" marker-end="url(#arrow4)"/>
  <rect x="620" y="20" width="160" height="64" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="0.5"/>
  <text x="700" y="46" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="600">4a. Adjust</text>
  <text x="700" y="68" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Within ±5% authority</text>
  <rect x="620" y="192" width="160" height="64" rx="8" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.5"/>
  <text x="700" y="218" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="600">4b. Escalate</text>
  <text x="700" y="240" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Notify technician</text>
</svg>`;

export const criticalityMatrix: string = `<svg width="100%" viewBox="0 0 1000 320" xmlns="http://www.w3.org/2000/svg">
  <text x="540" y="22" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">Replacement Lead Time →</text>
  <text x="310" y="42" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Short (in stock)</text>
  <text x="770" y="42" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Long (weeks / months)</text>
  <text x="40" y="170" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" transform="rotate(-90 40 170)">↑ Failure Impact</text>
  <text x="90" y="115" text-anchor="end" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">High</text>
  <text x="90" y="235" text-anchor="end" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Low</text>
  <rect x="100" y="60" width="440" height="120" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="320" y="103" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="600">Standard inventory</text>
  <text x="320" y="129" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">High impact, short lead</text>
  <text x="320" y="147" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Stock per consumption</text>
  <rect x="540" y="60" width="440" height="120" fill="#EDE9FE" stroke="#7C3AED" stroke-width="1.2"/>
  <text x="760" y="103" text-anchor="middle" fill="#4C1D95" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="600">Critical Spares</text>
  <text x="760" y="129" text-anchor="middle" fill="#4C1D95" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">High impact, long lead</text>
  <text x="760" y="147" text-anchor="middle" fill="#4C1D95" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Always stocked</text>
  <rect x="100" y="180" width="440" height="120" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="320" y="223" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="600">Consumables</text>
  <text x="320" y="249" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Low impact, short lead</text>
  <text x="320" y="267" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Reorder as needed</text>
  <rect x="540" y="180" width="440" height="120" fill="#F1F5F9" stroke="#475569" stroke-width="0.5"/>
  <text x="760" y="223" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="600">Don&apos;t stock</text>
  <text x="760" y="249" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Low impact, long lead</text>
  <text x="760" y="267" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Not worth carrying</text>
</svg>`;

export const stockoutCostCascade: string = `<svg width="100%" viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="40" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">First 24 hours after failure</text>
  <line x1="180" y1="80" x2="640" y2="80" stroke="#475569" stroke-width="0.5"/>
  <text x="180" y="68" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">0h</text>
  <text x="295" y="68" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">6h</text>
  <text x="410" y="68" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">12h</text>
  <text x="525" y="68" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">18h</text>
  <text x="640" y="68" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">24h+</text>
  <line x1="180" y1="76" x2="180" y2="84" stroke="#475569" stroke-width="0.5"/>
  <line x1="295" y1="76" x2="295" y2="84" stroke="#475569" stroke-width="0.5"/>
  <line x1="410" y1="76" x2="410" y2="84" stroke="#475569" stroke-width="0.5"/>
  <line x1="525" y1="76" x2="525" y2="84" stroke="#475569" stroke-width="0.5"/>
  <line x1="640" y1="76" x2="640" y2="84" stroke="#475569" stroke-width="0.5"/>
  <text x="40" y="124" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500">Planned replacement</text>
  <text x="40" y="142" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">(in stock)</text>
  <rect x="180" y="110" width="40" height="40" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="0.5"/>
  <text x="200" y="135" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">2h</text>
  <text x="40" y="194" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500">Stockout</text>
  <text x="40" y="212" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">overnight expedite</text>
  <rect x="180" y="180" width="345" height="40" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.5"/>
  <text x="352" y="205" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" dominant-baseline="central">~16h downtime + 30–60% expedite premium</text>
  <text x="40" y="264" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500">Stockout</text>
  <text x="40" y="282" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">long lead time</text>
  <rect x="180" y="250" width="460" height="40" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.5"/>
  <text x="410" y="275" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" dominant-baseline="central">Days to weeks + cascade to delayed PMs</text>
  <text x="650" y="275" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">→</text>
  <text x="340" y="330" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">A single stockout cascades into 4–10x the cost of a planned replacement</text>
</svg>`;

export const inventoryHealthChart: string = `<svg width="100%" viewBox="0 0 680 280" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="40" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">Anderson plant inventory health (2,572 records)</text>
  <rect x="40" y="80" width="377" height="60" fill="#DCFCE7" stroke="#16A34A" stroke-width="0.5"/>
  <text x="228" y="106" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">1,617</text>
  <text x="228" y="124" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">In stock (62.9%)</text>
  <rect x="417" y="80" width="215" height="60" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.5"/>
  <text x="524" y="106" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">920</text>
  <text x="524" y="124" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">Out of stock (35.8%)</text>
  <rect x="632" y="80" width="8" height="60" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <line x1="636" y1="80" x2="600" y2="180" stroke="#475569" stroke-width="0.5" stroke-dasharray="3 2"/>
  <rect x="500" y="180" width="160" height="44" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="580" y="200" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500" dominant-baseline="central">Low stock: 34</text>
  <text x="580" y="216" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" dominant-baseline="central">No stock: 1</text>
  <text x="40" y="260" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">36% of all inventory is currently unavailable. Source: Anderson plant snapshot, last 30 days</text>
</svg>`;

export const workOrderQualityChart: string = `<svg width="100%" viewBox="0 0 680 380" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="40" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">Anderson work order note quality (22,740 historical orders)</text>
  <line x1="200" y1="80" x2="200" y2="280" stroke="#475569" stroke-width="0.5"/>
  <line x1="200" y1="280" x2="640" y2="280" stroke="#475569" stroke-width="0.5"/>
  <rect x="220" y="140" width="100" height="140" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.5"/>
  <text x="270" y="130" text-anchor="middle" fill="#7F1D1D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">35%</text>
  <text x="270" y="298" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">No note /</text>
  <text x="270" y="314" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">one word</text>
  <rect x="330" y="120" width="100" height="160" fill="#FEF3C7" stroke="#D97706" stroke-width="0.5"/>
  <text x="380" y="110" text-anchor="middle" fill="#92400E" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">40%</text>
  <text x="380" y="298" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Short note</text>
  <rect x="440" y="200" width="100" height="80" fill="#DBEAFE" stroke="#2563EB" stroke-width="0.5"/>
  <text x="490" y="190" text-anchor="middle" fill="#1E3A8A" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">20%</text>
  <text x="490" y="298" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Detailed</text>
  <rect x="550" y="260" width="100" height="20" fill="#DCFCE7" stroke="#16A34A" stroke-width="0.5"/>
  <text x="600" y="250" text-anchor="middle" fill="#14532D" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="500">5%</text>
  <text x="600" y="298" text-anchor="middle" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Exemplary</text>
  <text x="190" y="80" text-anchor="end" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">% of orders</text>
  <text x="40" y="350" fill="#475569" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">Only 25% of historical work orders contain enough detail to support root-cause analysis</text>
</svg>`;
