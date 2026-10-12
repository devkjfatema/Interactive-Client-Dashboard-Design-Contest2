/* =============================================================================
   The Styling Studio — Interactive Virtual Wardrobe
   Plain JavaScript version (converted from the React / TypeScript / Vite project).

   Sections
     1. Helpers & icons
     2. Data (garments, motion presets, client, drawers, chat)
     3. Background removal      (was utils/backgroundRemoval.ts)
     4. Cloth simulation        (was utils/clothSimulation.ts)
     5. Mesh renderer           (was utils/meshRenderer.ts)
     6. Wardrobe scene drawing  (was utils/wardrobeScene.ts)
     7. Wardrobe stage          (was WardrobeStage.tsx + useWardrobeStage.ts)
     8. Toasts                  (was sonner)
     9. App state & UI components
   ============================================================================= */
(function () {
  'use strict';

  /* ===========================================================================
     1. HELPERS & ICONS
     ========================================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /** Lucide icon paths (lucide-react 0.522.0). */
  const ICONS = {
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'image-plus': '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
  };

  /** Returns an inline <svg> string for a Lucide icon. */
  function icon(name, className = '', label = '') {
    const a11y = label ? `aria-label="${esc(label)}"` : 'aria-hidden="true"';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name} ${className}" ${a11y}>${ICONS[name]}</svg>`;
  }

  /** Resolves an image: embedded data URI (assets.js) first, plain file in /images as the fallback. */
  function asset(file) {
    return (window.WEARDROP_ASSETS && window.WEARDROP_ASSETS[file]) || 'images/' + file;
  }

  /** Re-triggers a CSS transition-based reflow helper. */
  function reflow(el) {
    return el.offsetWidth;
  }

  /* ===========================================================================
     2. DATA
     ========================================================================= */

  const initialGarments = [
    { id: 'g-navy-blazer', name: 'Navy Blazer', category: 'tailoring', presetId: 'tailoring', src: asset('d580fc41-83c6-47e1-92f1-41e5f5469147.jpg') },
    { id: 'g-white-oxford', name: 'White Oxford Shirt', category: 'shirts', presetId: 'shirts', src: asset('8c567b61-1d42-4ac3-8fdc-6b6ac92c3934.jpg') },
    { id: 'g-light-blue-shirt', name: 'Light Blue Shirt', category: 'shirts', presetId: 'shirts', src: asset('3ac84438-a15f-4ac1-8c8a-542c66d74ae2.jpg') },
    { id: 'g-beige-knit', name: 'Beige Knit Sweater', category: 'knitwear', presetId: 'knitwear', src: asset('b7b23f2f-672c-4e76-83a6-0f71debed9d2.jpg') },
    { id: 'g-grey-trousers', name: 'Grey Wool Trousers', category: 'trousers', presetId: 'trousers', src: asset('f73725ed-0db9-4677-b818-14387b35fb83.jpg') },
    { id: 'g-camel-overcoat', name: 'Camel Overcoat', category: 'outerwear', presetId: 'outerwear', src: asset('0d68e020-174f-4b6a-9e33-999125528bc4.jpg') }
  ];

  const garmentCategories = [
    { id: 'tailoring', label: 'Tailoring' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'knitwear', label: 'Knitwear' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'outerwear', label: 'Outerwear' }
  ];

  /* Upload-only categories: these never go on the cloth rail, they go to their own drawer. */
  const drawerCategories = [
    { id: 'accessories', label: 'Accessories', drawerId: 'accessory-drawer', kind: 'accessory', drawerName: 'accessory drawer', fallbackName: 'New accessory' },
    { id: 'shoes', label: 'Shoes', drawerId: 'shoe-drawer', kind: 'shoes', drawerName: 'shoe drawer', fallbackName: 'New pair of shoes' }
  ];

  /*
    Motion preset fields
      weight     gravity + inertia multiplier
      stiffness  0–1, how strongly the mesh keeps its edge lengths
      structure  0–1, how strongly it returns to its hanging shape
      damping    0.85–0.99, velocity kept per frame (higher = swings longer)
      bendLimit  maximum pull distance in px
      sway       0–1, how much the hanger pivots on the rail
  */
  const motionPresets = [
    { id: 'tailoring', label: 'Tailoring', description: 'Structured canvas and shoulder pads — holds its shape, swings in a short, firm arc.', weight: 1, stiffness: 0.85, structure: 0.75, damping: 0.94, bendLimit: 55, sway: 0.6 },
    { id: 'shirts', label: 'Shirts', description: 'Light cotton — bends easily and keeps drifting after you let go.', weight: 0.55, stiffness: 0.5, structure: 0.35, damping: 0.965, bendLimit: 95, sway: 1 },
    { id: 'knitwear', label: 'Knitwear', description: 'Soft and stretchy — gives under the hand and settles slowly.', weight: 0.8, stiffness: 0.35, structure: 0.45, damping: 0.93, bendLimit: 85, sway: 0.7 },
    { id: 'trousers', label: 'Trousers', description: 'Long and weighted at the hem — swings like a pendulum from the waistband.', weight: 1.2, stiffness: 0.6, structure: 0.5, damping: 0.95, bendLimit: 70, sway: 0.8 },
    { id: 'outerwear', label: 'Outerwear', description: 'Heavy wool — resists the pull and comes to rest quickly.', weight: 1.5, stiffness: 0.8, structure: 0.7, damping: 0.9, bendLimit: 45, sway: 0.45 }
  ];

  const presetParameters = [
    { key: 'weight', label: 'Weight', hint: 'Gravity and inertia', min: 0.3, max: 2, step: 0.05, format: 'multiplier' },
    { key: 'stiffness', label: 'Stiffness', hint: 'Resists stretching', min: 0, max: 1, step: 0.05, format: 'percent' },
    { key: 'structure', label: 'Shape memory', hint: 'Returns to hanging shape', min: 0, max: 1, step: 0.05, format: 'percent' },
    { key: 'damping', label: 'Momentum', hint: 'Keeps swinging after release', min: 0.85, max: 0.99, step: 0.005, format: 'momentum' },
    { key: 'bendLimit', label: 'Bend range', hint: 'Furthest it can be pulled', min: 20, max: 130, step: 5, format: 'px' },
    { key: 'sway', label: 'Hanger sway', hint: 'Pivot on the rail', min: 0, max: 1, step: 0.05, format: 'percent' }
  ];

  const client = {
    name: 'James Carter',
    location: 'London, United Kingdom',
    avatar: asset('5764c8a2-cf88-4968-9190-c9da53ca6b0e.jpg'),
    memberSince: 'March 2024'
  };

  const stylist = {
    name: 'Stylist',
    avatar: asset('5c47c074-56e9-476a-bde1-cf5ec1ac1b33.jpg')
  };

  const fitProfile = [
    { label: 'Size', value: 'M / 40R' },
    { label: 'Height', value: '183 cm' },
    { label: 'Chest', value: '102 cm' },
    { label: 'Waist', value: '84 cm' },
    { label: 'Inseam', value: '81 cm' },
    { label: 'Shoe', value: 'UK 9' }
  ];

  const preferences = ['Smart casual', 'Natural fabrics', 'Earth tones', 'Tailored fit'];

  const swatches = [
    { name: 'Camel', hex: '#C19A6B' },
    { name: 'Ivory', hex: '#F3EDE0' },
    { name: 'Olive', hex: '#6E6B3D' },
    { name: 'Rust', hex: '#A5512F' },
    { name: 'Navy', hex: '#1F2B47' },
    { name: 'Chocolate', hex: '#4B3024' }
  ];

  const bodySilhouette = {
    shape: 'Inverted triangle',
    notes: 'Broad shoulders, longer legs. Favour softer shoulder lines and mid-rise trousers with a gentle taper.'
  };

  const styleReferences = [
    'Quiet luxury tailoring',
    'Milan smart casual',
    'Layered autumn knitwear',
    'Relaxed weekend linen'
  ];

  const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  /* Accessory + shoe drawers: real photos (background is removed in the browser, same as the garments). */
  const accessoryDrawer = [
    { id: 'acc-silk-tie', name: 'Silk Tie', color: '#1F2B47', image: unsplash('1589756823695-278bc923f962', 900) },
    { id: 'acc-classic-watch', name: 'Classic Watch', color: '#8a8276', image: unsplash('1524592094714-0f0654e20314', 900) },
    { id: 'acc-leather-belt', name: 'Leather Belt', color: '#4B3024', image: unsplash('1624222247344-550fb60583dc', 900) }
  ];

  const shoeDrawer = [
    { id: 'shoe-brown-oxfords', name: 'Brown Oxford Shoes', color: '#4B3024', image: unsplash('1614252235316-8c857d38b5f4', 900) },
    { id: 'shoe-leather-derby', name: 'Leather Derby Shoes', color: '#C19A6B', image: unsplash('1533867617858-e7b97e060509', 900) }
  ];

  /* Client "Image" panel photo and "Style" mood board */
  let bodySilhouetteImage = unsplash('1617137968427-85924c800a22', 800);

  const moodBoard = [
    { id: 'mood-1', caption: 'Sharp tailoring', url: unsplash('1507679799987-c73779587ccf', 700) },
    { id: 'mood-2', caption: 'Weekend layers', url: unsplash('1490578474895-699cd4e2cf59', 700) },
    { id: 'mood-3', caption: 'Relaxed smart', url: unsplash('1516826957135-700dedea698c', 700) },
    { id: 'mood-4', caption: 'City casual', url: unsplash('1488161628813-04466f872be2', 700) }
  ];

  const initialMessages = [
    { id: 'm1', from: 'client', text: 'Hi! Looking forward to planning outfits for the Milan trip next month.', time: '11:14' },
    { id: 'm2', from: 'stylist', text: "Lovely — I've started pulling pieces from your wardrobe. Camel and navy will travel well.", time: '11:18' }
  ];

  const simulatedReplies = [
    'That sounds great — could we keep one look for dinner?',
    'Love the overcoat. Will it work over the knit?',
    'Perfect, send me the look when it is saved.',
    'Can we try something with the grey trousers too?'
  ];

  /* ===========================================================================
     3. BACKGROUND REMOVAL
     Removes a plain studio background from a garment photo, entirely in the browser.
       1. Samples the border to estimate the backdrop colour.
       2. Flood-fills from the edges, keying out connected pixels close to that colour.
       3. Feathers the silhouette edge and crops to the garment's bounds.
     ========================================================================= */

  /* Background removal v2: border flood (colour + continuity), leak cutting, hole removal, largest-piece filter, soft edge. */
  const MAX_DIMENSION = 520;
  function loadImage(src, anonymous) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const isLocal = src.startsWith('blob:') || src.startsWith('data:');
      if (anonymous && !isLocal) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = src;
    });
  }
  function drawToCanvas(img) {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[sorted.length >> 1];
  }
  async function removeBackground(src) {
    let img;
    try { img = await loadImage(src, true); }
    catch (err) { img = await loadImage(src, false); return { canvas: drawToCanvas(img), thumb: src, backgroundRemoved: false }; }
    const canvas = drawToCanvas(img);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { canvas, thumb: src, backgroundRemoved: false };
    const w = canvas.width, h = canvas.height, n = w * h;
    let imageData;
    try { imageData = ctx.getImageData(0, 0, w, h); }
    catch (err) { return { canvas, thumb: src, backgroundRemoved: false }; }
    const px = imageData.data;

    // 1. backdrop colour from a 3px border band
    const rs = [], gs = [], bs = [];
    const take = (i) => { rs.push(px[i * 4]); gs.push(px[i * 4 + 1]); bs.push(px[i * 4 + 2]); };
    for (let t = 0; t < 3; t++) {
      for (let x = 0; x < w; x += 2) { take(t * w + x); take((h - 1 - t) * w + x); }
      for (let y = 0; y < h; y += 2) { take(y * w + t); take(y * w + w - 1 - t); }
    }
    const br = median(rs), bg = median(gs), bb = median(bs);
    const dev = [];
    for (let k = 0; k < rs.length; k++) { const dr = rs[k] - br, dg = gs[k] - bg, db = bs[k] - bb, dl = (dr + dg + db) / 3; dev.push(Math.hypot(dl * 0.8, 2.4 * Math.hypot(dr - dl, dg - dl, db - dl))); }
    const spread = median(dev);
    const LOW = Math.min(40, Math.max(20, 14 + spread * 2.5));   // clearly backdrop
    const HIGH = LOW + 26;                                      // backdrop only if it varies smoothly
    const STEP = 7;

    const dBg = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      const dr = px[o] - br, dg = px[o + 1] - bg, db = px[o + 2] - bb;
      const dl = (dr + dg + db) / 3;
      dBg[i] = Math.hypot(dl * 0.8, 2.4 * Math.hypot(dr - dl, dg - dl, db - dl));
    }
    const stepDist = (a, b) => {
      const oa = a * 4, ob = b * 4;
      return Math.abs(px[oa] - px[ob]) + Math.abs(px[oa + 1] - px[ob + 1]) + Math.abs(px[oa + 2] - px[ob + 2]);
    };

    // 2. flood from the border
    const isBg = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0, tail = 0;
    const trySeed = (i) => { if (!isBg[i] && dBg[i] < LOW) { isBg[i] = 1; queue[tail++] = i; } };
    for (let x = 0; x < w; x++) { trySeed(x); trySeed((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { trySeed(y * w); trySeed(y * w + w - 1); }
    const visit = (from, to) => {
      if (isBg[to]) return;
      const d = dBg[to];
      if (d < LOW || (d < HIGH && stepDist(from, to) <= STEP)) { isBg[to] = 1; queue[tail++] = to; }
    };
    while (head < tail) {
      const i = queue[head++];
      const x = i % w, y = (i / w) | 0;
      if (x > 0) visit(i, i - 1);
      if (x < w - 1) visit(i, i + 1);
      if (y > 0) visit(i, i - w);
      if (y < h - 1) visit(i, i + w);
    }
    if (tail < n * 0.05) return { canvas, thumb: canvas.toDataURL('image/png'), backgroundRemoved: false };

    // 3. cut narrow leaks: erode backdrop, re-flood from the border inside it, dilate back
    const R = 3;
    const erode = (src, r) => {
      const tmp = new Uint8Array(n), out = new Uint8Array(n);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let ok = 1;
        for (let k = -r; k <= r && ok; k++) { const xx = x + k; if (xx >= 0 && xx < w && !src[y * w + xx]) ok = 0; }
        tmp[y * w + x] = ok;
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let ok = 1;
        for (let k = -r; k <= r && ok; k++) { const yy = y + k; if (yy >= 0 && yy < h && !tmp[yy * w + x]) ok = 0; }
        out[y * w + x] = ok;
      }
      return out;
    };
    const core = erode(isBg, R);
    const reach = new Uint8Array(n);
    head = 0; tail = 0;
    const seedCore = (i) => { if (core[i] && !reach[i]) { reach[i] = 1; queue[tail++] = i; } };
    for (let x = 0; x < w; x++) { seedCore(x); seedCore((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { seedCore(y * w); seedCore(y * w + w - 1); }
    while (head < tail) {
      const i = queue[head++]; const x = i % w, y = (i / w) | 0;
      if (x > 0) seedCore(i - 1); if (x < w - 1) seedCore(i + 1);
      if (y > 0) seedCore(i - w); if (y < h - 1) seedCore(i + w);
    }
    // dilate reach by R, limited to isBg
    const dil = (src, r) => {
      const tmp = new Uint8Array(n), out = new Uint8Array(n);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let on = 0;
        for (let k = -r; k <= r && !on; k++) { const xx = x + k; if (xx >= 0 && xx < w && src[y * w + xx]) on = 1; }
        tmp[y * w + x] = on;
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let on = 0;
        for (let k = -r; k <= r && !on; k++) { const yy = y + k; if (yy >= 0 && yy < h && tmp[yy * w + x]) on = 1; }
        out[y * w + x] = on;
      }
      return out;
    };
    const grown = dil(reach, R + 1);
    const bgMask = new Uint8Array(n);
    for (let i = 0; i < n; i++) bgMask[i] = isBg[i] && grown[i] ? 1 : 0;
    // keep the (thin) outer rim attached so the border itself stays transparent
    for (let x = 0; x < w; x++) { if (isBg[x]) bgMask[x] = 1; if (isBg[(h - 1) * w + x]) bgMask[(h - 1) * w + x] = 1; }
    for (let y = 0; y < h; y++) { if (isBg[y * w]) bgMask[y * w] = 1; if (isBg[y * w + w - 1]) bgMask[y * w + w - 1] = 1; }

    // 4. enclosed gaps (between an arm and the body) that are clearly backdrop colour
    const HOLE = Math.max(12, LOW * 0.6);
    const seen = new Uint8Array(n);
    for (let s = 0; s < n; s++) {
      if (bgMask[s] || seen[s] || dBg[s] > HOLE * 1.6) continue;
      head = 0; tail = 0; queue[tail++] = s; seen[s] = 1;
      let sum = 0;
      while (head < tail) {
        const i = queue[head++]; sum += dBg[i];
        const x = i % w, y = (i / w) | 0;
        const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
        for (const j of nb) if (j >= 0 && !seen[j] && !bgMask[j] && dBg[j] <= HOLE * 1.6) { seen[j] = 1; queue[tail++] = j; }
      }
      if (tail >= 120 && sum / tail < HOLE) for (let k = 0; k < tail; k++) bgMask[queue[k]] = 1;
    }

    // 5. keep only the biggest foreground piece (drops specks)
    const label = new Int32Array(n);
    let best = 0, bestSize = 0, id = 0;
    for (let s = 0; s < n; s++) {
      if (bgMask[s] || label[s]) continue;
      id++; head = 0; tail = 0; queue[tail++] = s; label[s] = id;
      while (head < tail) {
        const i = queue[head++]; const x = i % w, y = (i / w) | 0;
        if (x > 0 && !bgMask[i - 1] && !label[i - 1]) { label[i - 1] = id; queue[tail++] = i - 1; }
        if (x < w - 1 && !bgMask[i + 1] && !label[i + 1]) { label[i + 1] = id; queue[tail++] = i + 1; }
        if (y > 0 && !bgMask[i - w] && !label[i - w]) { label[i - w] = id; queue[tail++] = i - w; }
        if (y < h - 1 && !bgMask[i + w] && !label[i + w]) { label[i + w] = id; queue[tail++] = i + w; }
      }
      if (tail > bestSize) { bestSize = tail; best = id; }
    }
    if (!best) return { canvas, thumb: src, backgroundRemoved: false };
    for (let i = 0; i < n; i++) if (label[i] !== best) bgMask[i] = 1;

    // 6. soft edge + crop
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, o = i * 4;
      if (bgMask[i]) { px[o + 3] = 0; continue; }
      const edge = (x > 0 && bgMask[i - 1]) || (x < w - 1 && bgMask[i + 1]) || (y > 0 && bgMask[i - w]) || (y < h - 1 && bgMask[i + w]);
      if (edge) px[o + 3] = Math.round(255 * Math.min(1, Math.max(0.4, (dBg[i] - LOW * 0.4) / (LOW * 1.2))));
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
    ctx.putImageData(imageData, 0, 0);
    const cw = maxX - minX + 1, ch = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
    return { canvas: out, thumb: out.toDataURL('image/png'), backgroundRemoved: true };
  }


  /* ===========================================================================
     4. CLOTH SIMULATION
     A garment mesh: a grid of 3D particles joined by distance links (Verlet cloth).
     ========================================================================= */

  function createCloth(width, height, anchor, initialYaw, cols = 9, rows = 12) {
    const n = cols * rows;
    const links = [];
    const rest = [];
    const dx = width / (cols - 1);
    const dy = height / (rows - 1);
    const diagonal = Math.hypot(dx, dy);
    const link = (a, b, len) => {
      links.push(a, b);
      rest.push(len);
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) link(i, i + 1, dx);
        if (r < rows - 1) link(i, i + cols, dy);
        if (c < cols - 1 && r < rows - 1) {
          link(i, i + cols + 1, diagonal);
          link(i + 1, i + cols, diagonal);
        }
        if (c < cols - 2) link(i, i + 2, dx * 2);
        if (r < rows - 2) link(i, i + cols * 2, dy * 2);
      }
    }

    const cloth = {
      cols,
      rows,
      width,
      height,
      x: new Float32Array(n),
      y: new Float32Array(n),
      z: new Float32Array(n),
      px: new Float32Array(n),
      py: new Float32Array(n),
      pz: new Float32Array(n),
      rx: new Float32Array(n),
      ry: new Float32Array(n),
      rz: new Float32Array(n),
      links: new Int32Array(links),
      linkRest: new Float32Array(rest),
      yaw: initialYaw,
      lift: 0,
      sway: 0,
      swayVel: 0
    };

    computeRestPose(cloth, anchor);
    cloth.x.set(cloth.rx);
    cloth.y.set(cloth.ry);
    cloth.z.set(cloth.rz);
    cloth.px.set(cloth.rx);
    cloth.py.set(cloth.ry);
    cloth.pz.set(cloth.rz);
    return cloth;
  }

  /** The shape the garment wants to hang in, given hanger position, yaw toward camera and sway on the rail. */
  function computeRestPose(cloth, anchor) {
    const { cols, rows, width, height, rx, ry, rz } = cloth;
    const cosYaw = Math.cos(cloth.yaw);
    const sinYaw = Math.sin(cloth.yaw);
    const cosSway = Math.cos(cloth.sway);
    const sinSway = Math.sin(cloth.sway);
    const drop = anchor.y - anchor.pivotY;

    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1);
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const u = c / (cols - 1) - 0.5;
        const lx = u * width * cosYaw;
        const ly = drop + v * height;
        rx[i] = anchor.x + lx * cosSway - ly * sinSway;
        ry[i] = anchor.pivotY + lx * sinSway + ly * cosSway;
        rz[i] = u * width * sinYaw + cloth.lift;
      }
    }
  }

  /** Advances the mesh by one fixed 1/60s step using the garment's motion preset. */
  function stepCloth(cloth, anchor, preset, targets, grab) {
    const { cols, rows, x, y, z, px, py, pz, rx, ry, rz, links, linkRest } = cloth;
    const n = x.length;

    cloth.yaw += (targets.yaw - cloth.yaw) * 0.14;
    cloth.lift += (targets.lift - cloth.lift) * 0.14;

    let swayTarget = 0;
    if (grab) {
      const offset = grab.x - rx[grab.index];
      const rowFraction = Math.floor(grab.index / cols) / (rows - 1);
      swayTarget = clamp(-offset * 0.004 * preset.sway * (0.4 + rowFraction), -0.24, 0.24);
    }
    const weight = Math.max(0.2, preset.weight);
    cloth.swayVel = cloth.swayVel * preset.damping + (swayTarget - cloth.sway) * (0.045 / weight);
    cloth.sway += cloth.swayVel;
    computeRestPose(cloth, anchor);

    const gravity = 0.3 * weight;
    const memory = 0.015 + preset.structure * 0.11;
    const damping = preset.damping;

    for (let i = 0; i < n; i++) {
      if (i < cols) {
        x[i] = px[i] = rx[i];
        y[i] = py[i] = ry[i];
        z[i] = pz[i] = rz[i];
        continue;
      }
      const vx = (x[i] - px[i]) * damping;
      const vy = (y[i] - py[i]) * damping;
      const vz = (z[i] - pz[i]) * damping;
      px[i] = x[i];
      py[i] = y[i];
      pz[i] = z[i];
      x[i] += vx + (rx[i] - x[i]) * memory;
      y[i] += vy + gravity + (ry[i] - y[i]) * memory;
      z[i] += vz + (rz[i] - z[i]) * memory;
    }

    const grabbed = grab ? grab.index : -1;
    if (grab) {
      const i = grab.index;
      let ox = grab.x - rx[i];
      let oy = grab.y - ry[i];
      const len = Math.hypot(ox, oy);
      const limit = preset.bendLimit;
      if (len > limit) {
        const s = limit / len;
        ox *= s;
        oy *= s;
      }
      const pull = Math.min(len, limit);
      x[i] += (rx[i] + ox - x[i]) * 0.4;
      y[i] += (ry[i] + oy - y[i]) * 0.4;
      z[i] += (rz[i] - pull * 0.5 - z[i]) * 0.4;
    }

    const iterations = 1 + Math.round(preset.stiffness * 5);
    const k = 0.3 + preset.stiffness * 0.6;
    for (let it = 0; it < iterations; it++) {
      for (let l = 0; l < linkRest.length; l++) {
        const a = links[l * 2];
        const b = links[l * 2 + 1];
        const wa = a < cols || a === grabbed ? 0 : 1;
        const wb = b < cols || b === grabbed ? 0 : 1;
        const sum = wa + wb;
        if (!sum) continue;
        const dx = x[b] - x[a];
        const dy = y[b] - y[a];
        const dz = z[b] - z[a];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 1e-4) continue;
        const diff = ((d - linkRest[l]) / d) * k;
        const fa = (diff * wa) / sum;
        const fb = (diff * wb) / sum;
        x[a] += dx * fa;
        y[a] += dy * fa;
        z[a] += dz * fa;
        x[b] -= dx * fb;
        y[b] -= dy * fb;
        z[b] -= dz * fb;
      }
    }
  }

  /* ===========================================================================
     5. MESH RENDERER
     ========================================================================= */

  function normalize3(x, y, z) {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  }

  const LIGHT = normalize3(-0.33, -0.47, -0.82);
  const FLAT_LIGHT = -LIGHT[2];

  /** Perspective-projects every mesh particle into screen space. */
  function projectCloth(cloth, cam, out) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < cloth.x.length; i++) {
      const s = cam.f / (cam.f + cloth.z[i]);
      const sx = cam.cx + (cloth.x[i] - cam.cx) * s;
      const sy = cam.cy + (cloth.y[i] - cam.cy) * s;
      out[i * 2] = sx;
      out[i * 2 + 1] = sy;
      if (sx < x0) x0 = sx;
      if (sy < y0) y0 = sy;
      if (sx > x1) x1 = sx;
      if (sy > y1) y1 = sy;
    }
    return { x0, y0, x1, y1 };
  }

  function projectPoint(x, y, z, cam) {
    const s = cam.f / (cam.f + z);
    return { x: cam.cx + (x - cam.cx) * s, y: cam.cy + (y - cam.cy) * s };
  }

  function unprojectPoint(sx, sy, z, cam) {
    const s = (cam.f + z) / cam.f;
    return { x: cam.cx + (sx - cam.cx) * s, y: cam.cy + (sy - cam.cy) * s };
  }

  /** Draws the cut-out texture across the deformed mesh, then shades each facet by its normal. */
  function renderClothLayer(ctx, cloth, proj, source, showMesh) {
    const { cols, rows } = cloth;
    const tw = source.width;
    const th = source.height;

    for (let r = 0; r < rows - 1; r++) {
      const va = (r / (rows - 1)) * th;
      const vb = ((r + 1) / (rows - 1)) * th;
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        const b = a + 1;
        const d = a + cols;
        const e = d + 1;
        const ua = (c / (cols - 1)) * tw;
        const ub = ((c + 1) / (cols - 1)) * tw;
        drawTexturedTriangle(ctx, source, proj, a, b, d, ua, va, ub, va, ua, vb);
        drawTexturedTriangle(ctx, source, proj, b, e, d, ub, va, ub, vb, ua, vb);
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        const b = a + 1;
        const d = a + cols;
        const e = d + 1;
        shadeTriangle(ctx, cloth, proj, a, b, d);
        shadeTriangle(ctx, cloth, proj, b, e, d);
      }
    }
    ctx.restore();

    if (showMesh) {
      ctx.save();
      ctx.strokeStyle = 'rgba(201, 166, 107, 0.7)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (c < cols - 1) {
            ctx.moveTo(proj[i * 2], proj[i * 2 + 1]);
            ctx.lineTo(proj[(i + 1) * 2], proj[(i + 1) * 2 + 1]);
          }
          if (r < rows - 1) {
            ctx.moveTo(proj[i * 2], proj[i * 2 + 1]);
            ctx.lineTo(proj[(i + cols) * 2], proj[(i + cols) * 2 + 1]);
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawTexturedTriangle(ctx, img, proj, i0, i1, i2, u0, v0, u1, v1, u2, v2) {
    const x0 = proj[i0 * 2];
    const y0 = proj[i0 * 2 + 1];
    const x1 = proj[i1 * 2];
    const y1 = proj[i1 * 2 + 1];
    const x2 = proj[i2 * 2];
    const y2 = proj[i2 * 2 + 1];

    const delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
    if (Math.abs(delta) < 1e-6) return;

    ctx.save();
    // Expand the clip slightly so neighbouring facets overlap and no seams show.
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    ctx.beginPath();
    expandTo(ctx, x0, y0, cx, cy, true);
    expandTo(ctx, x1, y1, cx, cy, false);
    expandTo(ctx, x2, y2, cx, cy, false);
    ctx.closePath();
    ctx.clip();

    const a = (x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2) / delta;
    const b = (u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2) / delta;
    const c = (u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2) / delta;
    const d = (y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2) / delta;
    const e = (u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2) / delta;
    const f = (u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2) / delta;
    ctx.transform(a, d, b, e, c, f);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }

  function shadeTriangle(ctx, cloth, proj, a, b, c) {
    const { x, y, z } = cloth;
    const abx = x[b] - x[a];
    const aby = y[b] - y[a];
    const abz = z[b] - z[a];
    const acx = x[c] - x[a];
    const acy = y[c] - y[a];
    const acz = z[c] - z[a];
    let nx = aby * acz - abz * acy;
    let ny = abz * acx - abx * acz;
    let nz = abx * acy - aby * acx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    if (nz > 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
    const shade = Math.max(-0.22, Math.min(0.55, (FLAT_LIGHT - lambert) * 1.3));
    if (Math.abs(shade) < 0.012) return;

    ctx.fillStyle = shade > 0 ? `rgba(0, 0, 0, ${shade})` : `rgba(255, 244, 228, ${-shade})`;
    ctx.beginPath();
    ctx.moveTo(proj[a * 2], proj[a * 2 + 1]);
    ctx.lineTo(proj[b * 2], proj[b * 2 + 1]);
    ctx.lineTo(proj[c * 2], proj[c * 2 + 1]);
    ctx.closePath();
    ctx.fill();
  }

  function expandTo(ctx, x, y, cx, cy, move) {
    const dx = x - cx;
    const dy = y - cy;
    const l = Math.hypot(dx, dy) || 1;
    const ex = x + (dx / l) * 0.7;
    const ey = y + (dy / l) * 0.7;
    if (move) ctx.moveTo(ex, ey);
    else ctx.lineTo(ex, ey);
  }

  /* ===========================================================================
     6. WARDROBE SCENE DRAWING
     ========================================================================= */

  const WARDROBE = {
    side: 40,
    top: 22,
    floor: 54,
    railY: 50,
    hangerDrop: 30
  };

  function stageLayout(width, count) {
    const slot = width < 640 ? 112 : 132;
    const usable = Math.max(slot, width - WARDROBE.side * 2 - 40);
    const visible = Math.max(1, Math.floor(usable / slot));
    const shown = Math.min(count, visible);
    const startX = WARDROBE.side + 20 + slot / 2 + Math.max(0, (usable - shown * slot) / 2);
    const maxScroll = Math.max(0, count - visible);
    return { slot, visible, startX, maxScroll };
  }

  function drawWardrobe(ctx, w, h) {
    const { side, top, floor, railY } = WARDROBE;
    const backBottom = h - floor;

    ctx.fillStyle = '#0d0b09';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1a1714';
    ctx.fillRect(side, top, w - side * 2, backBottom - top);

    ctx.strokeStyle = 'rgba(255, 240, 220, 0.035)';
    ctx.lineWidth = 1;
    const panels = 4;
    for (let p = 1; p < panels; p++) {
      const x = side + ((w - side * 2) / panels) * p;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, top);
      ctx.lineTo(x + 0.5, backBottom);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 228, 190, 0.035)';
    ctx.beginPath();
    ctx.ellipse(w / 2, top + 30, (w - side * 2) * 0.42, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    polygon(ctx, [[0, 0], [w, 0], [w - side, top], [side, top]], '#0a0908');
    polygon(ctx, [[0, 0], [side, top], [side, backBottom], [0, h]], '#13100e');
    polygon(ctx, [[w, 0], [w - side, top], [w - side, backBottom], [w, h]], '#13100e');
    polygon(ctx, [[side, backBottom], [w - side, backBottom], [w, h], [0, h]], '#100e0c');

    ctx.strokeStyle = 'rgba(255, 240, 220, 0.06)';
    ctx.strokeRect(side + 0.5, top + 0.5, w - side * 2 - 1, backBottom - top - 1);

    ctx.fillStyle = '#5c564e';
    ctx.fillRect(side * 0.5 - 3, railY - 9, 6, 18);
    ctx.fillRect(w - side * 0.5 - 3, railY - 9, 6, 18);
    ctx.fillStyle = '#8a8276';
    roundedRect(ctx, side * 0.5, railY - 3, w - side, 6, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(side * 0.5 + 3, railY - 2, w - side - 6, 1);
  }

  function drawHanger(ctx, left, right, pivot) {
    const midX = (left.x + right.x) / 2;
    const midY = (left.y + right.y) / 2;
    const neckX = midX + (pivot.x - midX) * 0.5;
    const neckY = Math.min(midY - 16, pivot.y + 12);

    ctx.save();
    ctx.strokeStyle = '#c4bbae';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(left.x - 4, left.y + 2);
    ctx.lineTo(neckX, neckY);
    ctx.lineTo(right.x + 4, right.y + 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(pivot.x, pivot.y + 5);
    ctx.quadraticCurveTo(pivot.x, pivot.y - 7, pivot.x + 5, pivot.y - 6);
    ctx.quadraticCurveTo(pivot.x + 9, pivot.y - 5, pivot.x + 8, pivot.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlaceholder(ctx, x, status) {
    const { railY, hangerDrop } = WARDROBE;
    const top = railY + hangerDrop;
    const width = 92;
    const height = 150;
    drawHanger(ctx, { x: x - width / 2, y: top }, { x: x + width / 2, y: top }, { x, y: railY });

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(201, 166, 107, 0.35)';
    ctx.lineWidth = 1;
    roundedRect(ctx, x - width / 2, top + 4, width, height, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = status === 'error' ? '#d9877a' : '#a39b90';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lines = status === 'error' ? ["Couldn't", 'load image'] : ['Removing', 'background…'];
    ctx.fillText(lines[0], x, top + height / 2);
    ctx.fillText(lines[1], x, top + height / 2 + 15);
    ctx.restore();
  }

  function drawGarmentLabel(ctx, text, x, y) {
    ctx.save();
    ctx.font = '500 12px Inter, sans-serif';
    const width = ctx.measureText(text).width + 20;
    ctx.fillStyle = 'rgba(20, 18, 16, 0.92)';
    ctx.strokeStyle = 'rgba(201, 166, 107, 0.45)';
    ctx.lineWidth = 1;
    roundedRect(ctx, x - width / 2, y, width, 24, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f2ece3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 12.5);
    ctx.restore();
  }

  function polygon(ctx, points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.fill();
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ===========================================================================
     8. TOASTS  (bottom-centre, dark — replaces sonner)
     ========================================================================= */

  const toast = (function () {
    const TOAST_MS = 4000;
    const MAX_VISIBLE = 3;
    const ICON_SUCCESS =
      '<svg viewBox="0 0 20 20" fill="currentColor" height="20" width="20" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>';
    const ICON_ERROR =
      '<svg viewBox="0 0 20 20" fill="currentColor" height="20" width="20" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>';

    function dismiss(el) {
      if (el.classList.contains('is-leaving')) return;
      el.classList.add('is-leaving');
      window.setTimeout(() => el.remove(), 250);
    }

    function show(message, type) {
      const root = $('#toaster');
      if (!root) return;
      const el = document.createElement('li');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      const iconHtml = type === 'success' ? ICON_SUCCESS : type === 'error' ? ICON_ERROR : '';
      el.innerHTML = (iconHtml ? `<span class="toast-icon">${iconHtml}</span>` : '') + `<span class="toast-text">${esc(message)}</span>`;
      root.appendChild(el);

      const live = [...root.children].filter((c) => !c.classList.contains('is-leaving'));
      while (live.length > MAX_VISIBLE) dismiss(live.shift());

      window.setTimeout(() => dismiss(el), TOAST_MS);
    }

    const fn = (message) => show(message, 'default');
    fn.success = (message) => show(message, 'success');
    fn.error = (message) => show(message, 'error');
    return fn;
  })();

  /* ===========================================================================
     9. APP STATE
     ========================================================================= */

  const S = {
    garments: initialGarments,
    presets: buildPresetMap(),
    selectedId: initialGarments[0] ? initialGarments[0].id : null,
    outfit: [],
    notifs: [],
    unreadChat: 0,
    returned: {},
    savedLooks: [],
    credits: 105,
    role: 'client',
    textures: {},
    /** Items inside the drawers (grows when accessories / shoes are uploaded). */
    drawerItems: { 'accessory-drawer': [...accessoryDrawer], 'shoe-drawer': [...shoeDrawer] },
    /** Overlay the deforming mesh grid on every garment (was the App `showMesh` prop). */
    showMesh: false,

    // UI state
    wardrobeOpen: true,
    stylingVisible: true,
    colourOpen: 'colour',
    drawerOpen: { 'accessory-drawer': false, 'shoe-drawer': false }
  };

  function buildPresetMap() {
    return Object.fromEntries(motionPresets.map((p) => [p.id, { ...p }]));
  }

  const startedTextures = new Set();

  const selectedGarment = () => S.garments.find((g) => g.id === S.selectedId) || null;

  /* ---------------------------------------------------------------------------
     Garment textures (was hooks/useGarmentTextures.ts)
     Removes each garment photo's background once and caches the cut-out by id.
     ------------------------------------------------------------------------- */
  function ensureTextures() {
    const everything = [...S.garments, ...S.drawerItems['accessory-drawer'], ...S.drawerItems['shoe-drawer']];
    const pending = everything.filter((g) => !startedTextures.has(g.id));
    if (!pending.length) return;
    pending.forEach((g) => {
      startedTextures.add(g.id);
      S.textures[g.id] = { status: 'processing', backgroundRemoved: false };
    });
    onTexturesChanged();

    (async () => {
      for (const garment of pending) {
        try {
          const result = await removeBackground(garment.src || garment.image);
          S.textures[garment.id] = {
            status: 'ready',
            canvas: result.canvas,
            thumb: result.thumb,
            backgroundRemoved: result.backgroundRemoved
          };
        } catch (err) {
          S.textures[garment.id] = { status: 'error', backgroundRemoved: false };
        }
        onTexturesChanged();
      }
    })();
  }

  function onTexturesChanged() {
    if (stage) stage.refresh();
    updateInspectorThumb();
    renderOutfit();
    renderDrawers();
  }

  /* ---------------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------------- */
  function spend(cost) {
    if (S.role === 'staff') return true;
    if (S.credits < cost) {
      toast.error(`You need ${cost} credits — top up to continue.`);
      openTopUp();
      return false;
    }
    S.credits -= cost;
    updateHeader();
    showDelta(-cost);
    return true;
  }

  function selectGarment(id) {
    S.selectedId = id;
    renderNav();
    renderInspector();
    if (stage) stage.refresh();
  }

  function addGarmentToOutfit(id) {
    const garment = S.garments.find((g) => g.id === id);
    if (!garment) return;
    if (S.outfit.some((o) => o.garmentId === id)) {
      toast(`${garment.name} is already in the outfit`);
      return;
    }
    S.outfit = [...S.outfit, { id: `o-${id}`, name: garment.name, kind: 'garment', garmentId: id }];
    toast.success(`${garment.name} added to the outfit`);
    onOutfitChanged();
  }

  function addDrawerItem(item, kind) {
    S.outfit = [...S.outfit, { id: item.id, name: item.name, kind, color: item.color }];
    toast.success(`${item.name} added to the outfit`);
    onOutfitChanged();
  }

  function removeFromOutfit(id) {
    S.outfit = S.outfit.filter((i) => i.id !== id);
    onOutfitChanged();
  }

  function clearOutfit() {
    const t = performance.now();
    S.outfit.forEach((o) => {
      if (o.garmentId) S.returned[o.garmentId] = t;
    });
    const n = S.outfit.length;
    S.outfit = [];
    if (n) toast(`Outfit cleared — ${n} ${n === 1 ? 'piece' : 'pieces'} returned`);
    onOutfitChanged();
  }

  function onOutfitChanged() {
    updateMobileTabs();
    renderOutfit();
    renderInspector();
    renderDrawers();
  }

  function uploadGarment(file, category, name) {
    const drawerCat = drawerCategories.find((c) => c.id === category);
    if (drawerCat) return uploadToDrawer(file, drawerCat, name);
    if (!spend(2)) return false;
    const cat = garmentCategories.find((c) => c.id === category);
    const label = cat ? cat.label : 'Garment';
    const garment = {
      id: `g-${Date.now()}`,
      name: name || `New ${label.toLowerCase()} piece`,
      category,
      presetId: category,
      uploaded: true,
      src: URL.createObjectURL(file)
    };
    S.garments = [...S.garments, garment];
    S.selectedId = garment.id;
    ensureTextures();
    renderWardrobeHeader();
    renderNav();
    renderInspector();
    if (stage) stage.refresh();
    toast.success(`${garment.name} is on the rail`);
    pushNotif('Upload complete', `${garment.name} is now in the wardrobe.`);
    return true;
  }

  /** Shoes / accessories: background removed, then straight into their own drawer (never the cloth rail). */
  function uploadToDrawer(file, cat, name) {
    if (!spend(2)) return false;
    const item = {
      id: `${cat.id === 'shoes' ? 'shoe' : 'acc'}-${Date.now()}`,
      name: name || cat.fallbackName,
      color: '#2a2521',
      uploaded: true,
      image: URL.createObjectURL(file)
    };
    S.drawerItems = { ...S.drawerItems, [cat.drawerId]: [...S.drawerItems[cat.drawerId], item] };
    S.drawerOpen[cat.drawerId] = true;
    ensureTextures();
    renderDrawers();
    toast.success(`${item.name} is in the ${cat.drawerName}`);
    pushNotif('Upload complete', `${item.name} is now in the ${cat.drawerName}.`);
    return true;
  }

  function changePreset(garmentId, presetId) {
    S.garments = S.garments.map((g) => (g.id === garmentId ? { ...g, presetId } : g));
    renderInspector();
    if (stage) stage.refresh();
  }

  function setPresetValue(presetId, key, value) {
    S.presets = { ...S.presets, [presetId]: { ...S.presets[presetId], [key]: value } };
  }

  function resetPreset(presetId) {
    const original = motionPresets.find((m) => m.id === presetId);
    if (original) S.presets = { ...S.presets, [presetId]: { ...original } };
    renderInspector();
  }

  /* ===========================================================================
     UI: HEADER
     ========================================================================= */

  function roleClass(active) {
    return (
      'rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors duration-150 ' +
      (active ? 'bg-gold text-gold-ink' : 'text-muted hover:text-ink')
    );
  }

  function buildHeader() {
    const root = $('#app-header');
    root.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div class="flex items-center gap-3">
          <h1 class="whitespace-nowrap font-serif text-2xl text-ink sm:text-3xl">The Styling Studio</h1>
          <span class="hidden rounded-full border border-gold/50 px-2.5 py-0.5 text-xs font-medium text-gold sm:inline">
            Interactive Demo
          </span>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <div id="credits-pill" role="button" tabindex="0" aria-label="Credit balance — open top-up"
            class="x-pill flex items-center gap-3 rounded-full border border-line bg-panel py-1.5 pl-4 pr-1.5">
            <div class="w-24">
              <p class="relative text-sm">
                <span id="credits-value" class="font-semibold text-ink"></span>
                <span class="text-xs text-muted">credits</span>
              </p>
              <div class="mt-1 h-1 rounded-full bg-raised">
                <div id="credits-bar" class="h-1 rounded-full bg-gold"></div>
              </div>
            </div>
            <button type="button" id="add-credits" tabindex="-1" aria-label="Top up credits"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-gold-ink transition-colors duration-150 hover:bg-gold-hover">
              ${icon('plus', 'h-4 w-4')}
            </button>
          </div>
          <div id="bell-wrap" class="x-bellwrap">
            <button type="button" id="bell" aria-label="Notifications" aria-expanded="false" aria-controls="bell-pop"
              class="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-ink transition-colors duration-150 hover:border-gold/50">
              ${icon('bell', 'h-4 w-4')}
              <span class="x-badge" data-bell-count hidden></span>
            </button>
            <div id="bell-pop" class="x-pop" hidden></div>
          </div>
          <div role="radiogroup" aria-label="View as" class="flex rounded-full border border-line bg-panel p-1" id="role-group">
            ${['client', 'staff']
              .map((r) => `<button type="button" role="radio" data-role="${r}" class="${roleClass(false)}">${r}</button>`)
              .join('')}
          </div>
          <div class="hidden items-center gap-2 border-l border-line pl-3 md:flex">
            <img src="${esc(stylist.avatar)}" alt="" class="h-9 w-9 rounded-full object-cover" />
            <span class="text-sm font-semibold text-ink">${esc(stylist.name)}</span>
          </div>
        </div>
      </div>
      <p class="border-t border-line bg-panel px-4 py-2.5 text-center text-xs text-muted sm:text-sm">
        Click a garment for its front view · swipe it right to add it to the outfit · swipe it left in the styling area to return it
      </p>`;

    const pill = $('#credits-pill');
    pill.addEventListener('click', openTopUp);
    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTopUp();
      }
    });
    setupBell();
    $('#role-group').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-role]');
      if (!btn) return;
      S.role = btn.dataset.role;
      updateHeader();
      renderStaff();
      if (S.role === 'staff') {
        toast('Staff console opened — edit any content below');
        const sp = $('#staff-panel');
        if (sp && window.matchMedia('(min-width: 768px)').matches) sp.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    updateHeader();
  }

  function updateHeader() {
    $('#credits-value').textContent = S.credits;
    $('#credits-bar').style.width = `${Math.min(100, (S.credits / 150) * 100)}%`;
    document.querySelectorAll('#role-group [data-role]').forEach((btn) => {
      const active = btn.dataset.role === S.role;
      btn.setAttribute('aria-checked', String(active));
      btn.className = roleClass(active);
    });
  }

  /* ===========================================================================
     UI: CLIENT PROFILE
     ========================================================================= */

  function buildClientProfile() {
    const root = $('#client-profile');
    root.innerHTML = `
      <div class="flex items-center gap-4">
        <img id="client-avatar" src="${esc(client.avatar)}" alt="${esc(client.name)}" class="h-20 w-20 shrink-0 rounded-full object-cover" />
        <div class="min-w-0">
          <p class="text-sm text-gold">Client</p>
          <h2 id="client-name" class="font-serif text-3xl leading-tight text-ink">${esc(client.name)}</h2>
          <p class="flex items-center gap-1.5 truncate text-sm text-muted">
            ${icon('map-pin', 'h-3.5 w-3.5 shrink-0')}
            <span class="truncate">${esc(client.location)}</span>
          </p>
        </div>
      </div>

      <input id="avatar-input" type="file" accept="image/*" class="sr-only" />
      <button type="button" id="avatar-button"
        class="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-raised py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-gold/50">
        ${icon('camera', 'h-4 w-4')}
        Upload photo
      </button>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-semibold text-ink">Fit profile</h3>
        <dl class="mt-3 grid grid-cols-3 gap-x-4 gap-y-4">
          ${fitProfile
            .map(
              (item) => `
            <div>
              <dt class="text-xs text-muted">${esc(item.label)}</dt>
              <dd class="text-sm font-medium text-ink">${esc(item.value)}</dd>
            </div>`
            )
            .join('')}
        </dl>

        <h3 class="mt-6 text-sm font-semibold text-ink">Preferences</h3>
        <ul class="mt-3 flex flex-wrap gap-2">
          ${preferences.map((p) => `<li class="rounded-full bg-raised px-3 py-1.5 text-sm text-ink">${esc(p)}</li>`).join('')}
        </ul>

        <p class="mt-6 text-sm text-muted">
          Member since <span class="text-ink">${esc(client.memberSince)}</span>
        </p>
      </div>`;

    const input = $('#avatar-input');
    $('#avatar-button').addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (file) {
        client.avatar = URL.createObjectURL(file);
        $('#client-avatar').src = client.avatar;
        toast.success('Profile photo updated');
      }
      input.value = '';
    });
  }

  /* ===========================================================================
     UI: COLOUR PANEL (accordion)
     ========================================================================= */

  function buildColourPanel() {
    const sections = [
      {
        id: 'colour',
        title: 'Colour',
        subtitle: `${swatches.length} swatches`,
        body: `<ul class="grid grid-cols-3 gap-3">
          ${swatches
            .map(
              (s) => `
            <li>
              <span class="block h-14 rounded-lg border border-white/10" style="background: ${esc(s.hex)}"></span>
              <p class="mt-2 text-sm text-ink">${esc(s.name)}</p>
              <p class="text-xs uppercase text-subtle">${esc(s.hex)}</p>
            </li>`
            )
            .join('')}
        </ul>`
      },
      {
        id: 'image',
        title: 'Image',
        subtitle: 'Body silhouette',
        body: `<figure>
            <div class="photo-box aspect-[3/4] overflow-hidden rounded-xl bg-raised">
              <img src="${esc(bodySilhouetteImage)}" alt="Full-length reference photo for ${esc(client.name)}" data-photo draggable="false" loading="lazy" class="h-full w-full object-cover" />
            </div>
          </figure>
          <p class="mt-3 text-sm font-medium text-ink">${esc(bodySilhouette.shape)}</p>
          <p class="mt-1 text-sm text-muted">${esc(bodySilhouette.notes)}</p>`
      },
      {
        id: 'style',
        title: 'Style',
        subtitle: `${moodBoard.length} references`,
        body: `<ul class="grid grid-cols-2 gap-3">
          ${moodBoard
            .map(
              (m) => `
            <li>
              <div class="photo-box aspect-[4/5] overflow-hidden rounded-xl bg-raised">
                <img src="${esc(m.url)}" alt="${esc(m.caption)}" data-photo draggable="false" loading="lazy" class="h-full w-full object-cover" />
              </div>
              <p class="mt-2 text-sm text-ink">${esc(m.caption)}</p>
            </li>`
            )
            .join('')}
        </ul>`
      }
    ];

    const root = $('#colour-panel');
    root.innerHTML = sections
      .map(
        (s) => `
      <div data-section="${s.id}">
        <button type="button" data-toggle="${s.id}" class="flex w-full items-center justify-between px-6 py-5 text-left">
          <span>
            <span class="block font-serif text-2xl leading-none text-ink">${esc(s.title)}</span>
            <span class="mt-1.5 block text-sm text-muted">${esc(s.subtitle)}</span>
          </span>
          <span data-chevron class="text-muted transition-transform duration-200">${icon('chevron-down', 'h-4 w-4')}</span>
        </button>
        <div data-body class="px-6 pb-6">${s.body}</div>
      </div>`
      )
      .join('');

    if (!root.dataset.bound) {
      root.dataset.bound = '1';
      root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-toggle]');
        if (!btn) return;
        const id = btn.dataset.toggle;
        S.colourOpen = S.colourOpen === id ? null : id;
        updateColourPanel();
      });
    }
    updateColourPanel();
  }

  function updateColourPanel() {
    document.querySelectorAll('#colour-panel [data-section]').forEach((sec) => {
      const open = sec.dataset.section === S.colourOpen;
      $('[data-toggle]', sec).setAttribute('aria-expanded', String(open));
      $('[data-chevron]', sec).classList.toggle('rotate-180', open);
      $('[data-body]', sec).classList.toggle('hidden', !open);
    });
  }

  /* ===========================================================================
     UI: UPLOAD GARMENT
     ========================================================================= */

  function buildUploadGarment() {
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
    const u = { file: null, preview: null, category: 'shirts', name: '', error: null, dragging: false };

    const root = $('#upload-garment');
    root.innerHTML = `
      <h2 id="upload-title" class="font-serif text-3xl leading-none text-ink">Upload garment</h2>
      <p id="upload-sub" class="mt-1.5 text-sm text-muted">Background is removed, then it goes straight to the rail.</p>

      <form id="upload-form" class="mt-5 space-y-5">
        <div id="dropzone" class="relative rounded-xl border border-dashed p-6 text-center transition-colors duration-150">
          <div id="dropzone-content"></div>
          <input id="garment-input" type="file" accept="${ACCEPTED.join(',')}" class="sr-only" />
        </div>

        <label class="block">
          <span class="text-sm text-muted">Category</span>
          <select id="garment-category"
            class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none">
            ${[...garmentCategories, ...drawerCategories].map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}
          </select>
          <span id="upload-hint" class="mt-1 block text-xs text-subtle">Sets the movement settings it starts with</span>
        </label>

        <label class="block">
          <span class="text-sm text-muted">Name <span class="text-subtle">(optional)</span></span>
          <input id="garment-name" placeholder="e.g. Charcoal roll-neck"
            class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-gold focus:outline-none" />
        </label>

        <p id="upload-error" role="alert" class="text-sm text-[#d9877a]" style="display:none"></p>

        <button type="submit"
          class="w-full rounded-full bg-gold py-3 text-sm font-semibold text-gold-ink transition-colors duration-150 hover:bg-gold-hover">
          Add to wardrobe · 2 credits
        </button>
      </form>`;

    const dropzone = $('#dropzone');
    const content = $('#dropzone-content');
    const input = $('#garment-input');
    const select = $('#garment-category');
    select.value = u.category;

    function renderDropzone() {
      dropzone.classList.toggle('border-gold', u.dragging);
      dropzone.classList.toggle('bg-gold/5', u.dragging);
      dropzone.classList.toggle('border-line', !u.dragging);

      if (u.preview) {
        content.innerHTML = `
          <div class="flex items-center gap-3 text-left">
            <img src="${esc(u.preview)}" alt="Selected garment" class="h-16 w-16 rounded-lg object-cover" />
            <p class="min-w-0 flex-1 truncate text-sm text-ink">${esc(u.file ? u.file.name : '')}</p>
            <button type="button" data-remove aria-label="Remove photo"
              class="rounded-full p-1.5 text-muted transition-colors duration-150 hover:bg-raised hover:text-ink">
              ${icon('x', 'h-4 w-4')}
            </button>
          </div>`;
      } else {
        content.innerHTML = `
          ${icon('image-plus', 'mx-auto h-6 w-6 text-gold')}
          <p class="mt-2 text-sm font-medium text-ink">
            Drag &amp; drop or
            <button type="button" data-browse class="text-gold underline-offset-2 hover:underline">browse</button>
          </p>
          <p class="mt-1 text-xs text-muted">JPG, PNG or WebP · plain backdrop works best</p>`;
      }
    }

    function renderError() {
      const p = $('#upload-error');
      p.textContent = u.error || '';
      p.style.display = u.error ? '' : 'none';
    }

    function pick(f) {
      if (!f) return;
      if (!ACCEPTED.includes(f.type)) {
        u.error = 'Please choose a JPG, PNG or WebP image.';
        renderError();
        return;
      }
      u.error = null;
      u.file = f;
      u.preview = URL.createObjectURL(f);
      renderError();
      renderDropzone();
    }

    content.addEventListener('click', (e) => {
      if (e.target.closest('[data-browse]')) input.click();
      if (e.target.closest('[data-remove]')) {
        u.file = null;
        u.preview = null;
        renderDropzone();
      }
    });
    input.addEventListener('change', () => {
      pick(input.files && input.files[0]);
      input.value = '';
    });
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      u.dragging = true;
      renderDropzone();
    });
    dropzone.addEventListener('dragleave', () => {
      u.dragging = false;
      renderDropzone();
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      u.dragging = false;
      renderDropzone();
      pick(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    });
    select.addEventListener('change', () => {
      u.category = select.value;
      const dc = drawerCategories.find((c) => c.id === u.category);
      $('#upload-sub').textContent = `Background is removed, then it goes straight to the ${dc ? dc.drawerName : 'rail'}.`;
      $('#upload-hint').textContent = dc ? 'Goes into its own drawer, not onto the rail' : 'Sets the movement settings it starts with';
    });
    $('#garment-name').addEventListener('input', (e) => (u.name = e.target.value));

    $('#upload-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!u.file) {
        u.error = 'Add a photo of the garment first.';
        renderError();
        return;
      }
      if (uploadGarment(u.file, u.category, u.name.trim())) {
        u.file = null;
        u.preview = null;
        u.name = '';
        u.error = null;
        $('#garment-name').value = '';
        renderError();
        renderDropzone();
      }
    });

    renderDropzone();
    renderError();
  }

  /* ===========================================================================
     UI: WARDROBE PANEL (stage + garment nav + motion inspector)
     ========================================================================= */

  function buildWardrobePanel() {
    $('#wardrobe-panel').innerHTML = `
      <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 id="wardrobe-title" class="font-serif text-3xl leading-none text-ink">Wardrobe</h2>
          <p id="wardrobe-count" class="mt-1.5 text-sm text-muted"></p>
        </div>
        <button type="button" id="wardrobe-toggle"
          class="whitespace-nowrap rounded-full border border-line bg-raised px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-gold/50"></button>
      </header>
      <div id="wardrobe-closed" class="p-4 sm:p-6">
        <div id="wardrobe-room" class="wardrobe-room relative h-[380px] overflow-hidden rounded-xl border border-line sm:h-[440px]">
          <span class="ward-hook" style="left: calc(50% - 40px)" aria-hidden="true"></span>
          <span class="ward-hook" style="left: calc(50% + 28px)" aria-hidden="true"></span>
          <div class="ward-door ward-door--left" aria-hidden="true"></div>
          <div class="ward-door ward-door--right" aria-hidden="true"></div>
          <div class="ward-overlay absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p id="wardrobe-closed-text" class="rounded-full bg-panel/90 px-4 py-2 text-sm text-muted"></p>
            <button type="button" id="wardrobe-open-btn"
              class="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-ink transition-colors duration-150 hover:bg-gold-hover">Open wardrobe</button>
          </div>
        </div>
      </div>
      <div id="wardrobe-body" class="space-y-6 p-4 sm:p-6">
        <div id="wardrobe-stage"></div>
        <nav id="wardrobe-nav" aria-label="Garments on the rail" class="-mt-2 flex gap-1.5 overflow-x-auto pb-1"></nav>
        <div id="wardrobe-inspector"></div>
      </div>`;

    $('#wardrobe-toggle').addEventListener('click', () => setWardrobeOpen(!S.wardrobeOpen));
    $('#wardrobe-open-btn').addEventListener('click', () => setWardrobeOpen(true));

    $('#wardrobe-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-garment]');
      if (btn) selectGarment(btn.dataset.garment);
    });

    const inspector = $('#wardrobe-inspector');
    inspector.addEventListener('click', (e) => {
      const garment = selectedGarment();
      if (!garment) return;
      const presetBtn = e.target.closest('[data-preset]');
      if (presetBtn) return changePreset(garment.id, presetBtn.dataset.preset);
      if (e.target.closest('[data-add]')) return addGarmentToOutfit(garment.id);
      if (e.target.closest('[data-front]')) return openFront(garment.id);
      if (e.target.closest('[data-return]')) return returnToOrigin('o-' + garment.id);
      if (e.target.closest('[data-remove]')) return removeGarment(garment.id);
      if (e.target.closest('[data-reset]')) return resetPreset(garment.presetId);
    });
    inspector.addEventListener('input', (e) => {
      const garment = selectedGarment();
      const slider = e.target.closest('input[type="range"][data-key]');
      if (!garment || !slider) return;
      const key = slider.dataset.key;
      const value = Number(slider.value);
      setPresetValue(garment.presetId, key, value);
      const param = presetParameters.find((p) => p.key === key);
      const label = slider.closest('label').querySelector('[data-value]');
      label.textContent = formatValue(param, value);
    });

    renderWardrobeHeader();
    renderNav();
    renderInspector();
    applyWardrobeOpen();
  }

  function renderWardrobeHeader() {
    $('#wardrobe-count').textContent = `${S.garments.length} on the rail`;
    $('#wardrobe-closed-text').textContent = `Wardrobe closed · ${S.garments.length} on the rail`;
    const btn = $('#wardrobe-toggle');
    btn.textContent = S.wardrobeOpen ? 'Close wardrobe' : 'Open wardrobe';
    btn.setAttribute('aria-expanded', String(S.wardrobeOpen));
  }

  /** Mounts / unmounts the stage like the React component did when the panel is opened or closed. */
  function applyWardrobeOpen() {
    $('#wardrobe-body').classList.toggle('hidden', !S.wardrobeOpen);
    $('#wardrobe-closed').classList.toggle('hidden', S.wardrobeOpen);
    if (S.wardrobeOpen && !stage) {
      stage = createWardrobeStage($('#wardrobe-stage'));
    } else if (!S.wardrobeOpen && stage) {
      stage.destroy();
      stage = null;
    }
  }

  /** Opens / closes the wardrobe with the doors sliding apart / shut. */
  let doorTimer = 0;
  function setWardrobeOpen(open) {
    if (open === S.wardrobeOpen && !doorTimer) return;
    window.clearTimeout(doorTimer);
    S.wardrobeOpen = open;
    renderWardrobeHeader();
    const room = $('#wardrobe-room');
    const closedBox = $('#wardrobe-closed');

    if (open) {
      // doors slide apart, then the rail appears
      closedBox.classList.remove('hidden');
      $('#wardrobe-body').classList.add('hidden');
      room.classList.add('is-opening');
      doorTimer = window.setTimeout(() => {
        doorTimer = 0;
        applyWardrobeOpen();
        room.classList.remove('is-opening');
      }, 450);
    } else {
      // previewed garments go back to the rail; pieces added to the outfit stay selected
      S.selectedId = null;
      closeModal();
      renderNav();
      renderInspector();
      // rail goes away, doors slide shut
      room.classList.add('is-opening');
      applyWardrobeOpen();
      reflow(room);
      room.classList.remove('is-opening');
      doorTimer = window.setTimeout(() => (doorTimer = 0), 450);
    }
  }

  function renderNav() {
    $('#wardrobe-nav').innerHTML = S.garments
      .map(
        (g) => `
      <button type="button" data-garment="${esc(g.id)}" aria-pressed="${g.id === S.selectedId}"
        class="whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
          g.id === S.selectedId ? 'bg-raised text-ink' : 'text-muted hover:text-ink'
        }">${esc(g.name)}</button>`
      )
      .join('');
  }

  function formatValue(param, value) {
    switch (param.format) {
      case 'multiplier':
        return `${value.toFixed(2)}×`;
      case 'px':
        return `${Math.round(value)} px`;
      case 'momentum':
        return `${Math.round(((value - param.min) / (param.max - param.min)) * 100)}%`;
      default:
        return `${Math.round(value * 100)}%`;
    }
  }

  function thumbStatusHtml(texture) {
    if (!texture) return '';
    if (texture.status === 'processing') return 'Removing background…';
    if (texture.status === 'error') return '<span class="text-[#d9877a]">Image could not be loaded</span>';
    if (texture.status === 'ready') {
      return texture.backgroundRemoved
        ? `${icon('check', 'h-3.5 w-3.5 text-positive')}Background removed`
        : 'Original background kept';
    }
    return '';
  }

  function thumbBoxHtml(garment, texture) {
    return texture && texture.thumb
      ? `<img src="${esc(texture.thumb)}" alt="${esc(garment.name)} cut-out" class="max-h-full max-w-full object-contain" />`
      : `<span class="animate-spin text-muted">${icon('loader', 'h-5 w-5', 'Processing')}</span>`;
  }

  /** Updates only the cut-out preview + status line (so sliders are never rebuilt mid-drag). */
  function updateInspectorThumb() {
    const garment = selectedGarment();
    const box = $('#insp-thumb');
    if (!garment || !box) return;
    const texture = S.textures[garment.id];
    box.innerHTML = thumbBoxHtml(garment, texture);
    $('#insp-status').innerHTML = thumbStatusHtml(texture);
  }

  function renderInspector() {
    const root = $('#wardrobe-inspector');
    if (!root) return;
    const garment = selectedGarment();
    if (!garment) {
      root.innerHTML = '<p class="text-sm text-muted">Select a garment to see how it moves.</p>';
      return;
    }
    const texture = S.textures[garment.id];
    const preset = S.presets[garment.presetId];
    const sharedCount = S.garments.filter((g) => g.presetId === garment.presetId).length;
    const inOutfit = S.outfit.some((o) => o.garmentId === garment.id);

    root.innerHTML = `
      <section aria-label="${esc(garment.name)} motion settings" class="grid gap-6 md:grid-cols-[168px_1fr]">
        <div>
          <div id="insp-thumb" class="flex h-52 items-center justify-center rounded-xl bg-raised p-4">${thumbBoxHtml(garment, texture)}</div>
          <p id="insp-status" class="mt-2.5 flex items-center gap-1.5 text-xs text-muted">${thumbStatusHtml(texture)}</p>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="font-serif text-2xl leading-tight text-ink">${esc(garment.name)}</h3>
              <p class="text-sm text-muted">Drag it on the rail to feel how it moves · swipe right to add</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-front
                class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-gold/50">
                ${icon('eye', 'h-4 w-4')}
                Front view
              </button>
              ${
                inOutfit
                  ? `<button type="button" data-return class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/50 px-4 py-2 text-sm font-medium text-gold transition-colors duration-150 hover:bg-gold/10">${icon('rotate-ccw', 'h-4 w-4')}Return to rail</button>`
                  : `<button type="button" data-add class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-ink transition-colors duration-150 hover:bg-gold-hover">${icon('plus', 'h-4 w-4')}Add to outfit</button>`
              }
              ${garment.uploaded ? `<button type="button" data-remove class="x-danger">Remove</button>` : ''}
            </div>
          </div>

          <div class="mt-5">
            <p id="preset-label" class="text-sm font-medium text-ink">Movement settings</p>
            <div role="radiogroup" aria-labelledby="preset-label" class="mt-2 flex flex-wrap gap-1.5">
              ${motionPresets
                .map((p) => {
                  const active = p.id === garment.presetId;
                  return `<button type="button" role="radio" aria-checked="${active}" data-preset="${p.id}"
                    class="rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                      active ? 'border-gold bg-gold/15 text-ink' : 'border-line text-muted hover:border-gold/50 hover:text-ink'
                    }">${esc(p.label)}</button>`;
                })
                .join('')}
            </div>
            <p class="mt-2 text-sm text-muted">${esc(preset.description)}</p>
          </div>

          <div class="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            ${presetParameters
              .map(
                (param) => `
              <label class="block">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="text-sm text-ink">${esc(param.label)}</span>
                  <span data-value class="text-xs tabular-nums text-gold">${formatValue(param, preset[param.key])}</span>
                </span>
                <input type="range" data-key="${param.key}" min="${param.min}" max="${param.max}" step="${param.step}" value="${preset[param.key]}" class="mt-1.5 w-full" />
                <span class="text-xs text-subtle">${esc(param.hint)}</span>
              </label>`
              )
              .join('')}
          </div>

          <div class="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
            <p class="text-xs text-muted">
              ${esc(preset.label)} settings are shared by ${sharedCount} ${sharedCount === 1 ? 'garment' : 'garments'} — changes apply live.
            </p>
            <button type="button" data-reset
              class="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:text-ink">
              ${icon('rotate-ccw', 'h-3.5 w-3.5')}
              Reset ${esc(preset.label.toLowerCase())}
            </button>
          </div>
        </div>
      </section>`;
  }

  /* ===========================================================================
     7. WARDROBE STAGE  (canvas + physics loop + pointer interaction)
     Creates the stage inside `container`; returns { refresh, destroy }.
     ========================================================================= */

  let stage = null;

  const ADD_THRESHOLD = 150;
  const STEP_MS = 1000 / 60;
  const RESTING_YAW = -0.55;

  function anchorFor(x) {
    return { x, y: WARDROBE.railY + WARDROBE.hangerDrop, pivotY: WARDROBE.railY };
  }

  function createWardrobeStage(container) {
    container.className = 'relative w-full overflow-hidden rounded-xl border border-line';
    container.innerHTML = `
      <canvas class="block w-full touch-pan-y select-none" role="img"
        aria-label="Wardrobe rail. Drag a garment to move it; pull it to the right to add it to the outfit."></canvas>

      <button type="button" data-prev aria-label="Previous garments"
        class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-panel/90 text-ink transition-colors duration-150 hover:border-gold/60 disabled:opacity-30">
        ${icon('chevron-left', 'h-4 w-4')}
      </button>
      <button type="button" data-next aria-label="Next garments"
        class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-panel/90 text-ink transition-colors duration-150 hover:border-gold/60 disabled:opacity-30">
        ${icon('chevron-right', 'h-4 w-4')}
      </button>

      <div data-processing role="status"
        class="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-line bg-panel/95 px-3 py-1.5 text-xs text-muted">
        <span class="animate-spin text-gold">${icon('loader', 'h-3.5 w-3.5')}</span>
        <span data-processing-text></span>
      </div>

      <div data-ready class="stage-ready pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-sm font-medium text-gold-ink">
        ${icon('plus', 'h-4 w-4')}
        Release to add to outfit
      </div>`;

    const canvas = $('canvas', container);
    const prevBtn = $('[data-prev]', container);
    const nextBtn = $('[data-next]', container);
    const processingEl = $('[data-processing]', container);
    const processingText = $('[data-processing-text]', container);
    const readyEl = $('[data-ready]', container);

    // ---- state (was React refs / state) ----
    let size = { w: 0, h: 440 };
    let scrollIndex = 0;
    let readyToAdd = false;
    let scrollAnim = 0;
    const entries = new Map();
    let drawOrder = [];
    let hovered = null;
    let drag = null;
    let railDrag = null;
    let wheelTimer = 0;
    let pointer = { x: 0, y: 0 };
    let cam = { cx: 0, cy: 0, f: 820 };
    let raf = 0;
    let destroyed = false;

    // deps tracked for the "scroll the selected garment into view" effect
    let lastSelectedDeps = null;

    canvas.style.height = size.h + 'px';

    const currentLayout = () => stageLayout(size.w, S.garments.length);

    function setScrollIndex(v) {
      scrollIndex = v;
      updateOverlay();
    }

    function setReadyToAdd(v) {
      if (v === readyToAdd) return;
      readyToAdd = v;
      readyEl.classList.toggle('is-visible', v);
    }

    /** Updates arrows, the "Removing backgrounds" badge, and keeps scroll in range. */
    function updateOverlay() {
      const layout = currentLayout();
      const showArrows = layout.maxScroll > 0;
      prevBtn.style.display = showArrows ? '' : 'none';
      nextBtn.style.display = showArrows ? '' : 'none';
      prevBtn.disabled = scrollIndex === 0;
      nextBtn.disabled = scrollIndex === layout.maxScroll;

      const processing = S.garments.filter((g) => S.textures[g.id] && S.textures[g.id].status === 'processing').length;
      processingEl.style.display = processing > 0 ? '' : 'none';
      processingText.textContent = `Removing backgrounds · ${S.garments.length - processing} of ${S.garments.length}`;
    }

    prevBtn.addEventListener('click', () => setScrollIndex(Math.max(0, scrollIndex - 1)));
    nextBtn.addEventListener('click', () => setScrollIndex(Math.min(currentLayout().maxScroll, scrollIndex + 1)));

    /** Called whenever app state (garments, selection, textures, presets) changes. */
    function refresh() {
      if (destroyed) return;
      const layout = currentLayout();
      if (scrollIndex > layout.maxScroll) scrollIndex = layout.maxScroll;

      const deps = [S.selectedId, S.garments, layout.visible, layout.maxScroll];
      const changed = !lastSelectedDeps || deps.some((d, i) => d !== lastSelectedDeps[i]);
      lastSelectedDeps = deps;
      if (changed) {
        const idx = S.garments.findIndex((g) => g.id === S.selectedId);
        if (idx >= 0) {
          if (idx < scrollIndex) scrollIndex = idx;
          else if (idx >= scrollIndex + layout.visible) scrollIndex = Math.min(layout.maxScroll, idx - layout.visible + 1);
        }
      }
      updateOverlay();
    }

    // ---- resize ----
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = w < 640 ? 380 : 440;
      if (w === size.w && h === size.h) return;
      size = { w, h };
      canvas.style.height = h + 'px';
      refresh();
      setup();
    });
    observer.observe(container);

    // ---- canvas + animation loop ----
    let stopLoop = () => {};

    function setup() {
      stopLoop();
      if (destroyed || size.w === 0) return;
      const ctx = canvas.getContext('2d');
      const layer = document.createElement('canvas');
      const lctx = layer.getContext('2d');
      if (!ctx || !lctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { w, h } = size;
      canvas.width = layer.width = Math.round(w * dpr);
      canvas.height = layer.height = Math.round(h * dpr);
      cam = { cx: w / 2, cy: h * 0.4, f: 820 };
      entries.clear();

      const ensureEntry = (garment, texture, anchorX) => {
        const existing = entries.get(garment.id);
        if (!texture || texture.status !== 'ready' || !texture.canvas) return null;
        if (existing && existing.source === texture.canvas) return existing;
        const source = texture.canvas;
        const maxH = h - (WARDROBE.railY + WARDROBE.hangerDrop) - WARDROBE.floor - 14;
        const scale = h < 420 ? 0.85 : 1;
        const baseW = (garment.category === 'trousers' ? 82 : garment.category === 'outerwear' ? 112 : 106) * scale;
        const aspect = source.height / source.width;
        let gw = baseW;
        let gh = baseW * aspect;
        if (gh > maxH) {
          gh = maxH;
          gw = gh / aspect;
        }
        const cloth = createCloth(gw, gh, anchorFor(anchorX), RESTING_YAW);
        const entry = {
          cloth,
          source,
          proj: new Float32Array(cloth.x.length * 2),
          bounds: { x0: 0, y0: 0, x1: 0, y1: 0 }
        };
        entries.set(garment.id, entry);
        return entry;
      };

      let last = performance.now();
      let acc = 0;

      const tick = (now) => {
        acc += Math.min(now - last, 100);
        last = now;
        let steps = Math.floor(acc / STEP_MS);
        acc -= steps * STEP_MS;
        steps = Math.min(steps, 4);

        const { garments, textures, presets, selectedId, showMesh } = S;
        const { slot, startX } = stageLayout(w, garments.length);
        const xFor = (i) => startX + (i - scrollAnim) * slot;
        const inOutfit = new Set(S.outfit.map((o) => o.garmentId).filter(Boolean));

        for (let s = 0; s < steps; s++) {
          scrollAnim += (scrollIndex - scrollAnim) * 0.14;
          garments.forEach((garment, i) => {
            const entry = ensureEntry(garment, textures[garment.id], xFor(i));
            if (!entry) return;
            const isDragged = drag && drag.id === garment.id;
            const ghost = inOutfit.has(garment.id);
            const returning = S.returned[garment.id] && now - S.returned[garment.id] < 700;
            const active = !ghost && (isDragged || hovered === garment.id || selectedId === garment.id);
            const lift = isDragged ? -50 : returning ? -44 : ghost ? 0 : selectedId === garment.id ? -34 : hovered === garment.id ? -18 : 0;
            let grab = null;
            if (isDragged && drag) {
              const z = entry.cloth.z[drag.index];
              const world = unprojectPoint(pointer.x, pointer.y, z, cam);
              grab = { index: drag.index, x: world.x, y: world.y };
            }
            const preset = presets[garment.presetId];
            stepCloth(entry.cloth, anchorFor(xFor(i)), preset, { yaw: active ? 0 : RESTING_YAW, lift }, grab);
          });
        }

        // Render
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        drawWardrobe(ctx, w, h);

        const priority = (id) => (drag && drag.id === id ? 3 : selectedId === id ? 2 : hovered === id ? 1 : 0);
        const order = garments.map((g, i) => ({ g, i })).sort((a, b) => priority(a.g.id) - priority(b.g.id));
        drawOrder = order.map((o) => o.g.id);

        ctx.save();
        ctx.beginPath();
        ctx.rect(WARDROBE.side, 0, w - WARDROBE.side * 2, h);
        ctx.clip();

        let labelTarget = null;
        for (const { g, i } of order) {
          const ax = xFor(i);
          if (ax < WARDROBE.side - 90 || ax > w - WARDROBE.side + 90) continue;
          const entry = entries.get(g.id);
          const texture = textures[g.id];
          if (!entry || !texture || texture.status !== 'ready') {
            drawPlaceholder(ctx, ax, texture && texture.status === 'error' ? 'error' : 'processing');
            continue;
          }
          entry.bounds = projectCloth(entry.cloth, cam, entry.proj);

          lctx.setTransform(1, 0, 0, 1, 0, 0);
          lctx.clearRect(0, 0, layer.width, layer.height);
          lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          renderClothLayer(lctx, entry.cloth, entry.proj, entry.source, showMesh);

          const depth = -entry.cloth.lift;
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          const ghostDraw = inOutfit.has(g.id);
          if (ghostDraw) ctx.globalAlpha = 0.13;
          ctx.shadowColor = ghostDraw ? 'transparent' : 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = (12 + depth * 0.3) * dpr;
          ctx.shadowOffsetX = (7 + depth * 0.2) * dpr;
          ctx.shadowOffsetY = (10 + depth * 0.22) * dpr;
          ctx.drawImage(layer, 0, 0);
          ctx.restore();

          const cols = entry.cloth.cols;
          const p = entry.proj;
          drawHanger(
            ctx,
            { x: p[0], y: p[1] },
            { x: p[(cols - 1) * 2], y: p[(cols - 1) * 2 + 1] },
            projectPoint(ax, WARDROBE.railY, 0, cam)
          );

          const showLabel = hovered ? hovered === g.id : selectedId === g.id;
          if (showLabel) {
            const bottom = (entry.cloth.rows - 1) * cols + Math.floor(cols / 2);
            labelTarget = { text: inOutfit.has(g.id) ? g.name + ' · in outfit' : g.name, x: p[bottom * 2], y: Math.min(p[bottom * 2 + 1] + 10, h - 30) };
          }
        }
        ctx.restore();

        if (labelTarget) drawGarmentLabel(ctx, labelTarget.text, labelTarget.x, labelTarget.y);
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      stopLoop = () => cancelAnimationFrame(raf);
    }

    // ---- pointer interaction ----
    const toLocal = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const hitTest = (x, y) => {
      for (let i = drawOrder.length - 1; i >= 0; i--) {
        if (S.outfit.some((o) => o.garmentId === drawOrder[i])) continue;
        const entry = entries.get(drawOrder[i]);
        if (!entry) continue;
        const b = entry.bounds;
        if (x >= b.x0 - 4 && x <= b.x1 + 4 && y >= b.y0 - 4 && y <= b.y1 + 4) return drawOrder[i];
      }
      return null;
    };

    canvas.addEventListener('pointerdown', (e) => {
      const { x, y } = toLocal(e);
      const id = hitTest(x, y);
      if (!id) {
        // empty rail: drag sideways to browse
        railDrag = { startX: x, startIndex: scrollIndex };
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
        return;
      }
      const entry = entries.get(id);
      if (!entry) return;
      const { cols, x: cx } = entry.cloth;
      let best = cols * 2;
      let bestDist = Infinity;
      for (let i = cols * 2; i < cx.length; i++) {
        const d = Math.hypot(entry.proj[i * 2] - x, entry.proj[i * 2 + 1] - y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      pointer = { x, y };
      drag = { id, index: best, startX: x, startY: y, moved: false };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('pointermove', (e) => {
      const { x, y } = toLocal(e);
      pointer = { x, y };
      if (railDrag) {
        const lay = currentLayout();
        setScrollIndex(Math.min(lay.maxScroll, Math.max(0, railDrag.startIndex - (x - railDrag.startX) / lay.slot)));
        return;
      }
      if (drag) {
        if (Math.hypot(x - drag.startX, y - drag.startY) > 5) drag.moved = true;
        setReadyToAdd(x - drag.startX > ADD_THRESHOLD);
        return;
      }
      const id = hitTest(x, y);
      hovered = id;
      canvas.style.cursor = id ? 'grab' : 'default';
    });

    canvas.addEventListener('pointerup', (e) => {
      if (railDrag) {
        setScrollIndex(Math.round(scrollIndex));
        railDrag = null;
        canvas.style.cursor = 'default';
        return;
      }
      if (!drag) return;
      const { x } = toLocal(e);
      const dragged = drag;
      selectGarment(dragged.id);
      if (dragged.moved && x - dragged.startX > ADD_THRESHOLD) addGarmentToOutfit(dragged.id);
      else if (!dragged.moved) openFront(dragged.id);
      drag = null;
      setReadyToAdd(false);
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const lay = currentLayout();
      setScrollIndex(Math.min(lay.maxScroll, Math.max(0, scrollIndex + e.deltaX / (lay.slot * 1.2))));
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => setScrollIndex(Math.round(scrollIndex)), 140);
    }, { passive: false });

    canvas.addEventListener('pointercancel', () => {
      railDrag = null;
      drag = null;
      setReadyToAdd(false);
    });

    canvas.addEventListener('pointerleave', () => {
      if (!drag) hovered = null;
    });

    refresh();

    return {
      refresh,
      destroy() {
        destroyed = true;
        stopLoop();
        observer.disconnect();
        container.innerHTML = '';
      }
    };
  }

  /* ===========================================================================
     UI: DRAWERS (accessories + shoes)
     ========================================================================= */

  const drawers = [
    { rootId: 'accessory-drawer', title: 'Accessory drawer', kind: 'accessory' },
    { rootId: 'shoe-drawer', title: 'Shoe drawer', kind: 'shoes' }
  ];

  function drawerThumbHtml(item) {
    const tex = S.textures[item.id];
    if (!tex || tex.status === 'processing') {
      return `<span class="animate-spin text-muted">${icon('loader', 'h-5 w-5', 'Processing')}</span>`;
    }
    if (tex.status === 'error' || !tex.thumb) return '<span class="px-2 text-center text-xs text-muted">Photo unavailable</span>';
    return tex.backgroundRemoved
      ? `<img src="${esc(tex.thumb)}" alt="${esc(item.name)}" draggable="false" class="h-full w-full object-contain p-3" />`
      : `<img src="${esc(tex.thumb)}" alt="${esc(item.name)}" draggable="false" class="h-full w-full object-cover" />`;
  }

  function buildDrawers() {
    drawers.forEach((d) => {
      const root = $('#' + d.rootId);
      root.innerHTML = `
        <button type="button" data-drawer-toggle aria-expanded="false" aria-controls="${d.rootId}-items"
          class="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 text-left sm:grid-cols-[1fr_120px_1fr]">
          <span>
            <span class="block font-serif text-3xl leading-none text-ink">${esc(d.title)}</span>
            <span data-drawer-count class="mt-1.5 block text-sm text-muted"></span>
          </span>
          <span aria-hidden="true" class="hidden h-1.5 w-full rounded-full bg-gold/50 sm:block"></span>
          <span class="flex items-center justify-end gap-1 text-sm font-medium text-gold">
            <span data-drawer-label>Open</span>
            <span data-drawer-chevron class="transition-transform duration-200">${icon('chevron-down', 'h-4 w-4')}</span>
          </span>
        </button>
        <div id="${d.rootId}-items" class="drawer-collapse">
          <div class="drawer-collapse-inner">
            <ul data-drawer-list class="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4 border-t border-line p-6"></ul>
          </div>
        </div>`;

      $('[data-drawer-toggle]', root).addEventListener('click', () => {
        S.drawerOpen[d.rootId] = !S.drawerOpen[d.rootId];
        renderDrawers();
      });
      $('[data-drawer-list]', root).addEventListener('click', (e) => {
        const view = e.target.closest('[data-view-item]');
        if (view) return openDrawerFront(d.rootId, view.dataset.viewItem);
        const ret = e.target.closest('[data-return-item]');
        if (ret) return returnToOrigin(ret.dataset.returnItem);
        const del = e.target.closest('[data-remove-item-drawer]');
        if (del) return removeDrawerItem(d.rootId, del.dataset.removeItemDrawer);
        const btn = e.target.closest('[data-add-item]');
        if (!btn || btn.disabled) return;
        const item = S.drawerItems[d.rootId].find((i) => i.id === btn.dataset.addItem);
        if (item) addDrawerItem(item, d.kind);
      });
    });
    renderDrawers();
  }

  function renderDrawers() {
    const inOutfitIds = S.outfit.map((o) => o.id);
    drawers.forEach((d) => {
      const root = $('#' + d.rootId);
      const open = !!S.drawerOpen[d.rootId];
      const items = S.drawerItems[d.rootId];
      const inside = items.filter((i) => !inOutfitIds.includes(i.id)).length;

      $('[data-drawer-count]', root).textContent = `${inside} of ${items.length} inside`;
      $('[data-drawer-toggle]', root).setAttribute('aria-expanded', String(open));
      $('[data-drawer-label]', root).textContent = open ? 'Close' : 'Open';
      $('[data-drawer-chevron]', root).classList.toggle('rotate-180', open);
      $('.drawer-collapse', root).classList.toggle('is-open', open);

      $('[data-drawer-list]', root).innerHTML = items
        .map((item) => {
          const added = inOutfitIds.includes(item.id);
          return `
          <li class="min-w-0">
            <button type="button" data-view-item="${esc(item.id)}" aria-label="View ${esc(item.name)}"
              class="x-drawer-thumb flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-raised">${drawerThumbHtml(item)}</button>
            <p class="mt-2 truncate text-sm text-ink">${esc(item.name)}</p>
            <button type="button" ${added ? 'data-return-item' : 'data-add-item'}="${esc(item.id)}"
              class="-ml-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-gold transition-colors duration-150 hover:bg-gold/10 disabled:text-muted disabled:hover:bg-transparent">
              ${added ? icon('rotate-ccw', 'h-4 w-4') : icon('plus', 'h-4 w-4')}
              ${added ? 'Return' : 'Add'}
            </button>
            ${item.uploaded ? `<button type="button" data-remove-item-drawer="${esc(item.id)}" aria-label="Remove ${esc(item.name)}" class="x-mini-remove">${icon('trash-2', 'h-3.5 w-3.5')}</button>` : ''}
          </li>`;
        })
        .join('');
    });
  }

  /* ===========================================================================
     UI: STYLING AREA (outfit + saved looks)
     ========================================================================= */

  function buildStylingArea() {
    const root = $('#styling-area');
    root.innerHTML = `
      <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 id="styling-title" class="font-serif text-3xl leading-none text-ink">Styling area</h2>
          <p id="styling-count" class="mt-1.5 text-sm text-gold"></p>
        </div>
        <button type="button" id="styling-toggle"
          class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-raised px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-gold/50"></button>
      </header>

      <div id="styling-body">
        <div class="p-6">
          <div id="outfit-empty" class="rounded-xl border border-dashed border-line px-6 py-14 text-center">
            <p class="font-serif text-2xl text-ink">Start building a look</p>
            <p class="mx-auto mt-2 max-w-xs text-sm text-muted">
              Pick a garment from the rail or a drawer, then press Add to outfit or pull it right.
            </p>
          </div>
          <ul id="outfit-list" class="grid grid-cols-2 gap-3"></ul>
          <p id="outfit-hint" class="mt-3 text-xs text-subtle">Swipe a piece left to return it to where it came from.</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-5">
          <button type="button" id="outfit-clear"
            class="text-sm text-muted transition-colors duration-150 hover:text-ink disabled:text-subtle">Clear outfit</button>
          <div class="flex gap-2">
            <button type="button" id="outfit-review"
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-gold/50 disabled:text-subtle disabled:hover:border-line">
              ${icon('sparkles', 'h-4 w-4')}
              Review · 5
            </button>
            <button type="button" id="outfit-save"
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-gold-ink transition-colors duration-150 hover:bg-gold-hover disabled:bg-gold/40">
              ${icon('bookmark', 'h-4 w-4')}
              Save look · 3
            </button>
          </div>
        </div>
      </div>

      <div class="border-t border-line px-6 py-5">
        <h3 class="text-sm font-semibold text-ink">Saved looks</h3>
        <p id="saved-empty" class="mt-2 text-sm text-muted">No saved looks yet. Build an outfit and press Save look.</p>
        <ul id="saved-list" class="mt-3 divide-y divide-line"></ul>
      </div>`;

    $('#styling-toggle').addEventListener('click', () => {
      S.stylingVisible = !S.stylingVisible;
      renderStylingHeader();
    });
    $('#outfit-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-item]');
      if (btn) returnToOrigin(btn.dataset.removeItem);
    });
    $('#outfit-clear').addEventListener('click', clearOutfit);
    $('#outfit-review').addEventListener('click', () => {
      if (!spend(5)) return;
      toast.success('Review requested — a (simulated) reply is coming in chat');
      if (chatApi) chatApi.receive('Thanks for sending this look — the proportions work well together. I would keep the shoes and swap the tie.');
    });
    $('#outfit-save').addEventListener('click', () => {
      if (!spend(3)) return;
      S.savedLooks = [
        ...S.savedLooks,
        { id: `look-${Date.now()}`, name: `Look ${S.savedLooks.length + 1}`, items: S.outfit, savedAt: new Date() }
      ];
      renderSavedLooks();
      toast.success('Look saved');
    });

    bindOutfitSwipe();
    renderStylingHeader();
    renderOutfit();
    renderSavedLooks();
  }

  function renderStylingHeader() {
    const btn = $('#styling-toggle');
    btn.setAttribute('aria-expanded', String(S.stylingVisible));
    btn.innerHTML = `${S.stylingVisible ? icon('eye-off', 'h-4 w-4') : icon('eye', 'h-4 w-4')}${
      S.stylingVisible ? 'Close styling' : 'Open styling'
    }`;
    $('#styling-body').classList.toggle('hidden', !S.stylingVisible);
  }

  function outfitThumbHtml(item) {
    const tex = S.textures[item.garmentId || item.id];
    const thumb = tex ? tex.thumb : undefined;
    return thumb
      ? `<img src="${esc(thumb)}" alt="" class="max-h-full max-w-full object-contain" />`
      : `<span class="h-12 w-12 rounded-lg border border-white/10" style="background: ${esc(item.color || '#2a2521')}"></span>`;
  }

  /** Keyed list update: new items fade/scale in, removed items fade out, siblings glide to their new spot. */
  function renderOutfit() {
    const list = $('#outfit-list');
    if (!list) return;
    const empty = S.outfit.length === 0;

    $('#styling-count').textContent = `${S.outfit.length} ${S.outfit.length === 1 ? 'piece' : 'pieces'}`;
    $('#outfit-clear').disabled = empty;
    $('#outfit-review').disabled = empty;
    $('#outfit-save').disabled = empty;

    const live = [...list.children].filter((li) => !li.classList.contains('is-leaving'));
    const before = new Map(live.map((li) => [li, li.getBoundingClientRect()]));
    const byId = new Map(live.map((li) => [li.dataset.id, li]));
    const wanted = new Set(S.outfit.map((i) => i.id));

    // exits
    live.forEach((li) => {
      if (wanted.has(li.dataset.id)) return;
      li.classList.add('is-leaving');
      window.setTimeout(() => {
        const rects = new Map([...list.children].filter((c) => c !== li).map((c) => [c, c.getBoundingClientRect()]));
        li.remove();
        flip(rects);
        syncEmptyState();
      }, 200);
    });

    // enters + updates
    S.outfit.forEach((item) => {
      let li = byId.get(item.id);
      if (!li) {
        li = document.createElement('li');
        li.dataset.id = item.id;
        li.className = 'outfit-item relative rounded-xl bg-raised p-3';
        li.innerHTML = `
          <div data-thumb class="flex h-28 items-center justify-center">${outfitThumbHtml(item)}</div>
          <p class="mt-2 truncate text-sm font-medium text-ink">${esc(item.name)}</p>
          <p class="text-xs capitalize text-muted">${esc(item.kind)}</p>
          <button type="button" data-remove-item="${esc(item.id)}" aria-label="Remove ${esc(item.name)}"
            class="absolute right-2 top-2 rounded-full p-1.5 text-muted transition-colors duration-150 hover:bg-panel hover:text-ink">
            ${icon('x', 'h-3.5 w-3.5')}
          </button>`;
        list.appendChild(li);
      } else {
        const thumbBox = $('[data-thumb]', li);
        const html = outfitThumbHtml(item);
        if (thumbBox.innerHTML !== html) thumbBox.innerHTML = html;
      }
    });

    flip(before);
    syncEmptyState();
  }

  function syncEmptyState() {
    const list = $('#outfit-list');
    const stillShown = [...list.children].length > 0;
    $('#outfit-empty').style.display = S.outfit.length === 0 && !stillShown ? '' : 'none';
    list.style.display = stillShown ? '' : 'none';
    const hint = $('#outfit-hint');
    if (hint) hint.style.display = stillShown ? '' : 'none';
  }

  /** FLIP: animate elements from their previous rects to where they are now. */
  function flip(beforeRects) {
    beforeRects.forEach((rect, el) => {
      if (!el.isConnected) return;
      const now = el.getBoundingClientRect();
      const dx = rect.left - now.left;
      const dy = rect.top - now.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      reflow(el);
      el.style.transition = 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transform = '';
    });
  }

  function renderSavedLooks() {
    $('#saved-empty').style.display = S.savedLooks.length === 0 ? '' : 'none';
    const list = $('#saved-list');
    list.style.display = S.savedLooks.length === 0 ? 'none' : '';
    list.innerHTML = S.savedLooks
      .map(
        (look) => `
      <li class="py-2.5">
        <p class="text-sm font-medium text-ink">${esc(look.name)}</p>
        <p class="truncate text-xs text-muted">${look.items.map((i) => esc(i.name)).join(' · ')}</p>
      </li>`
      )
      .join('');
  }

  /* ===========================================================================
     UI: CHAT PANEL (simulated replies)
     ========================================================================= */

  function buildChatPanel() {
    const state = { messages: [...initialMessages], typing: false, replyIndex: 0 };
    const firstName = () => client.name.split(' ')[0];
    const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const root = $('#chat-panel');
    root.innerHTML = `
      <header class="flex items-center gap-3 border-b border-line px-6 py-4">
        <img src="${esc(client.avatar)}" alt="" class="h-11 w-11 rounded-full object-cover" />
        <div class="min-w-0 flex-1">
          <p id="chat-title" class="truncate text-sm font-semibold text-ink">Chat with ${esc(client.name)}</p>
          <p class="text-xs text-positive">Online</p>
        </div>
        <span class="hidden whitespace-nowrap rounded-full border border-gold/50 px-2.5 py-1 text-xs font-medium text-gold sm:inline">
          Simulated replies
        </span>
      </header>

      <div id="chat-list" class="flex-1 space-y-4 overflow-y-auto px-6 py-5" aria-live="polite"></div>

      <form id="chat-form" class="flex gap-2 border-t border-line p-4">
        <label for="chat-input" class="sr-only">Message</label>
        <input id="chat-input" placeholder="Write a message…" autocomplete="off"
          class="min-w-0 flex-1 rounded-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-gold focus:outline-none" />
        <button type="submit" id="chat-send" aria-label="Send message" disabled
          class="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-gold-ink transition-colors duration-150 hover:bg-gold-hover disabled:bg-gold/40">
          ${icon('send', 'h-4 w-4')}
        </button>
      </form>`;

    const list = $('#chat-list');
    const input = $('#chat-input');
    const sendBtn = $('#chat-send');

    function renderMessages() {
      list.innerHTML =
        state.messages
          .map((m) => {
            const mine = m.from === 'stylist';
            return `
          <div class="flex flex-col ${mine ? 'items-end' : 'items-start'}">
            <p class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${mine ? 'bg-gold text-gold-ink' : 'bg-raised text-ink'}">${esc(m.text)}</p>
            <span class="mt-1 text-xs text-subtle">${mine ? 'You' : esc(firstName())} · ${esc(m.time)}${m.simulated ? ' · simulated reply' : ''}</span>
          </div>`;
          })
          .join('') + (state.typing ? `<p class="text-xs text-muted">${esc(firstName())} is typing… (simulated)</p>` : '');
      list.scrollTo({ top: list.scrollHeight });
    }

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
    });

    $('#chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      state.messages.push({ id: `m-${Date.now()}`, from: 'stylist', text, time: nowTime() });
      input.value = '';
      sendBtn.disabled = true;
      state.typing = true;
      renderMessages();
      window.setTimeout(() => {
        const reply = simulatedReplies[state.replyIndex % simulatedReplies.length];
        state.replyIndex += 1;
        receive(reply);
      }, 1400);
    });

    function receive(text) {
      state.typing = false;
      state.messages.push({ id: `m-${Date.now()}`, from: 'client', text, time: nowTime(), simulated: true });
      renderMessages();
      S.unreadChat += 1;
      toast(`New message from ${firstName()}: “${text.length > 70 ? text.slice(0, 67) + '…' : text}”`);
      pushNotif(`${client.name} replied (simulated)`, text);
    }
    chatApi = {
      receive(text) {
        state.typing = true;
        renderMessages();
        window.setTimeout(() => receive(text), 1500);
      }
    };

    renderMessages();
  }

  /* ===========================================================================
     10. EXTRAS — top-up checkout, notifications, front view, swipe-to-return,
         staff console, mobile views
     ========================================================================= */

  const nowHM = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const firstNameOf = () => client.name.split(' ')[0];
  const catLabel = (id) => {
    const c = garmentCategories.find((x) => x.id === id) || drawerCategories.find((x) => x.id === id);
    return c ? c.label : 'Garment';
  };
  let chatApi = null;

  /* ---- modal shell ---- */
  let activeModal = null;
  function closeModal() {
    if (!activeModal) return;
    const m = activeModal;
    activeModal = null;
    document.removeEventListener('keydown', m.onKey);
    m.el.classList.add('is-closing');
    window.setTimeout(() => m.el.remove(), 160);
    if (m.returnFocus && m.returnFocus.focus) m.returnFocus.focus();
  }
  function openModal(html, label) {
    closeModal();
    let root = $('#modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    const el = document.createElement('div');
    el.className = 'x-modal';
    el.innerHTML = `<div class="x-modal-card" role="dialog" aria-modal="true" aria-label="${esc(label || 'Dialog')}">${html}</div>`;
    root.appendChild(el);
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    el.addEventListener('mousedown', (e) => {
      if (e.target === el) closeModal();
    });
    activeModal = { el, onKey, returnFocus: document.activeElement };
    const card = el.firstElementChild;
    const first = card.querySelector('[data-autofocus]') || card.querySelector('button');
    if (first) first.focus();
    return card;
  }

  /* ---- credit balance feedback ---- */
  function showDelta(n) {
    const host = $('#credits-value');
    if (!host || !host.parentElement) return;
    const b = document.createElement('span');
    b.className = 'x-delta ' + (n < 0 ? 'is-neg' : 'is-pos');
    b.textContent = (n > 0 ? '+' : '−') + Math.abs(n);
    host.parentElement.appendChild(b);
    window.setTimeout(() => b.remove(), 1300);
    host.classList.remove('x-bump');
    reflow(host);
    host.classList.add('x-bump');
  }

  /* ---- top-up / test checkout ---- */
  const PACKS = [
    { id: 'p50', credits: 50, price: '$4.99', note: '' },
    { id: 'p120', credits: 120, price: '$9.99', note: 'Most popular' },
    { id: 'p300', credits: 300, price: '$19.99', note: 'Best value' }
  ];

  function openTopUp() {
    let pack = PACKS[1].id;
    const card = openModal('', 'Top up credits');
    const head = (title, sub) => `
      <div class="x-modal-head">
        <div><h2 class="x-modal-title">${title}</h2><p class="x-muted">${sub}</p></div>
        <button type="button" class="x-icon-btn" data-close aria-label="Close">${icon('x', 'h-4 w-4')}</button>
      </div>`;

    function renderChoose() {
      const p = PACKS.find((x) => x.id === pack);
      card.innerHTML = `
        ${head('Top up credits', `Current balance: <strong class="x-strong">${S.credits}</strong> credits`)}
        <p class="x-test-banner">TEST CHECKOUT · no real payment is taken</p>
        <div class="x-packs" role="radiogroup" aria-label="Credit packs">
          ${PACKS.map(
            (k) => `
            <button type="button" role="radio" aria-checked="${k.id === pack}" data-pack="${k.id}" class="x-pack${k.id === pack ? ' is-on' : ''}">
              <span class="x-pack-credits">${k.credits}</span>
              <span class="x-pack-label">credits</span>
              <span class="x-pack-price">${k.price}</span>
              <span class="x-pack-note">${k.note || '&nbsp;'}</span>
            </button>`
          ).join('')}
        </div>
        <button type="button" class="x-primary x-wide" data-pay data-autofocus>Pay ${p.price} · test checkout</button>
        <p class="x-fine">Simulated checkout for demonstration only. No card is charged.</p>`;
      const b = card.querySelector('[data-autofocus]');
      if (b) b.focus();
    }

    function renderProcessing() {
      card.innerHTML = `
        ${head('Processing test payment…', 'Please wait')}
        <div class="x-center"><span class="animate-spin text-gold">${icon('loader', 'h-8 w-8')}</span></div>`;
    }

    function renderDone(p, order) {
      card.innerHTML = `
        ${head('Test purchase confirmed', 'This was a simulated checkout')}
        <div class="x-done">
          <span class="x-done-check">${icon('check', 'h-6 w-6')}</span>
          <p class="x-done-big">+${p.credits} credits</p>
          <p class="x-muted">Order ${order} · ${p.price} · TEST</p>
          <p class="x-muted">New balance: <strong class="x-strong">${S.credits}</strong> credits</p>
        </div>
        <button type="button" class="x-primary x-wide" data-close data-autofocus>Done</button>`;
      const b = card.querySelector('[data-autofocus]');
      if (b) b.focus();
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return closeModal();
      const pk = e.target.closest('[data-pack]');
      if (pk) {
        pack = pk.dataset.pack;
        return renderChoose();
      }
      if (e.target.closest('[data-pay]')) {
        const p = PACKS.find((x) => x.id === pack);
        renderProcessing();
        window.setTimeout(() => {
          if (!card.isConnected) return;
          S.credits += p.credits;
          updateHeader();
          showDelta(p.credits);
          const order = 'TEST-' + Math.floor(100000 + Math.random() * 900000);
          pushNotif('Test purchase confirmed', `${p.credits} credits added (${order}).`);
          toast.success(`Test purchase confirmed · +${p.credits} credits`);
          renderDone(p, order);
        }, 1100);
      }
    });
    renderChoose();
  }

  /* ---- notifications (bell) ---- */
  function pushNotif(title, text) {
    S.notifs.unshift({ id: Date.now() + Math.random(), title, text, time: nowHM(), read: false });
    S.notifs = S.notifs.slice(0, 20);
    renderBell();
  }
  function renderBell() {
    const btn = $('#bell');
    if (!btn) return;
    const unread = S.notifs.filter((n) => !n.read).length;
    const badge = $('[data-bell-count]', btn);
    badge.hidden = unread === 0;
    badge.textContent = unread > 9 ? '9+' : String(unread);
    btn.setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications');
    const pop = $('#bell-pop');
    if (!pop.hidden) {
      pop.innerHTML = notifListHtml();
    }
    updateMobileTabs();
  }
  function notifListHtml() {
    if (!S.notifs.length) return '<p class="x-pop-empty">No notifications yet.</p>';
    return `<ul>${S.notifs
      .map(
        (n) => `<li class="x-notif"><p class="x-notif-title">${esc(n.title)}<span>${esc(n.time)}</span></p><p class="x-notif-text">${esc(n.text)}</p></li>`
      )
      .join('')}</ul>`;
  }
  function setupBell() {
    const btn = $('#bell');
    const pop = $('#bell-pop');
    const close = () => {
      pop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!pop.hidden) return close();
      S.notifs.forEach((n) => (n.read = true));
      pop.hidden = false;
      pop.innerHTML = notifListHtml();
      btn.setAttribute('aria-expanded', 'true');
      renderBell();
    });
    document.addEventListener('click', (e) => {
      if (!pop.hidden && !e.target.closest('#bell-wrap')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !pop.hidden) close();
    });
  }

  /* ---- front view (garments and drawer items) ---- */
  function openViewer(opts) {
    const actions = opts.actions;
    const card = openModal(
      `
      <div class="x-modal-head">
        <div><p class="x-kicker">Front view</p><h2 class="x-modal-title">${esc(opts.title)}</h2><p class="x-muted">${esc(opts.kind)}</p></div>
        <button type="button" class="x-icon-btn" data-close aria-label="Close">${icon('x', 'h-4 w-4')}</button>
      </div>
      <div class="x-viewer-stage">
        ${opts.imgSrc ? `<img src="${esc(opts.imgSrc)}" alt="${esc(opts.title)}" class="x-viewer-img" />` : '<p class="x-muted">Photo still processing…</p>'}
      </div>
      <div class="x-actions">
        ${actions.map((a, i) => `<button type="button" data-act="${i}" ${i === 0 ? 'data-autofocus' : ''} class="${a.primary ? 'x-primary' : a.danger ? 'x-danger' : 'x-ghost'}">${esc(a.label)}</button>`).join('')}
      </div>`,
      opts.title + ' front view'
    );
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return closeModal();
      const b = e.target.closest('[data-act]');
      if (!b) return;
      closeModal();
      actions[Number(b.dataset.act)].run();
    });
  }

  function openFront(id) {
    const g = S.garments.find((x) => x.id === id);
    if (!g) return;
    const tex = S.textures[id];
    const inOut = S.outfit.some((o) => o.garmentId === id);
    const actions = [
      inOut
        ? { label: 'Return to wardrobe', primary: true, run: () => returnToOrigin('o-' + id) }
        : { label: 'Add to outfit', primary: true, run: () => addGarmentToOutfit(id) }
    ];
    if (g.uploaded) actions.push({ label: 'Remove from wardrobe', danger: true, run: () => removeGarment(id) });
    actions.push({ label: 'Close', run: () => {} });
    openViewer({ title: g.name, kind: catLabel(g.category), imgSrc: tex && tex.thumb, actions });
  }

  function openDrawerFront(drawerId, itemId) {
    const d = drawers.find((x) => x.rootId === drawerId);
    const item = S.drawerItems[drawerId].find((i) => i.id === itemId);
    if (!d || !item) return;
    const tex = S.textures[itemId];
    const inOut = S.outfit.some((o) => o.id === itemId);
    const actions = [
      inOut
        ? { label: 'Return to drawer', primary: true, run: () => returnToOrigin(itemId) }
        : { label: 'Add to outfit', primary: true, run: () => addDrawerItem(item, d.kind) }
    ];
    if (item.uploaded) actions.push({ label: 'Remove', danger: true, run: () => removeDrawerItem(drawerId, itemId) });
    actions.push({ label: 'Close', run: () => {} });
    openViewer({ title: item.name, kind: d.kind === 'shoes' ? 'Shoes' : 'Accessory', imgSrc: tex && (tex.thumb || null), actions });
  }

  /* ---- returning / removing ---- */
  function returnToOrigin(outfitId) {
    const it = S.outfit.find((i) => i.id === outfitId);
    if (!it) return;
    if (it.garmentId) S.returned[it.garmentId] = performance.now();
    removeFromOutfit(outfitId);
    toast(`${it.name} returned to ${it.garmentId ? 'its place on the rail' : it.kind === 'shoes' ? 'the shoe drawer' : 'the accessory drawer'}`);
  }

  function removeGarment(id) {
    const g = S.garments.find((x) => x.id === id);
    if (!g) return;
    S.garments = S.garments.filter((x) => x.id !== id);
    S.outfit = S.outfit.filter((o) => o.garmentId !== id);
    delete S.textures[id];
    if (S.selectedId === id) S.selectedId = null;
    renderWardrobeHeader();
    renderNav();
    renderInspector();
    onOutfitChanged();
    if (stage) stage.refresh();
    toast(`${g.name} removed from the wardrobe`);
  }

  function removeDrawerItem(drawerId, itemId) {
    const item = S.drawerItems[drawerId].find((i) => i.id === itemId);
    if (!item) return;
    S.drawerItems = { ...S.drawerItems, [drawerId]: S.drawerItems[drawerId].filter((i) => i.id !== itemId) };
    S.outfit = S.outfit.filter((o) => o.id !== itemId);
    delete S.textures[itemId];
    onOutfitChanged();
    toast(`${item.name} removed`);
  }

  /* ---- swipe a piece left (in the styling area) to return it ---- */
  function bindOutfitSwipe() {
    const list = $('#outfit-list');
    const RETURN_AT = 70;
    list.addEventListener('dragstart', (e) => e.preventDefault());
    let d = null;
    list.addEventListener('pointerdown', (e) => {
      const li = e.target.closest('li');
      if (!li || e.target.closest('button') || li.classList.contains('is-leaving')) return;
      d = { li, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId, active: false };
    });
    list.addEventListener('pointermove', (e) => {
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.active) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          d = null;
          return;
        }
        if (Math.abs(dx) < 6) return;
        d.active = true;
        try {
          d.li.setPointerCapture(e.pointerId);
        } catch (err) {}
        d.li.style.transition = 'none';
      }
      d.dx = Math.min(0, dx);
      d.li.style.transform = `translateX(${d.dx}px)`;
      d.li.style.opacity = String(1 - Math.min(0.5, -d.dx / 260));
      d.li.classList.toggle('is-ready-return', d.dx < -RETURN_AT);
    });
    const end = (e) => {
      if (!d || e.pointerId !== d.id) return;
      const { li, dx, active } = d;
      d = null;
      if (!active) return;
      li.classList.remove('is-ready-return');
      if (dx < -RETURN_AT) {
        returnToOrigin(li.dataset.id);
      } else {
        li.style.transition = 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms';
        li.style.transform = '';
        li.style.opacity = '';
      }
    };
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
  }

  /* ---- mobile: separate views with a bottom tab bar ---- */
  const MOBILE_TABS = [
    { id: 'wardrobe', label: 'Wardrobe', icon: 'shirt' },
    { id: 'outfit', label: 'Outfit', icon: 'sparkles' },
    { id: 'chat', label: 'Chat', icon: 'message-circle' },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ];
  function setupMobileTabs() {
    const nav = $('#mobile-tabs');
    if (!nav) return;
    nav.innerHTML = MOBILE_TABS.map(
      (t) => `<button type="button" data-mtab="${t.id}" class="x-tab">
        <span class="x-tab-icon">${icon(t.icon, 'h-5 w-5')}<span class="x-tab-badge" data-badge="${t.id}" hidden></span></span>
        <span>${t.label}</span></button>`
    ).join('');
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mtab]');
      if (!b) return;
      setMobileView(b.dataset.mtab);
    });
    setMobileView('wardrobe');
  }
  function setMobileView(id) {
    document.body.dataset.mview = id;
    if (id === 'chat') S.unreadChat = 0;
    document.querySelectorAll('#mobile-tabs [data-mtab]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.mtab === id)));
    updateMobileTabs();
    window.scrollTo({ top: 0 });
  }
  function updateMobileTabs() {
    const set = (id, n) => {
      const el = document.querySelector(`[data-badge="${id}"]`);
      if (!el) return;
      el.hidden = !n;
      el.textContent = n > 9 ? '9+' : String(n);
    };
    set('outfit', S.outfit.length);
    set('chat', document.body.dataset.mview === 'chat' ? 0 : S.unreadChat);
  }

  /* ---- staff console ---- */
  function setupStaff() {
    const root = $('#staff-panel');
    root.addEventListener('change', (e) => {
      const el = e.target.closest('[data-sf]');
      if (!el) return;
      const k = el.dataset.sf;
      const id = el.dataset.id;
      const v = el.value;
      const file = el.files && el.files[0];
      switch (k) {
        case 'c-name': client.name = v.trim() || client.name; break;
        case 'c-loc': client.location = v.trim() || client.location; break;
        case 'c-since': client.memberSince = v.trim() || client.memberSince; break;
        case 'c-fit': fitProfile[Number(id)].value = v.trim() || fitProfile[Number(id)].value; break;
        case 'c-prefs': preferences.splice(0, preferences.length, ...v.split(',').map((x) => x.trim()).filter(Boolean)); break;
        case 'g-name': { const g = S.garments.find((x) => x.id === id); if (g) g.name = v.trim() || g.name; break; }
        case 'g-cat': { const g = S.garments.find((x) => x.id === id); if (g) { g.category = v; g.presetId = v; } break; }
        case 'g-photo': if (file) replaceItemPhoto(id, file); break;
        case 'd-name': { const it = findDrawerItem(id); if (it) it.name = v.trim() || it.name; break; }
        case 'd-photo': if (file) replaceItemPhoto(id, file); break;
        case 'sw-name': swatches[Number(id)].name = v.trim() || swatches[Number(id)].name; break;
        case 'sw-hex': swatches[Number(id)].hex = v.toUpperCase(); break;
        case 'm-cap': moodBoard[Number(id)].caption = v.trim() || moodBoard[Number(id)].caption; break;
        case 'm-photo': if (file) moodBoard[Number(id)].url = URL.createObjectURL(file); break;
        case 'sil-photo': if (file) bodySilhouetteImage = URL.createObjectURL(file); break;
        case 'sil-shape': bodySilhouette.shape = v.trim() || bodySilhouette.shape; break;
        case 'sil-notes': bodySilhouette.notes = v.trim() || bodySilhouette.notes; break;
        case 'credits-set': S.credits = Math.max(0, Math.round(Number(v) || 0)); break;
        case 'replies': {
          const lines = v.split('\n').map((x) => x.trim()).filter(Boolean);
          if (lines.length) simulatedReplies.splice(0, simulatedReplies.length, ...lines);
          break;
        }
        default: return;
      }
      refreshAll();
      toast.success('Saved');
    });

    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-staff-close]')) {
        S.role = 'client';
        updateHeader();
        renderStaff();
        return;
      }
      const b = e.target.closest('button[data-sf]');
      if (!b) return;
      const k = b.dataset.sf;
      const id = b.dataset.id;
      switch (k) {
        case 'g-del': removeGarment(id); break;
        case 'd-del': { const d = S.drawerItems['accessory-drawer'].some((i) => i.id === id) ? 'accessory-drawer' : 'shoe-drawer'; removeDrawerItem(d, id); break; }
        case 'sw-del': swatches.splice(Number(id), 1); break;
        case 'sw-add': {
          const name = $('#sf-sw-name', root).value.trim() || 'New colour';
          swatches.push({ name, hex: $('#sf-sw-hex', root).value.toUpperCase() });
          break;
        }
        case 'm-del': moodBoard.splice(Number(id), 1); break;
        case 'item-add': {
          const f = $('#sf-item-file', root).files[0];
          if (!f) { toast.error('Choose a photo first'); return; }
          const cat = $('#sf-item-cat', root).value;
          const name = $('#sf-item-name', root).value.trim();
          uploadGarment(f, cat, name);
          break;
        }
        case 'm-add': {
          const f = $('#sf-mood-file', root).files[0];
          if (!f) { toast.error('Choose a photo first'); return; }
          moodBoard.push({ id: 'mood-' + Date.now(), caption: $('#sf-mood-cap', root).value.trim() || 'New reference', url: URL.createObjectURL(f) });
          break;
        }
        case 'credits-add': S.credits += 50; showDelta(50); break;
        default: return;
      }
      refreshAll();
    });
  }

  function findDrawerItem(id) {
    return [...S.drawerItems['accessory-drawer'], ...S.drawerItems['shoe-drawer']].find((i) => i.id === id);
  }

  function replaceItemPhoto(id, file) {
    const url = URL.createObjectURL(file);
    const g = S.garments.find((x) => x.id === id);
    if (g) g.src = url;
    else {
      const it = findDrawerItem(id);
      if (!it) return;
      it.image = url;
    }
    delete S.textures[id];
    startedTextures.delete(id);
    ensureTextures();
  }

  /** Re-draws everything that shows content staff can edit. */
  function refreshAll() {
    buildClientProfile();
    buildColourPanel();
    renderWardrobeHeader();
    renderNav();
    renderInspector();
    renderDrawers();
    renderOutfit();
    updateHeader();
    const title = $('#chat-title');
    if (title) title.textContent = 'Chat with ' + client.name;
    if (stage) stage.refresh();
    renderStaff();
  }

  function renderStaff() {
    const root = $('#staff-panel');
    if (!root) return;
    const on = S.role === 'staff';
    root.classList.toggle('is-on', on);
    if (!on) return;
    const thumb = (src) => (src ? `<img src="${esc(src)}" alt="" class="x-thumb" />` : '<span class="x-thumb"></span>');
    const catOpts = (sel) => garmentCategories.map((c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
    const fileBtn = (label, sf, id) => `<label class="x-ghost x-file">${label}<input type="file" accept="image/*" hidden data-sf="${sf}" data-id="${esc(id)}" /></label>`;
    const garmentRows = S.garments
      .map((g) => {
        const t = S.textures[g.id];
        return `<li class="x-row">${thumb(t && t.thumb)}
          <input class="x-input" data-sf="g-name" data-id="${esc(g.id)}" value="${esc(g.name)}" aria-label="Garment name" />
          <select class="x-input x-narrow" data-sf="g-cat" data-id="${esc(g.id)}" aria-label="Category">${catOpts(g.category)}</select>
          ${fileBtn('Replace photo', 'g-photo', g.id)}
          <button type="button" class="x-danger" data-sf="g-del" data-id="${esc(g.id)}">Remove</button></li>`;
      })
      .join('');
    const drawerRows = (drawerId, label) =>
      S.drawerItems[drawerId]
        .map((i) => {
          const t = S.textures[i.id];
          return `<li class="x-row">${thumb(t && t.thumb)}
          <input class="x-input" data-sf="d-name" data-id="${esc(i.id)}" value="${esc(i.name)}" aria-label="${label} name" />
          <span class="x-tag">${label}</span>
          ${fileBtn('Replace photo', 'd-photo', i.id)}
          <button type="button" class="x-danger" data-sf="d-del" data-id="${esc(i.id)}">Remove</button></li>`;
        })
        .join('');
    root.innerHTML = `
      <div class="x-staff-head">
        <div><h2 class="x-staff-title">Staff console</h2>
        <p class="x-muted">Manage every piece of content and setting here — no code needed. Changes appear instantly in the client view.</p></div>
        <button type="button" class="x-ghost" data-staff-close>Back to client view</button>
      </div>
      <div class="x-staff-grid">
        <section class="x-card"><h3>Client</h3>
          <label class="x-field">Name<input class="x-input" data-sf="c-name" value="${esc(client.name)}" /></label>
          <label class="x-field">Location<input class="x-input" data-sf="c-loc" value="${esc(client.location)}" /></label>
          <label class="x-field">Member since<input class="x-input" data-sf="c-since" value="${esc(client.memberSince)}" /></label>
          <div class="x-fit">${fitProfile.map((f, i) => `<label class="x-field">${esc(f.label)}<input class="x-input" data-sf="c-fit" data-id="${i}" value="${esc(f.value)}" /></label>`).join('')}</div>
          <label class="x-field">Preferences (comma separated)<input class="x-input" data-sf="c-prefs" value="${esc(preferences.join(', '))}" /></label>
        </section>
        <section class="x-card"><h3>Wardrobe rail</h3>
          <ul class="x-rows">${garmentRows || '<li class="x-muted">No garments.</li>'}</ul>
          <h3 class="x-sub">Add an item</h3>
          <div class="x-add">
            <input class="x-input" id="sf-item-name" placeholder="Name (optional)" />
            <select class="x-input x-narrow" id="sf-item-cat">${garmentCategories.concat(drawerCategories).map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select>
            <input type="file" accept="image/*" id="sf-item-file" class="x-input" />
            <button type="button" class="x-primary" data-sf="item-add">Add item</button>
          </div>
        </section>
        <section class="x-card"><h3>Drawers</h3>
          <ul class="x-rows">${drawerRows('accessory-drawer', 'Accessory')}${drawerRows('shoe-drawer', 'Shoes')}</ul>
        </section>
        <section class="x-card"><h3>Colours</h3>
          <ul class="x-rows">${swatches.map((s, i) => `<li class="x-row"><input type="color" class="x-color" data-sf="sw-hex" data-id="${i}" value="${esc(s.hex.toLowerCase())}" aria-label="Colour" />
            <input class="x-input" data-sf="sw-name" data-id="${i}" value="${esc(s.name)}" aria-label="Colour name" />
            <button type="button" class="x-danger" data-sf="sw-del" data-id="${i}">Remove</button></li>`).join('')}</ul>
          <div class="x-add"><input type="color" class="x-color" id="sf-sw-hex" value="#c19a6b" aria-label="New colour" /><input class="x-input" id="sf-sw-name" placeholder="Colour name" />
            <button type="button" class="x-primary" data-sf="sw-add">Add colour</button></div>
        </section>
        <section class="x-card"><h3>Body silhouette &amp; mood board</h3>
          <div class="x-row">${thumb(bodySilhouetteImage)}<input class="x-input" data-sf="sil-shape" value="${esc(bodySilhouette.shape)}" aria-label="Silhouette shape" />${fileBtn('Replace photo', 'sil-photo', 'sil')}</div>
          <label class="x-field">Silhouette notes<textarea class="x-input" rows="2" data-sf="sil-notes">${esc(bodySilhouette.notes)}</textarea></label>
          <ul class="x-rows">${moodBoard.map((m, i) => `<li class="x-row">${thumb(m.url)}<input class="x-input" data-sf="m-cap" data-id="${i}" value="${esc(m.caption)}" aria-label="Caption" />
            ${fileBtn('Replace photo', 'm-photo', i)}<button type="button" class="x-danger" data-sf="m-del" data-id="${i}">Remove</button></li>`).join('')}</ul>
          <div class="x-add"><input class="x-input" id="sf-mood-cap" placeholder="Caption" /><input type="file" accept="image/*" id="sf-mood-file" class="x-input" />
            <button type="button" class="x-primary" data-sf="m-add">Add photo</button></div>
        </section>
        <section class="x-card"><h3>Credits &amp; chat</h3>
          <label class="x-field">Credit balance<input type="number" min="0" class="x-input" data-sf="credits-set" value="${S.credits}" /></label>
          <button type="button" class="x-ghost" data-sf="credits-add">Grant 50 credits</button>
          <label class="x-field">Simulated client replies (one per line)<textarea class="x-input" rows="5" data-sf="replies">${esc(simulatedReplies.join('\n'))}</textarea></label>
        </section>
      </div>`;
  }

  /* ===========================================================================
     INIT
     ========================================================================= */

  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-photo')) return;
      const box = img.closest('.photo-box');
      if (box) box.innerHTML = '<div class="flex h-full w-full items-center justify-center text-xs text-muted">Photo unavailable</div>';
    },
    true
  );

  function init() {
    buildHeader();
    buildClientProfile();
    buildColourPanel();
    buildUploadGarment();
    buildWardrobePanel();
    buildDrawers();
    buildStylingArea();
    buildChatPanel();
    setupStaff();
    setupMobileTabs();
    renderBell();
    ensureTextures();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
