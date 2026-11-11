/**
 * Diagnostics: a molar standing inside a scanner hoop. The hoop rides up and
 * down the tooth with the pointer's height, on a spring, and the cut it makes
 * through the tooth is the one bright line: the slice being read. At rest the
 * hoop sits around the crown. The slider is the hoop's radius.
 *
 * The pattern: a continuous scrub. The pointer's height is read against the
 * tooth's own axis, which never moves, so the hoop cannot pull the answer away.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, open, poly, proj, ringAt, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, register,
} = HL;

const TOP = 34, ROOT = -38, ZMIN = -30, ZMAX = 28, ZREST = 22, BAND = 8, STEPS = 12;
/** The crown's profile, neck to biting surface: [height, half-width]. Its hull is the barrel of a molar. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => ({ z, ring: rrect(-w, -w, w, w, w * 0.62, 6) }));
const neck = CROWN[0].ring, inner = rrect(-14, -14, 14, 14, 8, 6);
const disc = (cx, cy, r) => circ(r, 24).map((q) => ({ u: q.u + cx, v: q.v + cy, nu: q.nu, nv: q.nv }));
/** Two roots, side by side on screen: each a ring under the neck and a smaller one at its tip. */
const ROOTS = [[6.4, -6.4], [-6.4, 6.4]].map(([cx, cy]) => ({ a: disc(cx, cy, 10), b: disc(cx * 1.43, cy * 1.43, 4.8) }));
/** The ring a share t of the way from ring a to ring b. */
const mix = (a, b, t) => a.map((q, i) => ({ u: lerp(q.u, b[i].u, t), v: lerp(q.v, b[i].v, t), nu: q.nu, nv: q.nv }));
/** The crown's outline at height z above its neck. */
const section = (z) => {
  let k = 0;
  while (k < CROWN.length - 2 && CROWN[k + 1].z < z) k++;
  const a = CROWN[k], b = CROWN[k + 1];
  return mix(a.ring, b.ring, clamp((z - a.z) / (b.z - a.z), 0, 1));
};

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value, drawn = NaN, drawnR = NaN;

  const C = Cam(45, 0.5, 2.25);
  const far = circ(46, 16).flatMap((q) => [[q.u, q.v, ZMIN], [q.u, q.v, ZMAX]]);
  fit(C, far.concat([[-20, -20, TOP], [9.2, -9.2, ROOT - 5], [-9.2, 9.2, ROOT - 5]]), 200, 160);
  const P = proj(C), front = facing(C), back = (q) => !front(q);
  const axis = P(0, 0, 0)[1], perZ = C.S * Math.sqrt(1 - C.k * C.k);

  const g = mk("g", {}, svg);
  // the far half of the hoop, then the tooth, then the near half: back to front
  const hoopFar = mk("path", { class: "nf sil" }, g), rimFar = mk("path", { class: "nf lo" }, g);
  for (const r of ROOTS) mk("path", { class: "sil", d: poly(hull(ringAt(P, r.a, 0).concat(ringAt(P, r.b, ROOT)))) }, g);
  mk("path", { class: "sil", d: poly(hull(CROWN.flatMap((k) => ringAt(P, k.ring, k.z)))) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, front), TOP)) }, g);
  mk("path", { class: "nf lo", d: seg(P(-7, 0, TOP), P(7, 0, TOP)) + seg(P(0, -7, TOP), P(0, 7, TOP)) }, g);
  const cut = mk("path", { class: "nf hi" }, g);
  const hoopNear = mk("path", { class: "nf sil" }, g), rimNear = mk("path", { class: "nf lo" }, g);

  /** The tooth's outline where the plane at height z cuts it: the crown, or both roots. */
  function slice(z) {
    if (z >= 0) return open(ringAt(P, run(section(z), front), z));
    return ROOTS.map((r) => open(ringAt(P, run(mix(r.a, r.b, z / ROOT), front), z))).join("");
  }

  const zs = spring(ZREST);
  function draw() {
    const z = zs.x;
    if (z === drawn && R === drawnR) return;
    drawn = z; drawnR = R;
    const outer = circ(R, 72), rim = circ(R - BAND, 72);
    hoopFar.setAttribute("d", open(ringAt(P, run(outer, back), z)));
    rimFar.setAttribute("d", open(ringAt(P, run(rim, back), z)));
    hoopNear.setAttribute("d", open(ringAt(P, run(outer, front), z)));
    rimNear.setAttribute("d", open(ringAt(P, run(rim, front), z)));
    cut.setAttribute("d", slice(z));
  }

  const B = register(stage, (dt) => {
    const moving = stepS(zs, dt);
    draw();
    return moving;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => {
      // the height on the tooth's axis under the pointer: the axis is fixed, so the hit never moves
      zs.t = clamp((axis - p[1]) / perZ, ZMIN, ZMAX);
      read.textContent = "slice " + String(Math.round(((zs.t - ZMIN) / (ZMAX - ZMIN)) * STEPS)).padStart(2, "0");
      B.wake();
    },
    leave: () => { zs.t = ZREST; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; draw(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "diagnostics",
  means: "A scanner hoop rides up and down a tooth with the pointer; the slice it cuts is the bright line.",
  rules: [1, 3, 4, 8],
  range: [36, 41, 46],
  tour: [[200, 110], [200, 215], [200, 150], null],
  mount,
});
