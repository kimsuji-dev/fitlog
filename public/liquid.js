/* NAU AI TOWN — Liquid Glass 렌즈 엔진 v2

   유리판의 물리를 변위 맵(feDisplacementMap)으로 구워 backdrop-filter 로 적용한다.
   살아있는 DOM(스크롤·영상·글자) 위에서도 동작하는 것이 셰이더 방식과의 차이.

   v2 에서 바뀐 것 (실험대에서 잡은 값 그대로):
     1) 꺾이는 방향을 '중심 쪽'에서 '테두리에 수직인 방향'(SDF 기울기)으로 바로잡음.
        둥근 사각형은 변마다 법선이 달라서, 예전엔 전체가 균일하게 확대만 됐다.
     2) 두께 모델 — 윗면은 가운데가 평평하고 가장자리에서 4분원으로 떨어진다.
        그 경사면(베벨)에서만 빛이 꺾여, 가운데는 맑고 테두리에 배경이 눌려 들어온다.
     3) 커서 밑에 가우시안 볼록을 더해 물방울이 따라다니게.
     4) 경사가 무한대로 가는 맨 끝은 부드럽게 눌러 무지개 노이즈를 막는다.

   (굴절은 크로미움 계열에서만 지원 — 미지원 브라우저는 CSS 블러 폴백만 남는다) */
"use strict";

