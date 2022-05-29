const $pretag = document.getElementById("donut");

let A = 1;
let B = 1;

let asciiframe = () => {
  const b = [];
  const z = [];

  A += 0.02;
  B += 0.009;

  let cA = Math.cos(A);
  const sA = Math.sin(A);
  const cB = Math.cos(B);
  const sB = Math.sin(B);

  for (let k = 0; k < 1760; k++) {
    b[k] = k % 80 == 79 ? "\n" : " ";
    z[k] = 0;
  }

  for (let j = 0; j < 6.28; j += 0.07) {
    // j <=> theta
    const ct = Math.cos(j);
    const st = Math.sin(j);
    for (i = 0; i < 6.28; i += 0.02) {
      // i <=> phi
      const sp = Math.sin(i);
      const cp = Math.cos(i);
      const h = ct + 2; // R1 + R2*cos(theta)
      const D = 1 / (sp * h * sA + st * cA + 5); // this is 1/z
      const t = sp * h * cA - st * sA; // this is a clever factoring of some of the terms in x' and y'

      const x = 0 | (40 + 30 * D * (cp * h * cB - t * sB));
      const y = 0 | (12 + 15 * D * (cp * h * sB + t * cB));
      const o = x + 80 * y;
      const N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));

      if (y < 30 && y >= 0 && x >= 0 && x < 100 && D > z[o]) {
        z[o] = D;
        b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
      }
    }
  }
  $pretag.innerHTML = b.join("");
};

const $canvas = document.getElementById("canvas");

const tmr1 = undefined,
  tmr2 = undefined;

const R1 = 0.8;
const R2 = 1.3;
const K1 = 150;
const K2 = 5;
const canvasframe = function () {
  const ctx = $canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (tmr1 === undefined) {
    // only update A and B if the first animation isn't doing it already
    A += 0.01;
    B += 0.004;
  }
  // precompute cosines and sines of A, B, theta, phi, same as before
  const cA = Math.cos(A);
  const sA = Math.sin(A);
  const cB = Math.cos(B);
  const sB = Math.sin(B);
  for (let j = 0; j < 6.28; j += 0.3) {
    // j <=> theta
    const ct = Math.sin(j);
    const st = Math.cos(j); // cosine theta, sine theta
    for (i = 0; i < 6.28; i += 0.1) {
      // i <=> phi
      const sp = Math.cos(i);
      const cp = Math.sin(i); // cosine phi, sine phi
      const ox = R2 + R1 * ct; // object x, y = (R2,0,0) + (R1 cos theta, R1 sin theta, 0)
      const oy = R1 * st;

      const x = ox * (cB * cp + sA * sB * sp) - oy * cA * sB; // final 3D x coordinate
      const y = ox * (sB * cp - sA * cB * sp) + oy * cA * cB; // final 3D y
      const ooz = 1 / (K2 + cA * ox * sp + sA * oy); // one over z
      const xp = 150 + K1 * ooz * x; // x' = screen space coordinate, translated and scaled to fit our 320x240 canvas element
      const yp = 60 - K1 * ooz * y; // y' (it's negative here because in our output, positive y goes down but in our 3D space, positive y goes up)
      // luminance, scaled back to 0 to 1
      const L = 0.7 * (cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp));
      if (L > 0) {
        ctx.fillStyle = "rgba(255,255,255," + L + ")";
        ctx.fillRect(xp, yp, 1.5, 1.5);
      }
    }
  }

  requestAnimationFrame(() => {
    asciiframe();
    canvasframe();
  });
};

requestAnimationFrame(() => {
  asciiframe();
  canvasframe();
});
