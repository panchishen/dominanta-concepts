/**
 * Implant: a cushion of gum, a threaded post standing half out of it, and a
 * crown waiting above. Under the pointer the post turns down into the gum and
 * the crown lands on it a beat later; leaving lifts the crown first. The post
 * is bright at rest, the crown once it is seated. The slider is that beat, in ms.
 *
 * The pattern: one discrete change on two tweens, the second staggered. The
 * hit is the stage itself, so nothing that moves can drop the hover.
 */
const {
  Cam, circ, facing, fit, hull, open, poly, prism, proj, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const TOP = 34, BASE = -24, HALF = 32, POST = 9.5, LEN = 40, PITCH = 7;
const UP = 22, DOWN = 3, HOVER = 40, SEAT = 4, STUB = 7;
/** The crown's profile, neck to biting surface: [height, half-width]. Its hull is the barrel of a molar. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => ({ z, ring: rrect(-w, -w, w, w, w * 0.62, 6) }));
const neck = CROWN[0].ring, inner = rrect(-14, -14, 14, 14, 8, 6);
const post = circ(POST, 40), postIn = circ(POST - 2.4, 40), stub = circ(5.5, 28), stubIn = circ(3.6, 28);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, on = false, lastT = NaN, lastC = NaN;

  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-HALF, -HALF, BASE], [HALF, HALF, BASE], [HALF, -HALF, 0], [-HALF, HALF, 0], [-20, -20, HOVER + TOP]], 200, 160);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const gumRing = rrect(-HALF, -HALF, HALF, HALF, 20, 10), gumInner = rrect(-HALF + 4, -HALF + 4, HALF - 4, HALF - 4, 16, 10);
  put(solid(g), prism(P, front, gumRing, gumInner, BASE, 0));
  mk("path", { class: "nf lo", d: poly(ringAt(P, circ(POST + 4, 40), 0)) }, g);
  const body = solid(g), thread = mk("path", { class: "nf" }, g);
  const cap = solid(g), slot = mk("path", { class: "nf" }, g);
  const crown = solid(g), groove = mk("path", { class: "nf lo" }, g);

  /** The thread on the near side of the post: a helix that turns as the post goes down, kept above the gum. */
  function helix(t) {
    const turn = (UP - t) / PITCH * 0.5;
    let d = "";
    for (let k = -1; k < 7; k++) {
      let piece = [];
      for (let a = -45; a <= 135; a += 15) {
        const z = t - 4 - PITCH * (k + (turn % 1) + (a + 45) / 360);
        if (z > 0.8 && z < t - 3 && z > t - LEN) piece.push(P(POST * Math.cos(a * Math.PI / 180), POST * Math.sin(a * Math.PI / 180), z));
        else { d += open(piece); piece = []; }
      }
      d += open(piece);
    }
    return d;
  }

  function draw(t, c) {
    if (t !== lastT) {
      lastT = t;
      put(body, prism(P, front, post, postIn, 0, t));
      thread.setAttribute("d", helix(t));
      put(cap, prism(P, front, stub, stubIn, t, t + STUB));
      const a = (UP - t) / PITCH * Math.PI, dx = 3.2 * Math.cos(a), dy = 3.2 * Math.sin(a);
      slot.setAttribute("d", seg(P(dx, dy, t + STUB), P(-dx, -dy, t + STUB)));
    }
    if (c !== lastC) {
      lastC = c;
      crown.sil.setAttribute("d", poly(hull(CROWN.flatMap((k) => ringAt(P, k.ring, c + k.z)))));
      crown.cr.setAttribute("d", open(ringAt(P, run(inner, front), c + TOP)));
      groove.setAttribute("d", seg(P(-7, 0, c + TOP), P(7, 0, c + TOP)) + seg(P(0, -7, c + TOP), P(0, 7, c + TOP)));
    }
  }

  const tw = tween(UP), cw = tween(HOVER);
  const B = register(stage, (_dt, now) => {
    draw(tval(tw, now), tval(cw, now));
    return !tdone(tw, now) || !tdone(cw, now);
  });
  bag.add(B.unregister);

  /** Seats the implant, post first; or frees it, crown first. */
  function seat(want) {
    if (want === on) return;
    on = want;
    const now = performance.now();
    tset(tw, on ? DOWN : UP, now, on ? 0 : stag);
    tset(cw, on ? SEAT : HOVER, now, on ? stag : 0);
    body.sil.classList.toggle("hi", !on);
    crown.sil.classList.toggle("hi", on);
    read.textContent = on ? "seated" : "rest";
    B.wake();
  }
  body.sil.classList.add("hi");

  bag.add(pointer(stage, { move: () => seat(true), leave: () => seat(false) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "implant",
  means: "A threaded post turns down into the gum under the pointer, and the crown lands on it a beat later.",
  rules: [1, 2, 4, 8],
  range: [0, 220, 500],
  tour: [[200, 120], [200, 190], null],
  mount,
});
