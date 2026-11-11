/**
 * Gums: two molars, each a crown on its two roots, standing in a rounded pad
 * of gum that has drawn back: the roots show between gum and crown, and three
 * germs lie on the gum. The pointer is projected onto the gum; the germs
 * within its radius go quiet, and the gum rises over the roots by the share
 * that are quiet, on a spring. The line where gum meets tooth is the one
 * bright mark. The slider is the radius.
 *
 * The pattern: a continuous field. A falloff by distance from a point on the
 * plane the gum heals to, which never moves.
 */
const {
  Cam, circ, fit, hull, lerp, open, poly, proj, rrect, run, seg, unproj,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const R2 = Math.SQRT1_2, TALL = 34, ROOT = -31, LOW = -16, FLOOR = -37, LEN = 46, DEEP = 21;
const SPOTS = [-21, 21], GERMS = [[-39, 13], [0, 16], [39, 13]];
/** The molar of the set: [height, ring]. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => {
  const h = w * 0.8;
  return { z, ring: rrect(-h, -h, h, h, h * 0.62, 6) };
});
const top = rrect(-11, -11, 11, 11, 6.5, 6);
/** A root's outline at height z: a circle that narrows and leans outwards on the way down; k is -1 or 1. */
const rootAt = (k, z) => {
  const t = (1 - z) / (1 - ROOT);
  return circ(lerp(8.1, 3.9, t), 20).map((q) => ({ u: q.u + k * lerp(7.2, 10.3, t), v: q.v, nu: q.nu, nv: q.nv }));
};
/** The figure's own axes, as a world point: s runs across the screen, d comes towards the viewer, z is up. */
const at = (s, d, z) => [(s + d) * R2, (d - s) * R2, z];
const near = (q) => q.nv >= -1e-6;
const pad = rrect(-LEN, -DEEP, LEN, DEEP, 17, 8), padIn = rrect(-LEN + 4, -DEEP + 4, LEN - 4, DEEP - 4, 13, 8);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value, over = null, drawn = NaN;

  const C = Cam(45, 0.5, 2.05);
  fit(C, [at(-LEN, DEEP, FLOOR), at(LEN, DEEP, FLOOR), at(-LEN, -DEEP, 0), at(-40, -18, TALL), at(40, -18, TALL)], 200, 160);
  const P = proj(C), W = (s, d, z) => P(...at(s, d, z));

  const g = mk("g", {}, svg);
  const gum = solid(g);
  const germs = GERMS.map(([s, d]) => ({ s, d, el: flatDot(g, C, 2.5, "dot m") }));
  // each tooth: the roots that show above the gum, then the crown over them
  const teeth = SPOTS.map((spot) => {
    const roots = [mk("path", { class: "sil" }, g), mk("path", { class: "sil" }, g)];
    mk("path", { class: "sil", d: poly(hull(CROWN.flatMap((c) => c.ring.map((q) => W(spot + q.u, q.v, c.z))))) }, g);
    mk("path", { class: "nf lo", d: open(run(top, near).map((q) => W(spot + q.u, q.v, TALL))) }, g);
    mk("path", { class: "nf lo", d: seg(W(spot - 6, 0, TALL), W(spot + 6, 0, TALL)) + seg(W(spot, -6, TALL), W(spot, 6, TALL)) }, g);
    return { spot, roots };
  });
  const margin = mk("path", { class: "nf hi" }, g);

  const hs = spring(LOW);
  /** The gum at height h: the pad, the germs on it, the roots from the gum up, and the line where they meet. */
  function draw() {
    const h = hs.x;
    if (h === drawn) return;
    drawn = h;
    put(gum, {
      sil: poly(hull(pad.map((q) => W(q.u, q.v, FLOOR)).concat(pad.map((q) => W(q.u, q.v, h))))),
      crease: open(run(padIn, near).map((q) => W(q.u, q.v, h))),
    });
    for (const m of germs) place(m.el, W(m.s, m.d, h));
    let line = "";
    for (const t of teeth) [-1, 1].forEach((k, r) => {
      const cut = rootAt(k, h), neck = rootAt(k, 1);
      t.roots[r].setAttribute("d", poly(hull(cut.map((q) => W(t.spot + q.u, q.v, h)).concat(neck.map((q) => W(t.spot + q.u, q.v, 1))))));
      line += open(run(cut, near).map((q) => W(t.spot + q.u, q.v, h)));
    });
    margin.setAttribute("d", line);
  }

  const B = register(stage, (dt) => {
    const moving = stepS(hs, dt);
    draw();
    return moving;
  });
  bag.add(B.unregister);

  function retarget() {
    let quiet = 0;
    for (const m of germs) {
      const still = !!over && Math.hypot(m.s - over[0], m.d - over[1]) <= R;
      m.el.setAttribute("class", still ? "dot off" : "dot m");
      if (still) quiet++;
    }
    hs.t = LOW * (1 - quiet / germs.length);
    read.textContent = over ? `clean ${quiet}/${germs.length}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      // the point of the healed gum's plane under the pointer, in the figure's own axes
      const [x, y] = unproj(C, p[0], p[1], 0);
      over = [(x - y) * R2, (x + y) * R2];
      retarget();
    },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "gums",
  means: "The gum has drawn back from the roots; near the pointer the germs go quiet and it rises to the crowns again.",
  rules: [1, 3, 4, 5],
  range: [30, 46, 80],
  tour: [[130, 200], [270, 200], [200, 190], null],
  mount,
});
