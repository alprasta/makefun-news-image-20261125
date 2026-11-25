// news-image-20261125 — "The World Today"
// A newspaper front page summing up Wednesday 25 November 2026.
// Drawn entirely in code: flat RGB canvas, hand-built 5x7 bitmap font,
// hand-packed PNG (CRC32 + zlib deflate). Node 22, standard library only,
// no network, no randomness, no clock — the same bytes on every run.

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------- palette
const PAPER = [246, 241, 231];
const INK = [20, 20, 20];
const NAVY = [20, 33, 61];
const RED = [179, 32, 42];
const DARKRED = [143, 26, 34];
const GOLD = [201, 162, 39];
const GREY = [107, 107, 102];
const CREAM = [227, 221, 207];
const WHITE = [255, 255, 255];
const ORANGE = [214, 106, 24];

// ------------------------------------------------- 5x7 bitmap font (own work)
// Each glyph: 7 rows, each a 5-bit number, bit 4 = leftmost pixel.
const FONT = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  "2": [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  "3": [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  a: [0b00000, 0b00000, 0b01110, 0b00001, 0b01111, 0b10001, 0b01111],
  b: [0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b11110],
  c: [0b00000, 0b00000, 0b01110, 0b10000, 0b10000, 0b10001, 0b01110],
  d: [0b00001, 0b00001, 0b01111, 0b10001, 0b10001, 0b10001, 0b01111],
  e: [0b00000, 0b00000, 0b01110, 0b10001, 0b11111, 0b10000, 0b01110],
  f: [0b00110, 0b01001, 0b01000, 0b11110, 0b01000, 0b01000, 0b01000],
  g: [0b00000, 0b01111, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110],
  h: [0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b10001],
  i: [0b00100, 0b00000, 0b01100, 0b00100, 0b00100, 0b00100, 0b01110],
  j: [0b00010, 0b00000, 0b00110, 0b00010, 0b00010, 0b10010, 0b01100],
  k: [0b10000, 0b10000, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010],
  l: [0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  m: [0b00000, 0b00000, 0b11010, 0b10101, 0b10101, 0b10101, 0b10101],
  n: [0b00000, 0b00000, 0b11110, 0b10001, 0b10001, 0b10001, 0b10001],
  o: [0b00000, 0b00000, 0b01110, 0b10001, 0b10001, 0b10001, 0b01110],
  p: [0b00000, 0b00000, 0b11110, 0b10001, 0b10001, 0b11110, 0b10000],
  q: [0b00000, 0b00000, 0b01111, 0b10001, 0b10001, 0b01111, 0b00001],
  r: [0b00000, 0b00000, 0b10110, 0b11001, 0b10000, 0b10000, 0b10000],
  s: [0b00000, 0b00000, 0b01111, 0b10000, 0b01110, 0b00001, 0b11110],
  t: [0b01000, 0b01000, 0b11110, 0b01000, 0b01000, 0b01001, 0b00110],
  u: [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b10011, 0b01101],
  v: [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  w: [0b00000, 0b00000, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  x: [0b00000, 0b00000, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001],
  y: [0b00000, 0b10001, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110],
  z: [0b00000, 0b00000, 0b11111, 0b00010, 0b00100, 0b01000, 0b11111],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 0b01100, 0b01100],
  ",": [0, 0, 0, 0, 0b01100, 0b00100, 0b01000],
  ":": [0, 0b01100, 0b01100, 0, 0b01100, 0b01100, 0],
  ";": [0, 0b01100, 0b01100, 0, 0b01100, 0b00100, 0b01000],
  "'": [0b00100, 0b00100, 0b01000, 0, 0, 0, 0],
  "-": [0, 0, 0, 0b01110, 0, 0, 0],
  "—": [0, 0, 0, 0b11111, 0, 0, 0],
  "%": [0b11001, 0b11010, 0b00010, 0b00100, 0b01000, 0b01011, 0b10011],
  "+": [0, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0],
  "/": [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  "(": [0b00010, 0b00100, 0b01000, 0b01000, 0b01000, 0b00100, 0b00010],
  ")": [0b01000, 0b00100, 0b00010, 0b00010, 0b00010, 0b00100, 0b01000],
  "!": [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0, 0b00100],
  "?": [0b01110, 0b10001, 0b00001, 0b00110, 0b00100, 0, 0b00100],
  "&": [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  "=": [0, 0, 0b11111, 0, 0b11111, 0, 0],
  "•": [0, 0, 0b01100, 0b01100, 0b01100, 0, 0],
};

// ------------------------------------------------------------------- canvas
const buf = Buffer.alloc(W * H * 3);

function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
}

function fillRect(x, y, w, h, c) {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w);
  const y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * 3;
      buf[i] = c[0];
      buf[i + 1] = c[1];
      buf[i + 2] = c[2];
    }
  }
}

function hline(x, y, w, c) {
  fillRect(x, y, w, 1, c);
}

function vline(x, y, h, c) {
  fillRect(x, y, 1, h, c);
}

// Bresenham line
function line(x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    px(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function circle(cx, cy, r, c) {
  let x = r;
  let y = 0;
  let err = 0;
  while (x >= y) {
    px(cx + x, cy + y, c);
    px(cx + y, cy + x, c);
    px(cx - y, cy + x, c);
    px(cx - x, cy + y, c);
    px(cx - x, cy - y, c);
    px(cx - y, cy - x, c);
    px(cx + y, cy - x, c);
    px(cx + x, cy - y, c);
    y += 1;
    err += 1 + 2 * y;
    if (2 * (err - x) + 1 > 0) {
      x -= 1;
      err += 1 - 2 * x;
    }
  }
}

function fillCircle(cx, cy, r, c) {
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    fillRect(cx - dx, cy + dy, dx * 2 + 1, 1, c);
  }
}

// Filled triangle by scanline interpolation
function fillTriangle(x0, y0, x1, y1, x2, y2, c) {
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(H - 1, Math.max(y0, y1, y2));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    const edges = [
      [x0, y0, x1, y1],
      [x1, y1, x2, y2],
      [x2, y2, x0, y0],
    ];
    for (const [ax, ay, bx, by] of edges) {
      if ((ay <= y && by > y) || (by <= y && ay > y)) {
        xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
    }
    if (xs.length >= 2) {
      const xa = Math.max(0, Math.floor(Math.min(...xs)));
      const xb = Math.min(W - 1, Math.ceil(Math.max(...xs)));
      fillRect(xa, y, xb - xa + 1, 1, c);
    }
  }
}

// --------------------------------------------------------------------- text
function textWidth(s, scale) {
  return s.length * 6 * scale - scale;
}

function drawText(x, y, s, scale, c) {
  let cx = x;
  for (const ch of s) {
    const g = FONT[ch] || FONT[" "];
    for (let row = 0; row < 7; row++) {
      const bits = g[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          fillRect(cx + col * scale, y + row * scale, scale, scale, c);
        }
      }
    }
    cx += 6 * scale;
  }
  return cx - x;
}

function drawTextCentered(cx, y, s, scale, c) {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

// Greedy word wrap to a pixel width; returns lines.
function wrapText(s, scale, maxW) {
  const words = s.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur === "" ? w : cur + " " + w;
    if (textWidth(test, scale) <= maxW) {
      cur = test;
    } else {
      if (cur !== "") lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

function drawWrapped(x, y, s, scale, maxW, c, lh) {
  const lines = wrapText(s, scale, maxW);
  lines.forEach((ln, i) => drawText(x, y + i * lh, ln, scale, c));
  return lines.length;
}

// ---------------------------------------------------------------------- PNG
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ layout
// A newspaper front page: masthead, lead story with market chart, four
// story boxes, and a footer ticker. All facts verified 25 Nov 2026:
// Reuters (markets, Shenzhou-24, Solomon Islands pact, Odesa, Chen Jining,
// Ecuador), AP / BBC (Huawei verdict context in README only).

function drawMasthead() {
  fillRect(0, 0, W, 8, RED);
  fillRect(0, 8, W, 100, NAVY);
  drawTextCentered(512, 32, "THE WORLD TODAY", 7, WHITE);
  fillRect(0, 108, W, 40, RED);
  drawTextCentered(512, 118, "WEDNESDAY 25 NOVEMBER 2026", 3, WHITE);
}

function drawLead() {
  drawText(30, 164, "MARKETS — LEAD STORY", 2, RED);
  drawText(30, 186, "TARIFF FEARS SINK", 7, INK);
  drawText(30, 244, "ASIAN MARKETS", 7, INK);
  // Big red down arrow beside the headline.
  fillRect(895, 186, 26, 64, RED);
  fillTriangle(862, 250, 948, 250, 905, 300, RED);
  drawWrapped(
    30,
    314,
    "Trump readies new tariffs on 16 trading partners — Seoul -5.3%, Taipei -5.1%, Tokyo -2.9% as Asia-Pacific shares slide -2.3%.",
    2,
    964,
    INK,
    17
  );
}

function drawChart() {
  drawText(30, 362, "ASIAN MARKETS, WEDNESDAY — % CHANGE", 2, INK);
  const rows = [
    ["SEOUL", "-5.3%", 5.3],
    ["TAIPEI", "-5.1%", 5.1],
    ["TOKYO", "-2.9%", 2.9],
    ["ASIA-PAC", "-2.3%", 2.3],
  ];
  rows.forEach((r, i) => {
    const y = 388 + i * 26;
    drawText(30, y, r[0], 2, INK);
    fillRect(200, y + 2, 660, 14, CREAM);
    fillRect(200, y + 2, Math.round(r[2] * 120), 14, RED);
    drawText(200 + Math.round(r[2] * 120) + 10, y, r[1], 2, RED);
  });
}

// --------------------------------------------------------------- pictograms
function drawRocket(ix, iy) {
  fillTriangle(ix + 30, iy + 2, ix + 22, iy + 16, ix + 38, iy + 16, RED);
  fillRect(ix + 22, iy + 16, 16, 26, NAVY);
  fillCircle(ix + 30, iy + 26, 4, WHITE);
  fillTriangle(ix + 22, iy + 34, ix + 14, iy + 48, ix + 22, iy + 44, RED);
  fillTriangle(ix + 38, iy + 34, ix + 46, iy + 48, ix + 38, iy + 44, RED);
  fillTriangle(ix + 26, iy + 42, ix + 34, iy + 42, ix + 30, iy + 56, ORANGE);
}

function drawGlobe(ix, iy) {
  circle(ix + 30, iy + 28, 24, NAVY);
  vline(ix + 30, iy + 4, 48, NAVY);
  hline(ix + 6, iy + 28, 48, NAVY);
  line(ix + 12, iy + 10, ix + 18, iy + 46, NAVY);
  line(ix + 48, iy + 10, ix + 42, iy + 46, NAVY);
}

function drawBlast(ix, iy) {
  const cx = ix + 30;
  const cy = iy + 28;
  const dirs = [
    [0, -26], [18, -18], [26, 0], [18, 18],
    [0, 26], [-18, 18], [-26, 0], [-18, -18],
  ];
  for (const [dx, dy] of dirs) {
    line(cx, cy, cx + dx, cy + dy, ORANGE);
    line(cx + 1, cy, cx + dx + 1, cy + dy, ORANGE);
    line(cx, cy + 1, cx + dx, cy + dy + 1, ORANGE);
  }
  fillCircle(cx, cy, 9, RED);
  fillCircle(cx - 3, cy - 3, 3, WHITE);
}

function drawBuilding(ix, iy) {
  fillTriangle(ix + 6, iy + 20, ix + 54, iy + 20, ix + 30, iy + 4, NAVY);
  fillRect(ix + 12, iy + 24, 6, 20, NAVY);
  fillRect(ix + 27, iy + 24, 6, 20, NAVY);
  fillRect(ix + 42, iy + 24, 6, 20, NAVY);
  fillRect(ix + 6, iy + 46, 48, 5, NAVY);
}

// -------------------------------------------------------------- story boxes
function drawBox(x, y, w, h, kicker, headline, body, icon) {
  fillRect(x, y, w, 2, INK);
  fillRect(x, y + h - 2, w, 2, INK);
  fillRect(x, y, 2, h, INK);
  fillRect(x + w - 2, y, 2, h, INK);
  drawText(x + 16, y + 14, kicker, 2, RED);
  const ix = x + w - 76;
  const iy = y + 10;
  if (icon === "rocket") drawRocket(ix, iy);
  if (icon === "globe") drawGlobe(ix, iy);
  if (icon === "blast") drawBlast(ix, iy);
  if (icon === "building") drawBuilding(ix, iy);
  drawWrapped(x + 16, y + 40, headline, 3, 360, INK, 22);
  drawWrapped(x + 16, y + 96, body, 2, w - 32, INK, 17);
  fillRect(x + 16, y + h - 34, 60, 2, GOLD);
  drawText(x + 16, y + h - 26, "REUTERS", 2, GREY);
}

function drawFooter() {
  fillRect(30, 980, 964, 2, INK);
  drawText(
    30,
    990,
    "ALSO: US pauses Ecuador military ops • Australia inflation jumps to 4.9%",
    2,
    INK
  );
  drawText(
    30,
    1008,
    "US PCE and GDP due today • Nvidia -5.9% • Sources: Reuters, AP, BBC",
    2,
    INK
  );
}

// --------------------------------------------------------------------- main
function drawPage() {
  fillRect(0, 0, W, H, PAPER);
  drawMasthead();
  drawLead();
  drawChart();
  fillRect(30, 496, 964, 3, INK);
  drawBox(
    30, 512, 472, 222,
    "SPACE",
    "Shenzhou-24 lifts off",
    "China launches Shenzhou-24 with a Pakistani astronaut, the first foreigner to visit the Tiangong station.",
    "rocket"
  );
  drawBox(
    522, 512, 472, 222,
    "PACIFIC",
    "Canberra's Pacific pact",
    "Australia and Solomon Islands sign a security pact making Canberra the islands' defence partner of choice.",
    "globe"
  );
  drawBox(
    30, 748, 472, 222,
    "WAR IN UKRAINE",
    "Two killed in Odesa strike",
    "A Russian strike kills two in Ukraine's Odesa region; drones hit Kyiv and wound two more.",
    "blast"
  );
  drawBox(
    522, 748, 472, 222,
    "CHINA",
    "Shanghai chief probed",
    "China investigates Politburo member Chen Jining, the fourth top leader probed since 2025.",
    "building"
  );
  drawFooter();
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
fs.mkdirSync(outDir, { recursive: true });
drawPage();
fs.writeFileSync(path.join(outDir, "entry.png"), encodePNG());
console.log("wrote " + path.join(outDir, "entry.png"));
