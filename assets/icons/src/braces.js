/**
 * Braces: five lower front teeth standing crooked on a bar of gum, a bracket
 * on each and one wire through the brackets. The pointer picks a tooth; it
 * straightens first and the others follow, staggered outwards from it, until
 * the wire runs straight. The wire is the one bright mark. The slider is the
 * stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a pick by
 * the teeth's straightened centres, which never move.
 */
const {
  Cam, fillet, fit, lerp, open, poly, proj, rad, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, register,
} = HL;

const N = 5, STEP = 20, TALL = 32, DEPTH = 5, MID = 17, END = (N - 1) * STEP + 17;
const SHIFT = [4, -5, 3, -4, 5], TILT = [-6, 5, -7, 6, -4];
const OUTLINE = [[-8.5, TALL], [8.5, TALL], [7, 0], [-7, 0]];

const seen = (ex, ez) => ex * 0.5 - ez * 0.61 > 0;
/** An outline standing in the x-z plane, pushed from y0 to y1: far face, the sweep, the edges between, near face. */
function slab(P, raw, radii, y0, y1) {
  const pts = fillet(raw, radii), m = raw.length;
  const face = (y) => pts.map((p) => P(p[0], y, p[1]));
  const far = face(y0), near = face(y1);
  let sweep = "", sil = "", lo = "";
  for (let k = 1; k < 6; k++) sweep += poly(face(lerp(y0, y1, k / 6)));
  for (let j = 0; j < m; j++) {
    const a = raw[(j + m - 1) % m], p = raw[j], b = raw[(j + 1) % m];
    const n = seen(p[0] - a[0], p[1] - a[1]) + seen(b[0] - p[0], b[1] - p[1]), i = j * 5 + 2;
    if (n === 1) sil += seg(far[i], near[i]); else if (n === 2) lo += seg(far[i], near[i]);
  }
  return { far: poly(far), sweep, lo, sil, near: poly(near) };
}
const plate = (g) => ({
  far: mk("path", { class: "sil" }, g), sweep: mk("path", { class: "fo" }, g), lo: mk("path", { class: "nf lo" }, g),
  sil: mk("path", { class: "nf sil" }, g), near: mk("path", { class: "sil" }, g),
});
const lay = (el, s) => { for (const k in s) el[k].setAttribute("d", s[k]); };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 2.4);
  fit(C, [[-7, -11, 0], [END + 7, -11, 0], [-7, 11, -13], [END + 7, 11, -13], [0, -10, TALL + 2], [END, -10, TALL + 2]], 200, 160);
  const P = proj(C);

  const g = mk("g", {}, svg);
  lay(plate(g), slab(P, [[-7, 0], [END + 7, 0], [END + 7, -13], [-7, -13]], [6, 6, 6, 6], -11, 11));
  const teeth = SHIFT.map(() => ({ el: plate(g), tag: mk("path", {}, g), k: tween(1), drawn: NaN, at: [0, 0] }));
  const wire = mk("path", { class: "nf hi" }, g);

  /** Tooth i, k of the way from straight (0) to crooked (1): the tooth, its bracket, and where the wire crosses it. */
  function draw(i, k) {
    const t = teeth[i];
    if (k === t.drawn) return false;
    t.drawn = k;
    const cx = i * STEP + 8.5, s = Math.sin(rad(TILT[i] * k)), c = Math.cos(rad(TILT[i] * k)), dy = SHIFT[i] * k;
    const turn = ([u, z]) => [cx + u * c + z * s, z * c - u * s];
    lay(t.el, slab(P, OUTLINE.map(turn), [6, 6, 2, 2], dy - DEPTH, dy + DEPTH));
    const tag = [[-4, MID + 4], [4, MID + 4], [4, MID - 4], [-4, MID - 4]].map(turn);
    t.tag.setAttribute("d", poly(fillet(tag, [1.2, 1.2, 1.2, 1.2]).map((p) => P(p[0], dy + DEPTH + 0.5, p[1]))));
    const [wx, wz] = turn([0, MID]);
    t.at = [wx, dy + DEPTH + 1, wz];
    return true;
  }
  function thread() {
    const a = teeth[0].at, b = teeth[N - 1].at;
    const line = [[a[0] - 11, a[1], a[2]], ...teeth.map((t) => t.at), [b[0] + 11, b[1], b[2]]];
    wire.setAttribute("d", open(line.map((p) => P(p[0], p[1], p[2]))));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false, changed = false;
    teeth.forEach((t, i) => { if (draw(i, tval(t.k, now))) changed = true; if (!tdone(t.k, now)) moving = true; });
    if (changed) thread();
    return moving;
  });
  bag.add(B.unregister);

  // the pick: the tooth whose straightened centre is nearest the pointer across the screen
  const mid = teeth.map((_, i) => P(i * STEP + 8.5, DEPTH, MID)[0]);
  const hit = (x) => mid.reduce((best, m, i) => (Math.abs(m - x) < Math.abs(mid[best] - x) ? i : best), 0);

  /** Straightens every tooth, spreading out from tooth a; -1 lets them go back, spreading from the last one picked. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    teeth.forEach((t, i) => tset(t.k, a < 0 ? 1 : 0, now, Math.abs(i - from) * stag));
    read.textContent = a < 0 ? "rest" : "tooth " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p[0])), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "braces",
  means: "Five crooked teeth on one wire: the tooth under the pointer straightens first, and the rest follow in turn.",
  rules: [1, 2, 5, 8],
  range: [0, 90, 200],
  tour: [[140, 140], [200, 165], [260, 190], null],
  mount,
});
