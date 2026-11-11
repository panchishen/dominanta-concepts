/**
 * Gums: a molar seated in a rounded cushion of gum, with six germs lying on it.
 * The pointer is projected onto the gum; the germs within its radius go quiet,
 * and the gum rises round the tooth by the share that are quiet, on a spring.
 * The line where gum meets tooth is the one bright mark. At rest the gum sits
 * low and the germs are all awake. The slider is the radius.
 *
 * The pattern: a continuous field. A falloff by distance from a point on the
 * plane the gum heals to, which never moves.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, ringAt, rrect, run, seg, unproj,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const TOP = 34, LOW = -13, BASE = -24, HALF = 40;
/** The crown's profile, neck to biting surface: [height, half-width]. Its hull is the barrel of a molar. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => ({ z, ring: rrect(-w, -w, w, w, w * 0.62, 6) }));
const neck = CROWN[0].ring, inner = rrect(-14, -14, 14, 14, 8, 6);
const GERMS = [[-31, 5], [-18, 27], [5, 32], [28, 19], [33, -6], [19, -29]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value, over = null, drawn = NaN;

  const C = Cam(45, 0.5, 2.4);
  fit(C, [[-HALF, -HALF, BASE], [HALF, HALF, BASE], [HALF, -HALF, 0], [-HALF, HALF, 0], [-20, -20, TOP]], 200, 160);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const gumRing = rrect(-HALF, -HALF, HALF, HALF, 24, 10), gumInner = rrect(-HALF + 4, -HALF + 4, HALF - 4, HALF - 4, 20, 10);
  const gum = solid(g);
  const germs = GERMS.map(([x, y]) => ({ x, y, quiet: false, el: flatDot(g, C, 2.5, "dot m") }));
  const crown = mk("path", { class: "sil" }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, front), TOP)) }, g);
  mk("path", { class: "nf lo", d: seg(P(-7, 0, TOP), P(7, 0, TOP)) + seg(P(0, -7, TOP), P(0, 7, TOP)) }, g);
  const margin = mk("path", { class: "nf hi" }, g);

  const crownAbove = CROWN.flatMap((k) => ringAt(P, k.ring, k.z));
  const hs = spring(LOW);
  /** The gum at height h: the cushion, the germs on it, and the crown from the gum line up. */
  function draw() {
    const h = hs.x;
    if (h === drawn) return;
    drawn = h;
    put(gum, prism(P, front, gumRing, gumInner, BASE, h));
    for (const m of germs) place(m.el, P(m.x, m.y, h));
    crown.setAttribute("d", poly(hull(ringAt(P, neck, h).concat(crownAbove))));
    margin.setAttribute("d", open(ringAt(P, run(neck, front), h)));
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
      m.quiet = !!over && Math.hypot(m.x - over[0], m.y - over[1]) <= R;
      m.el.setAttribute("class", m.quiet ? "dot off" : "dot m");
      if (m.quiet) quiet++;
    }
    hs.t = LOW * (1 - quiet / germs.length);
    read.textContent = over ? `clean ${quiet}/${germs.length}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
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
  means: "Germs on the gum go quiet near the pointer, and the gum rises to close round the tooth.",
  rules: [1, 3, 4, 5],
  range: [32, 52, 80],
  tour: [[150, 190], [250, 190], [200, 170], null],
  mount,
});
