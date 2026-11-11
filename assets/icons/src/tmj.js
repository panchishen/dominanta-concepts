/**
 * TMJ: two jaws seen from the side, cut from one thick plate each. The upper
 * one is fixed; the lower one hangs from a round joint and swings open as the
 * pointer goes down, on a spring. The joint is the one bright mark. At rest
 * the jaw is a little open. The slider is how far it can open, in degrees.
 *
 * The pattern: a continuous scrub. The pointer's height is read against the
 * bite line of the fixed jaw, so the moving jaw cannot pull the answer away.
 */
const {
  Cam, clamp, fillet, fit, hull, lerp, poly, proj, rad, seg,
  spring, stepS, disposer, mk, pointer, register,
} = HL;

const Y0 = -8, Y1 = 8, PX = -30, PZ = 28, BALL = 8.5, REST = 8, TRAVEL = 84;
const UPPER = [[-44, 50], [41, 50], [41, 27], [32, 27], [32, 34], [27, 34], [27, 27], [18, 27], [18, 34], [13, 34], [13, 27], [4, 27], [4, 38], [-44, 38]];
const UPPER_R = [6, 6, 2.5, 2.5, 1.5, 1.5, 2.5, 2.5, 1.5, 1.5, 2.5, 2.5, 3, 6];
const LOWER = [[-38, 33], [-22, 33], [-22, 18], [4, 18], [4, 27], [13, 27], [13, 20], [18, 20], [18, 27], [27, 27], [27, 20], [32, 20], [32, 27], [41, 27], [41, 4], [-38, 4]];
const LOWER_R = [6, 6, 6, 1.5, 2.5, 2.5, 1.5, 1.5, 2.5, 2.5, 1.5, 1.5, 2.5, 2.5, 11, 11];

/** Whether the side face along an edge of a clockwise outline faces the camera: tops and +x sides do. */
const seen = (ex, ez) => ex * 0.5 - ez * 0.61 > 0;
/** The lower jaw's outline swung open by deg about the joint. */
const swing = (deg) => {
  const s = Math.sin(rad(deg)), c = Math.cos(rad(deg));
  return LOWER.map(([x, z]) => [PX + (x - PX) * c + (z - PZ) * s, PZ - (x - PX) * s + (z - PZ) * c]);
};

/** An outline standing in the x-z plane, pushed from y0 to y1: far face, the sweep, the edges between, near face. */
function slab(P, raw, radii) {
  const pts = fillet(raw, radii), m = raw.length;
  const face = (y) => pts.map((p) => P(p[0], y, p[1]));
  const far = face(Y0), near = face(Y1);
  let sweep = "", sil = "", lo = "";
  for (let k = 1; k < 9; k++) sweep += poly(face(lerp(Y0, Y1, k / 9)));
  for (let j = 0; j < m; j++) {
    const a = raw[(j + m - 1) % m], p = raw[j], b = raw[(j + 1) % m];
    const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]];
    if (e1[0] * e2[1] - e1[1] * e2[0] >= 0) continue; // a hollow corner: its edge is behind the plate
    const n = seen(e1[0], e1[1]) + seen(e2[0], e2[1]), i = j * 5 + 2;
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
  let max = value, drawn = NaN;

  const C = Cam(45, 0.5, 2.5);
  const open = swing(34).map(([x, z]) => [x, Y1, z]);
  fit(C, open.concat([[-44, Y0, 50], [41, Y0, 50], [-44, Y1, 38], [41, Y1, 27]]), 200, 160);
  const P = proj(C);

  const g = mk("g", {}, svg);
  const lower = plate(g), upper = plate(g);
  lay(upper, slab(P, UPPER, UPPER_R));
  // the joint: a round pin through both plates, painted last so it sits on their near faces
  const ring = Array.from({ length: 28 }, (_, k) => [PX + BALL * Math.cos(k / 28 * 2 * Math.PI), PZ + BALL * Math.sin(k / 28 * 2 * Math.PI)]);
  const pin = (y) => ring.map((p) => P(p[0], y, p[1]));
  mk("path", { class: "sil hi", d: poly(hull(pin(Y0 - 2).concat(pin(Y1 + 2)))) }, g);
  mk("path", { class: "sil hi", d: poly(pin(Y1 + 2)) }, g);

  const as = spring(REST);
  function draw() {
    if (as.x === drawn) return;
    drawn = as.x;
    lay(lower, slab(P, swing(drawn), LOWER_R));
  }
  const B = register(stage, (dt) => {
    const moving = stepS(as, dt);
    draw();
    return moving;
  });
  bag.add(B.unregister);

  const bite = P(22, 0, 27)[1];
  let over = null;
  function retarget() {
    as.t = over === null ? REST : clamp((over - bite + 12) / TRAVEL, 0, 1) * max;
    read.textContent = over === null ? "rest" : `open ${Math.round(as.t)}°`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = p[1]; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { max = v; if (over !== null) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "tmj",
  means: "The lower jaw hangs from its joint and swings open as the pointer goes down; the joint is the bright mark.",
  rules: [1, 3, 4, 8],
  range: [16, 26, 34],
  tour: [[220, 150], [220, 235], [220, 185], null],
  mount,
});