window.LiquidGlass = (() => {
  const SUPPORTED =
    typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#f)");
  if (!SUPPORTED) return { apply() {}, tilt() {} };

  /* ---------- 실험대에서 고른 값 ---------- */
  const BEVEL_PCT = 0.07;   // 짧은 변의 몇 %까지가 '두께'인가
  const POWER     = 21;     // 그 안에서 얼마나 세게 꺾이는가 (px)
  const ZOOM      = 0.06;   // 판 전체가 렌즈처럼 확대되는 정도
  const CHROMA    = 0.06;   // 색수차 (R/G/B 굴절 차이)
  const SLOPE_CAP = 4.5;
  const EDGE_FADE = 0.94;   // 이 지점부터 경계까지 변위를 0 으로 되돌린다
  const BUMP      = 30;     // 커서 밑 물방울 세기
  const TILT_DEG  = 2.4;    // 화면 전체가 커서를 따라 눕는 최대 각도

  const MAP_MOVING = 190;   // 움직이는 동안 지도 해상도(긴 변)
  const MAP_STILL  = 520;   // 멈췄을 때

  const SVG_NS = "http://www.w3.org/2000/svg";
  const svgRoot = document.createElementNS(SVG_NS, "svg");
  svgRoot.setAttribute("width", "0");
  svgRoot.setAttribute("height", "0");
  svgRoot.setAttribute("aria-hidden", "true");
  svgRoot.style.position = "absolute";
  const defs = document.createElementNS(SVG_NS, "defs");
  svgRoot.appendChild(defs);
  document.body.appendChild(svgRoot);

  let uid = 0;
  const registry = new Map(); // el -> entry

  const softCap = (v, cap) => v / (1 + v / cap);

  /* 둥근 사각형까지의 부호 있는 거리 — 안쪽이 음수, 테두리에서 0 */
  const sdf = (x, y, hw, hh, r) => {
    const qx = Math.abs(x) - hw + r;
    const qy = Math.abs(y) - hh + r;
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
  };

  /* 커서가 안 움직이는(가운데 고정) 지도는 크기별로 캐시해 재사용한다 */
  const mapCache = new Map();
  const MAP_CACHE_MAX = 40;

  /* opt: { mx, my, bump } — mx,my 는 요소 안 픽셀 좌표. bump 0 이면 정지 상태 */
  function buildMap(w, h, radius, opt, maxSide) {
    const still = !opt || opt.bump <= 0.01;
    const key = still ? `${w}x${h}r${radius}s${maxSide}` : null;
    if (key && mapCache.has(key)) return mapCache.get(key);

    const down = Math.min(1, maxSide / Math.max(w, h));
    const cw = Math.max(8, Math.round(w * down));
    const ch = Math.max(8, Math.round(h * down));
    const hw = cw / 2, hh = ch / 2;
    const r = Math.min(radius * down, hw, hh);
    const bevel = Math.max(2, Math.min(w, h) * BEVEL_PCT * down);
    const str = POWER * down;

    // 커서 볼록
    const bumpR = Math.max(14, Math.min(cw, ch) * 0.42);
    const bumpS = still ? 0 : opt.bump * down;
    const mx = still ? 0 : opt.mx * down - hw;
    const my = still ? 0 : opt.my * down - hh;
    const twoSig2 = 2 * (bumpR * 0.62) * (bumpR * 0.62);

    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(cw, ch);
    const data = img.data;
    const raw = new Float32Array(cw * ch * 2);
    let maxD = 0, k = 0;

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const px = x + 0.5 - hw, py = y + 0.5 - hh;
        const d = sdf(px, py, hw, hh, r);
        let dx = 0, dy = 0;
        if (d < 0) {
          let u = 1 + d / bevel;              // 안쪽 0 → 경계 1
          if (u > 0) {
            if (u > 1) u = 1;
            const slope = softCap(u / Math.sqrt(Math.max(1e-4, 1 - u * u)), SLOPE_CAP);
            // 맨 끝 6% 에서는 변위를 0 으로 되돌린다 — 경계까지 꺾으면 굴절 결과가
            // 둥근 모서리를 조금 넘어 톱니가 생긴다
            const t = u > EDGE_FADE ? (1 - u) / (1 - EDGE_FADE) : 1;
            const fade = t * t * (3 - 2 * t);
            const mag = slope * str * fade;
            // 테두리에 수직인 방향 = SDF 기울기
            const gx = sdf(px + 1, py, hw, hh, r) - sdf(px - 1, py, hw, hh, r);
            const gy = sdf(px, py + 1, hw, hh, r) - sdf(px, py - 1, hw, hh, r);
            const gl = Math.hypot(gx, gy) || 1;
            dx = -(gx / gl) * mag;
            dy = -(gy / gl) * mag;
          }
          const uz = Math.max(0, Math.min(1, 1 + d / bevel));
          const tz = uz > EDGE_FADE ? (1 - uz) / (1 - EDGE_FADE) : 1;
          const zf = tz * tz * (3 - 2 * tz);
          dx -= px * ZOOM * zf;
          dy -= py * ZOOM * zf;
          if (bumpS > 0.01) {
            const uu = Math.max(0, Math.min(1, 1 + d / bevel));
            const tt = uu > EDGE_FADE ? (1 - uu) / (1 - EDGE_FADE) : 1;
            const bfade = tt * tt * (3 - 2 * tt);
            const bx = px - mx, by = py - my;
            const b2 = bx * bx + by * by;
            const bl = Math.sqrt(b2) || 1;
            const bmag = bumpS * Math.exp(-b2 / twoSig2) * (bl / bumpR) * bfade;
            dx -= (bx / bl) * bmag;
            dy -= (by / bl) * bmag;
          }
        }
        raw[k++] = dx; raw[k++] = dy;
        const a = Math.max(Math.abs(dx), Math.abs(dy));
        if (a > maxD) maxD = a;
      }
    }

    maxD = Math.max(maxD, 1); k = 0;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = (raw[k++] / maxD) * 0.5 * 255 + 127.5;
      data[i + 1] = (raw[k++] / maxD) * 0.5 * 255 + 127.5;
      data[i + 2] = 0; data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const made = { href: canvas.toDataURL(), scale: (2 * maxD) / down };

    if (key) {
      if (mapCache.size >= MAP_CACHE_MAX) mapCache.delete(mapCache.keys().next().value);
      mapCache.set(key, made);
    }
    return made;
  }

  /* 색수차용 채널 — 작은 요소에만 3패스 (필터는 CPU 래스터라 비싸다) */
  const CHANNELS = [
    { mult: 1 + CHROMA, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
    { mult: 1,          matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
    { mult: 1 - CHROMA, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
  ];
  // 카드가 한 화면에 여러 장 깔리므로 3패스는 비싸다.
  // 작은 컨트롤만 색수차를 쓰고, 카드·상단바는 단일 패스로 굴절만.
  const CHROMATIC_MAX_AREA = 40000; // px²

  function makeFilter(id) {
    const f = document.createElementNS(SVG_NS, "filter");
    f.setAttribute("id", id);
    f.setAttribute("filterUnits", "userSpaceOnUse");
    f.setAttribute("color-interpolation-filters", "sRGB");
    f.setAttribute("x", "0");
    f.setAttribute("y", "0");
    return f;
  }

  function buildFilterContent(f, chromatic) {
    while (f.firstChild) f.removeChild(f.firstChild);
    const img = document.createElementNS(SVG_NS, "feImage");
    img.setAttribute("x", "0");
    img.setAttribute("y", "0");
    img.setAttribute("preserveAspectRatio", "none");
    img.setAttribute("result", "map");
    f.appendChild(img);

    const disps = [];
    if (!chromatic) {
      const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
      disp.setAttribute("in", "SourceGraphic");
      disp.setAttribute("in2", "map");
      disp.setAttribute("xChannelSelector", "R");
      disp.setAttribute("yChannelSelector", "G");
      f.appendChild(disp);
      disps.push(disp);
      return { img, disps };
    }

    const parts = [];
    CHANNELS.forEach((ch, i) => {
      const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
      disp.setAttribute("in", "SourceGraphic");
      disp.setAttribute("in2", "map");
      disp.setAttribute("xChannelSelector", "R");
      disp.setAttribute("yChannelSelector", "G");
      disp.setAttribute("result", `d${i}`);
      f.appendChild(disp);
      disps.push(disp);

      const cm = document.createElementNS(SVG_NS, "feColorMatrix");
      cm.setAttribute("in", `d${i}`);
      cm.setAttribute("type", "matrix");
      cm.setAttribute("values", ch.matrix);
      cm.setAttribute("result", `c${i}`);
      f.appendChild(cm);
      parts.push(`c${i}`);
    });

    const b1 = document.createElementNS(SVG_NS, "feBlend");
    b1.setAttribute("in", parts[0]);
    b1.setAttribute("in2", parts[1]);
    b1.setAttribute("mode", "screen");
    b1.setAttribute("result", "rg");
    f.appendChild(b1);

    const b2 = document.createElementNS(SVG_NS, "feBlend");
    b2.setAttribute("in", "rg");
    b2.setAttribute("in2", parts[2]);
    b2.setAttribute("mode", "screen");
    f.appendChild(b2);

    return { img, disps };
  }

  function paint(entry, el, moving) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (w < 28 || h < 28) {
      // 팝업이 열리는 프레임엔 크기가 0 으로 재진다 — 잠깐 뒤 다시 (최대 ~0.8초)
      if ((entry.retries = (entry.retries || 0) + 1) <= 20) setTimeout(() => paint(entry, el, moving), 40);
      return;
    }
    entry.retries = 0;

    const chromatic = w * h <= CHROMATIC_MAX_AREA;
    if (chromatic !== entry.chromatic) {
      const built = buildFilterContent(entry.filter, chromatic);
      entry.img = built.img;
      entry.disps = built.disps;
      entry.chromatic = chromatic;
    }

    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const m = buildMap(w, h, radius,
      { mx: entry.cx, my: entry.cy, bump: BUMP * entry.lit },
      moving ? MAP_MOVING : MAP_STILL);

    entry.filter.setAttribute("width", w);
    entry.filter.setAttribute("height", h);
    entry.img.setAttribute("width", w);
    entry.img.setAttribute("height", h);
    entry.img.setAttribute("href", m.href);
    entry.disps.forEach((d, i) =>
      d.setAttribute("scale", (m.scale * (chromatic ? CHANNELS[i].mult : 1)).toFixed(2))
    );
    // 흐림 두께: 글 많은 패널은 두껍게(글이 묻히지 않게), 사진 카드는 거의 투명하게.
    // CSS 에서 --lg-blur 로 요소마다 지정할 수 있고, 없으면 크기로 판단한다 (HIG 재질)
    const cssBlur = parseFloat(getComputedStyle(el).getPropertyValue("--lg-blur"));
    const blur = Number.isFinite(cssBlur) ? cssBlur : (chromatic ? 1.5 : 10);
    const bf = `url(#${entry.filter.id}) blur(${blur}px) saturate(1.6) brightness(1.04)`;
    entry.layer.style.backdropFilter = bf;
    entry.layer.style.webkitBackdropFilter = bf;
    entry.w = w; entry.h = h;
  }

  /* ---------- 커서 반응 루프 ---------- */
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function loop() {
    raf = 0;
    let busy = false;
    for (const [el, e] of registry) {
      if (!e.live && e.lit < 0.001) continue;
      e.cx += (e.tx - e.cx) * 0.22;
      e.cy += (e.ty - e.cy) * 0.22;
      e.lit += (e.litT - e.lit) * 0.14;
      if (e.litT === 0 && e.lit < 0.012) { e.lit = 0; e.live = false; paint(e, el, false); continue; }
      paint(e, el, true);
      busy = true;
    }
    if (stepTilt()) busy = true;
    if (busy) kick();
  }

  /* ── 프로젝트마다 갈아끼우는 두 선택자 ────────────────────────────
     OVERLAY_SEL : 렌즈를 내용 '위'에 얹을 표면. 뒤의 밋밋한 배경이 아니라
                   사진 자체가 굽어야 굴절이 세게 보인다 (글자는 CSS z 로 위로).
     TARGET_SEL  : 렌즈를 붙일 대상 전체.
     밖에서 window.LIQUID_GLASS_SEL = { overlay, target } 로 덮어쓸 수 있다. */
  const CFG = (typeof window !== "undefined" && window.LIQUID_GLASS_SEL) || {};
  const OVERLAY_SEL = CFG.overlay || ".card-thumb, #lightbox";
  const TARGET_SEL  = CFG.target  || ".lg-heavy, .glass-lite, .card-thumb, #lightbox";

  function attach(el) {
    let layer = el.querySelector(":scope > .gl-dist") || el.querySelector(".gl-dist");
    const overlay = el.matches(OVERLAY_SEL);
    if (!layer && (overlay || el.classList.contains("glass-lite"))) {
      layer = document.createElementNS("http://www.w3.org/1999/xhtml", "span");
      layer.className = "gl-dist lg-auto" + (overlay ? " lg-over" : "");
      layer.setAttribute("aria-hidden", "true");
      el.prepend(layer);
      el.classList.add("lg-lifted");   // 자체 backdrop-filter 를 끄는 표식
    }
    if (!layer) return;
    const id = `lgf-${++uid}`;
    const f = makeFilter(id);
    defs.appendChild(f);
    const entry = {
      filter: f, img: null, disps: [], layer, ro: null,
      w: 0, h: 0, chromatic: null,
      tx: 0, ty: 0, cx: 0, cy: 0, lit: 0, litT: 0, live: false,
    };
    registry.set(el, entry);

    entry.onMove = (ev) => {
      const r = el.getBoundingClientRect();
      entry.tx = ev.clientX - r.left;
      entry.ty = ev.clientY - r.top;
      entry.litT = 1;
      if (!entry.live) { entry.cx = entry.tx; entry.cy = entry.ty; entry.live = true; }
      kick();
    };
    entry.onLeave = () => { entry.litT = 0; kick(); };
    el.addEventListener("pointermove", entry.onMove);
    el.addEventListener("pointerleave", entry.onLeave);

    entry.ro = new ResizeObserver(() => paint(entry, el, false));
    entry.ro.observe(el);
    paint(entry, el, false);
  }

  function apply() {
    // 사라진 요소 정리
    for (const [el, entry] of registry) {
      if (!el.isConnected || !entry.layer.isConnected) {
        entry.ro.disconnect();
        entry.filter.remove();
        el.removeEventListener("pointermove", entry.onMove);
        el.removeEventListener("pointerleave", entry.onLeave);
        registry.delete(el);
      }
    }
    document.querySelectorAll(TARGET_SEL).forEach((el) => {
      if (!registry.has(el)) attach(el);
    });
  }

  /* ---------- 화면 전체가 커서를 따라 눕는다 ----------
     레퍼런스를 CDP 로 조종해 재보니, 개별 카드가 아니라 화면 전체가 함께 변한다.
     평행이동은 2~6px 뿐인데 전 영역이 바뀐다 = 판이 통째로 아주 조금 기울고 있다. */
  const tilt = { tx: 0, ty: 0, cx: 0, cy: 0, el: null, on: false };

  function stepTilt() {
    if (!tilt.on || !tilt.el) return false;
    tilt.cx += (tilt.tx - tilt.cx) * 0.09;   // 커서보다 한참 느긋하게
    tilt.cy += (tilt.ty - tilt.cy) * 0.09;
    tilt.el.style.setProperty("--ry", (tilt.cx * TILT_DEG).toFixed(3) + "deg");
    tilt.el.style.setProperty("--rx", (-tilt.cy * TILT_DEG).toFixed(3) + "deg");
    return Math.abs(tilt.tx - tilt.cx) + Math.abs(tilt.ty - tilt.cy) > 0.002;
  }

  function enableTilt(el) {
    if (!el || tilt.el === el) return;
    tilt.el = el;
    tilt.on = true;
    el.classList.add("lg-stage");
    document.addEventListener("pointermove", (e) => {
      tilt.tx = (e.clientX / innerWidth) * 2 - 1;
      tilt.ty = (e.clientY / innerHeight) * 2 - 1;
      kick();
    });
  }

  // 모션 최소화를 원하면 기울기는 켜지 않는다
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tilt.on = false;

  /* 화면 확인용 — ?lens=0.6,0.5 로 열면 커서가 그 자리에 있는 것처럼 굳혀 그린다.
     헤드리스 캡처로는 마우스를 올릴 수 없어서 필요하다. */
  function freeze(fx, fy) {
    for (const [el, e] of registry) {
      e.cx = el.offsetWidth * fx;
      e.cy = el.offsetHeight * fy;
      e.tx = e.cx; e.ty = e.cy;
      e.lit = 1; e.litT = 1; e.live = true;
      paint(e, el, false);
    }
  }

  return { apply, tilt: enableTilt, freeze };
})();
