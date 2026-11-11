/**
 * Prosthetics: a milling table with a blank block on it and a spindle parked
 * above. Under the pointer the spindle dips, the block is cut away to the crown
 * that was inside it, and the spindle lifts clear again. The spindle is bright at rest, the crown once
 * it is cut free. The slider is how much of the blank is left.
 *
 * The pattern: one discrete change on one tween. The crown is drawn only above
 * the block's top, so the block never shows through it.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const FOOT = 2, TOP = 36, BLANK = 42, TABLE = -10, HALF = 31, BLOCK = 25;
const PARK = 50, DIP = 9, BUR = 12, CHUCK = 16, OFF = 0;
/** The crown's profile, neck to biting surface: [height, half-width]. Its hull is the barrel of a molar. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => ({ z, ring: rrect(-w, -w, w, w, w * 0.62, 6) }));
const neck = CROWN[0].ring, inner = rrect(-14, -14, 14, 14, 8, 6);
const at = (ring) => ring.map((q) => ({ u: q.u + OFF, v: q.v + OFF, nu: q.nu, nv: q.nv }));
const bur = at(circ(3.4, 20)), chuck = at(circ(11, 36)), chuckIn = at(circ(8.2, 36));
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
  let left = value, on = false, last = NaN;

  const C = Cam(45, 0.5, 2.15);
  fit(C, [[-HALF, -HALF, TABLE], [HALF, HALF, TABLE], [HALF, -HALF, 0], [-HALF, HALF, 0], [OFF - 9, OFF - 9, PARK + BUR + CHUCK]], 200, 160);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, rrect(-HALF, -HALF, HALF, HALF, 16, 8), rrect(-HALF + 4, -HALF + 4, HALF - 4, HALF - 4, 12, 8), TABLE, 0));
  const blockRing = rrect(-BLOCK, -BLOCK, BLOCK, BLOCK, 9, 6), blockIn = rrect(-BLOCK + 3.5, -BLOCK + 3.5, BLOCK - 3.5, BLOCK - 3.5, 5.5, 6);
  const block = solid(g), crown = solid(g), groove = mk("path", { class: "nf lo" }, g);
  const tip = mk("path", { class: "sil hi" }, g), head = solid(g);
  head.sil.classList.add("hi");

  /** The crown from height h up: the block still hides what is below its top. */
  function reveal(h) {
    if (h >= TOP - 1) return { sil: "", crease: "", groove: "" };
    const from = Math.max(h, FOOT) - FOOT;
    const pts = ringAt(P, section(from), from + FOOT).concat(CROWN.filter((k) => k.z > from).flatMap((k) => ringAt(P, k.ring, k.z + FOOT)));
    return {
      sil: poly(hull(pts)), crease: open(ringAt(P, run(inner, front), TOP)),
      groove: seg(P(-7, 0, TOP), P(7, 0, TOP)) + seg(P(0, -7, TOP), P(0, 7, TOP)),
    };
  }

  /** The pose at k: 0 is the whole blank with the spindle parked, 1 is the crown cut free. */
  function draw(k) {
    if (k === last) return;
    last = k;
    const h = lerp(BLANK, Math.max(0.6, left), k), z = PARK - DIP * Math.sin(Math.PI * k), r = reveal(h);
    put(block, prism(P, front, blockRing, blockIn, 0, h));
    put(crown, r);
    groove.setAttribute("d", r.groove);
    tip.setAttribute("d", poly(hull(ringAt(P, bur, z).concat(ringAt(P, bur, z + BUR)))));
    put(head, prism(P, front, chuck, chuckIn, z + BUR, z + BUR + CHUCK));
  }

  const tw = tween(0);
  const B = register(stage, (_dt, now) => {
    draw(tval(tw, now));
    return !tdone(tw, now);
  });
  bag.add(B.unregister);

  function mill(want) {
    if (want === on) return;
    on = want;
    tset(tw, on ? 1 : 0, performance.now(), 0);
    tip.classList.toggle("hi", !on); head.sil.classList.toggle("hi", !on);
    crown.sil.classList.toggle("hi", on);
    read.textContent = on ? "milled" : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: () => mill(true), leave: () => mill(false) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { left = v; last = NaN; draw(on ? 1 : 0); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "prosthetics",
  means: "Under the pointer the spindle comes down and the blank block is cut away to the crown inside it.",
  rules: [1, 4, 6, 8],
  range: [16, 6, 1],
  tour: [[200, 130], [200, 200], null],
  mount,
});
