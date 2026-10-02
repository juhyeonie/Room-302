import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'https://esm.sh/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

const FH = '"Bricolage Grotesque", sans-serif', FM = '"JetBrains Mono", monospace';
const C = { wall: 0xEBE0CF, wain: 0xE2D3BD, trim: 0xF6EEE2, wood: 0xC9996A, woodD: 0xA87A4E, woodDD: 0x8E5E3E, terra: 0xD9734E, mustard: 0xE2B04A, sage: 0x8FA88A, teal: 0x6E9C9A, ink: 0x2B2622, cream: 0xFBF7F0 };
const SKILLS = [['React', 0xD9734E, .62], ['JavaScript', 0xE2B04A, .7], ['Tailwind CSS', 0x6E9C9A, .58], ['HTML & CSS', 0xCDBBA2, .52], ['Node.js', 0x7E9B6A, .66], ['Supabase', 0x4F7A63, .6], ['Git', 0xB5532F, .55], ['Figma', 0x8C7AA8, .64], ['Java', 0x5E6E8C, .7], ['Python', 0xD7A65A, .57]];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ANCHOR = {
  pc: V(.1, 2.78, -3.62), shelf: V(-3.65, 3.95, -1.6), desk: V(-.85, 1.72, -2.95), phone: V(1.0, 1.98, -3.1),
  polaroids: V(-2.45, 3.55, -3.95), posters: V(-3.95, 3.7, 2.15), drawer: V(1.45, 1.42, -2.75), bed: V(-2.1, 1.25, 2.2),
  window: V(.3, 3.85, -3.9), calendar: V(2.3, 3.4, -3.95), headphones: V(-1.2, 2.36, -3.55),
};
const VIEW = {
  pc: [V(.1, 2.12, -3.6), V(.7, 2.65, -.5)], shelf: [V(-3.65, 1.85, -1.6), V(-.2, 2.5, -.4)], desk: [V(-.85, 1.5, -2.95), V(.1, 3.5, -.9)],
  phone: [V(1.0, 1.75, -3.1), V(2.4, 2.9, -.3)], polaroids: [V(-2.45, 3.15, -4), V(-1.5, 3.0, -.8)], posters: [V(-4, 2.85, 2.15), V(-.4, 2.8, 2.6)],
  drawer: [V(1.45, 1.1, -2.8), V(2.9, 2.2, -.1)], bed: [V(-2.4, .8, 2.2), V(1.6, 3.3, 4.2)], window: [V(.3, 2.75, -4), V(1.0, 2.6, .7)],
  calendar: [V(2.3, 2.9, -4), V(2.9, 2.9, -.9)], headphones: [V(-1.2, 2.0, -3.55), V(.1, 2.9, -.5)],
};
const TARGET = V(-.1, 1.55, -.3), DIR = V(1, .74, 1.1).normalize();

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function stripes(g, x, y, w, h, a, b, s = 6) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = a; g.fillRect(x, y, w, h); g.strokeStyle = b; g.lineWidth = s; for (let i = -h; i < w + h; i += s * 2) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i + h, y + h); g.stroke(); } g.restore(); }

function makeTextures() {
  const T = {};
  T.floor = tex(1024, 1024, (g, w, h) => {
    const r = rng(7), pw = 64;
    for (let x = 0; x < w; x += pw) {
      let y = -Math.floor(r() * 400);
      while (y < h) {
        const len = 300 + r() * 300, l = 54 + r() * 8;
        g.fillStyle = `hsl(28 ${38 + r() * 8}% ${l}%)`; g.fillRect(x, y, pw, len);
        g.strokeStyle = 'rgba(255,240,220,.07)'; g.lineWidth = 1;
        for (let k = 0; k < 4; k++) { const gx = x + 8 + r() * (pw - 16); g.beginPath(); g.moveTo(gx, y); g.lineTo(gx + (r() - .5) * 6, y + len); g.stroke(); }
        g.fillStyle = 'rgba(60,35,15,.35)'; g.fillRect(x, y, pw, 2);
        y += len;
      }
      g.fillStyle = 'rgba(60,35,15,.4)'; g.fillRect(x, 0, 2, h);
    }
  });
  T.wall = tex(256, 256, (g, w, h) => { g.fillStyle = '#EBE0CF'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.22)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h); }, [10, 5]);
  const sky = (night) => tex(512, 400, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, night ? '#151C44' : '#9CC7E6'); gr.addColorStop(1, night ? '#3A3E70' : '#DCEBF1');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(11);
    if (night) {
      g.fillStyle = '#F3EFDF'; for (let i = 0; i < 40; i++) { g.globalAlpha = .4 + r() * .6; g.fillRect(r() * w, r() * h * .6, 2, 2); } g.globalAlpha = 1;
      g.shadowColor = 'rgba(243,239,223,.6)'; g.shadowBlur = 30; g.beginPath(); g.arc(380, 90, 30, 0, 7); g.fill(); g.shadowBlur = 0;
    } else {
      g.shadowColor = 'rgba(255,230,160,.9)'; g.shadowBlur = 50; g.fillStyle = '#FFE6A0'; g.beginPath(); g.arc(380, 92, 38, 0, 7); g.fill(); g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.roundRect(60, 110, 130, 30, 15); g.roundRect(90, 92, 60, 36, 18); g.roundRect(250, 60, 90, 22, 11); g.fill();
    }
    let x = 0; const r2 = rng(3);
    while (x < w) {
      const bw = 34 + r2() * 40, bh = 70 + r2() * 120;
      g.fillStyle = night ? '#262B57' : (r2() > .5 ? '#AFC2D0' : '#A2B7C7'); g.fillRect(x, h - bh, bw - 5, bh);
      if (night) { for (let yy = h - bh + 10; yy < h - 8; yy += 16) for (let xx = x + 6; xx < x + bw - 12; xx += 12) if (r2() > .55) { g.fillStyle = '#E9C46A'; g.fillRect(xx, yy, 5, 7); } }
      x += bw;
    }
  });
  T.skyDay = sky(false); T.skyNight = sky(true);
  T.code = tex(640, 370, (g, w, h) => {
    g.fillStyle = '#1F2534'; g.fillRect(0, 0, w, h); g.fillStyle = '#171C28'; g.fillRect(0, 0, w, 36);
    ['#D9734E', '#E2B04A', '#8FA88A'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(22 + i * 20, 18, 6, 0, 7); g.fill(); });
    g.fillStyle = '#2A3142'; g.fillRect(90, 6, 150, 30); g.fillStyle = '#9DB7D9'; g.font = `500 15px ${FM}`; g.fillText('Room302.jsx', 106, 26);
    const r = rng(5), cols = ['#D98A6A', '#9DB7D9', '#E2B04A', '#A9C79B', '#5E6A82', '#C9A7E0'];
    for (let i = 0; i < 13; i++) {
      const y = 56 + i * 23; g.fillStyle = '#4A5268'; g.font = `500 12px ${FM}`; g.fillText(String(i + 1), 16, y + 9);
      let x = 52 + [0, 1, 1, 2, 2, 1, 2, 3, 3, 2, 1, 0, 0][i] * 24;
      const n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) { const lw = 30 + r() * 110; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.beginPath(); g.roundRect(x, y, lw, 9, 4); g.fill(); x += lw + 10; }
    }
    g.fillStyle = '#E9E3D8'; g.fillRect(104, 56 + 12 * 23 - 4, 8, 17);
  });
  T.page = tex(256, 340, (g, w, h) => {
    g.fillStyle = '#FBF7F0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C9D3E0'; g.lineWidth = 2;
    for (let y = 40; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = '#E9A890'; g.beginPath(); g.moveTo(40, 0); g.lineTo(40, h); g.stroke();
    g.strokeStyle = '#3A3330'; g.lineWidth = 3; g.lineCap = 'round'; const r = rng(9);
    for (let i = 0; i < 8; i++) { const y = 36 + i * 24; g.beginPath(); g.moveTo(52, y); let x = 52; const end = 90 + r() * 140; while (x < end) { x += 8; g.lineTo(x, y - 3 + r() * 6); } g.stroke(); }
  });
  T.hack = tex(360, 500, (g, w, h) => {
    g.fillStyle = '#D9734E'; g.fillRect(0, 0, w, h); g.fillStyle = '#F2C35B'; g.beginPath(); g.arc(110, 120, 72, 0, 7); g.fill();
    g.fillStyle = '#FBF2E6'; g.font = `700 104px ${FH}`; g.fillText('HACK', 24, 335); g.fillText('DAY', 24, 425);
    g.font = `500 22px ${FM}`; g.fillText('UCC · 2025', 28, 470);
    g.fillStyle = 'rgba(245,236,214,.85)'; g.save(); g.translate(180, 8); g.rotate(.06); g.fillRect(-50, -12, 100, 30); g.restore();
  });
  T.cert = tex(320, 400, (g, w, h) => {
    g.fillStyle = '#FBF7F0'; g.fillRect(0, 0, w, h); g.fillStyle = '#6B5F55'; g.font = `500 20px ${FM}`; g.textAlign = 'center'; g.fillText('CERTIFICATE', w / 2, 110);
    g.fillStyle = 'rgba(43,38,34,.75)'; g.fillRect(70, 150, 180, 6); g.fillStyle = 'rgba(43,38,34,.35)'; g.fillRect(95, 176, 130, 5); g.fillRect(110, 196, 100, 5);
    g.fillStyle = '#E2B04A'; g.beginPath(); g.arc(160, 290, 42, 0, 7); g.fill(); g.strokeStyle = '#F2CE7A'; g.lineWidth = 7; g.beginPath(); g.arc(160, 290, 30, 0, 7); g.stroke();
  });
  T.cal = tex(290, 370, (g, w, h) => {
    const now = new Date(), M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); g.fillStyle = '#D9734E'; g.fillRect(0, 0, w, 56);
    g.fillStyle = '#FBF7F0'; [95, 195].forEach(x => { g.beginPath(); g.arc(x, 28, 9, 0, 7); g.fill(); });
    g.fillStyle = '#2B2622'; g.font = `700 50px ${FH}`; g.fillText(M[now.getMonth()], 22, 122);
    g.fillStyle = '#6B5F55'; g.font = `500 20px ${FM}`; g.textAlign = 'right'; g.fillText(String(now.getFullYear()), w - 22, 120);
    const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay(), days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 0; i < 35; i++) { const d = i - first + 1; if (d < 1 || d > days) continue; g.fillStyle = d === now.getDate() ? '#D9734E' : '#EAE0D1'; g.beginPath(); g.roundRect(22 + (i % 7) * 36, 150 + Math.floor(i / 7) * 40, 28, 30, 5); g.fill(); }
  });
  const pal = [['#D9C7AE', '#E8DAC6'], ['#C9D3BF', '#DCE4D3'], ['#E5C3B3', '#F0D7CB'], ['#C7D0DD', '#DAE1EA']];
  T.pol = pal.map(p => tex(170, 200, (g, w, h) => { g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); stripes(g, 12, 12, 146, 140, p[0], p[1], 7); g.fillStyle = 'rgba(43,38,34,.35)'; g.fillRect(40, 172, 90, 4); }));
  T.plaque = tex(200, 100, (g, w, h) => { g.fillStyle = '#A8843F'; g.beginPath(); g.roundRect(0, 0, w, h, 16); g.fill(); g.fillStyle = '#CBA45E'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 12); g.fill(); g.fillStyle = '#3A2C17'; g.font = `700 62px ${FH}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('302', w / 2, h / 2 + 3); });
  T.clock = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#FBF7F0'; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill(); g.fillStyle = '#2B2622';
    for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 6); g.fillRect(-3, -112, 6, i % 3 ? 12 : 22); g.restore(); }
    g.lineCap = 'round'; g.strokeStyle = '#2B2622'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.stroke();
    g.strokeStyle = '#D9734E'; g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(186, 150); g.stroke();
  });
  T.rug = tex(680, 460, (g, w, h) => {
    g.fillStyle = '#D9C7AE'; g.fillRect(0, 0, w, h); g.fillStyle = '#EFE3CF'; g.fillRect(18, 18, w - 36, h - 36);
    for (let x = 70; x < w - 40; x += 80) { g.fillStyle = 'rgba(143,168,138,.6)'; g.fillRect(x, 18, 14, h - 36); g.fillStyle = 'rgba(217,115,78,.45)'; g.fillRect(x + 26, 18, 5, h - 36); }
  });
  T.curtain = tex(128, 512, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = '#D9734E'; g.fillRect(x, 0, 22, h); g.fillStyle = '#C4613D'; g.fillRect(x + 22, 0, 10, h); } });
  return T;
}

export async function createRoom(el, labelEl, dotsEl, cb) {
  try { await Promise.race([Promise.all([document.fonts.load(`700 64px ${FH}`), document.fonts.load(`500 20px ${FM}`)]), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  const T = makeTextures();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const dom = renderer.domElement; dom.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;';
  el.appendChild(dom);
  const scene = new THREE.Scene();
  const bgDay = new THREE.Color(0xE9DFCF), bgNight = new THREE.Color(0x1A1E33);
  scene.background = bgDay.clone();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 120);

  const M = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .82, metalness: 0 }, o || {}));
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r || .04);
  const add = (geo, mat, x, y, z, parent, rot, noShadow) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    m.castShadow = !noShadow; m.receiveShadow = true; (parent || scene).add(m); return m;
  };
  const groups = {};
  const G = (key) => { const g = new THREE.Group(); g.userData.key = key; scene.add(g); groups[key] = g; return g; };
  const plane = (w, h, mat, x, y, z, parent, ry, rz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(0, ry || 0, 0); if (rz) m.rotateZ(rz); m.receiveShadow = true; (parent || scene).add(m); return m; };
  const P = Math.PI;

  // shell
  add(B(8, .3, 8), M(0xffffff, { map: T.floor, roughness: .7 }), 0, -.15, 0, null, null, true);
  add(B(8.3, .26, 8.3), M(0x7A4E33), 0, -.42, 0);
  add(B(8.2, 4.6, .2), M(0xffffff, { map: T.wall }), -.1, 2.3, -4.1);
  add(B(.2, 4.6, 8), M(0xffffff, { map: T.wall }), -4.1, 2.3, 0);
  add(B(8, 1.5, .04), M(C.wain), 0, .75, -3.98, null, null, true);
  add(B(8, .06, .09), M(C.trim), 0, 1.52, -3.96);
  add(B(.04, 1.5, 8), M(C.wain), -3.98, .75, 0, null, null, true);
  add(B(.09, .06, 8), M(C.trim), -3.96, 1.52, 0);
  add(B(8, .16, .06), M(C.trim), 0, .08, -3.95);
  add(B(.06, .16, 8), M(C.trim), -3.95, .08, 0);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .14 }));
  ground.rotation.x = -P / 2; ground.position.y = -.56; ground.receiveShadow = true; scene.add(ground);
  add(B(3.4, .02, 2.3), M(0xffffff, { map: T.rug, roughness: .95 }), .7, .011, .7, null, null, true);

  // window
  const win = G('window'), wx = .3, wy = 2.75;
  const skyN = plane(2.1, 1.6, new THREE.MeshBasicMaterial({ map: T.skyNight, toneMapped: false }), wx, wy, -3.987, win);
  const skyDMat = new THREE.MeshBasicMaterial({ map: T.skyDay, transparent: true, toneMapped: false });
  plane(2.1, 1.6, skyDMat, wx, wy, -3.983, win);
  const frame = M(C.cream);
  add(B(2.36, .12, .14), frame, wx, wy + .86, -3.94, win); add(B(2.36, .12, .14), frame, wx, wy - .86, -3.94, win);
  add(B(.12, 1.84, .14), frame, wx - 1.12, wy, -3.94, win); add(B(.12, 1.84, .14), frame, wx + 1.12, wy, -3.94, win);
  add(B(.06, 1.62, .06), frame, wx, wy, -3.95, win); add(B(2.12, .06, .06), frame, wx, wy + .1, -3.95, win);
  add(B(2.6, .08, .34), M(0xF4ECE0), wx, wy - .94, -3.84, win);
  add(new THREE.CylinderGeometry(.09, .07, .16, 16), M(0xC8693F), wx + .85, wy - .82, -3.82, win);
  add(new THREE.SphereGeometry(.13, 16, 12), M(0x7E9B6A), wx + .85, wy - .66, -3.82, win).scale.set(1, .8, 1);
  add(new THREE.CylinderGeometry(.022, .022, 3.5, 8), M(0x7A5236), wx, 3.82, -3.86, win, [0, 0, P / 2]);
  const curt = M(0xffffff, { map: T.curtain });
  add(RB(.44, 2.4, .1, .04), curt, wx - 1.45, 2.6, -3.84, win); add(RB(.44, 2.4, .1, .04), curt, wx + 1.45, 2.6, -3.84, win);

  // desk
  const desk = G('desk');
  add(RB(3.2, .1, 1.2, .02), M(C.wood), .3, 1.45, -3.35, desk);
  const legM = M(C.woodD);
  add(B(.08, 1.4, .08), legM, -1.2, .7, -2.85, desk); add(B(.08, 1.4, .08), legM, -1.2, .7, -3.85, desk);
  add(B(.06, .06, 1.0), legM, -1.2, .25, -3.35, desk);
  add(B(.85, 1.4, 1.1), M(C.wood), 1.45, .7, -3.35, desk);
  const dfM = M(0xD4A676), knobM = M(0x6E4630);
  [.72, .28].forEach(y => { add(B(.76, .38, .04), dfM, 1.45, y, -2.78, desk); add(B(.18, .04, .04), knobM, 1.45, y, -2.74, desk); });
  add(B(.42, .02, .56), M(C.terra), -.85, 1.51, -2.95, desk, [0, .12, 0]);
  add(B(.4, .012, .54), M(0xffffff, { map: T.page }), -.85, 1.526, -2.95, desk, [0, .12, 0]);
  add(new THREE.CylinderGeometry(.012, .012, .36, 8), M(C.ink), -.55, 1.535, -2.88, desk, [0, .5, P / 2]);
  const drawer = G('drawer');
  add(B(.78, .38, .05), M(0xD9AC7C), 1.45, 1.16, -2.77, drawer);
  add(B(.18, .04, .04), knobM, 1.45, 1.16, -2.73, drawer);
  add(B(.16, .012, .1), M(0xF2D57A), 1.62, 1.36, -2.76, drawer, [.5, 0, .1]);

  // pc
  const pc = G('pc');
  add(RB(1.42, .86, .06, .03), M(C.ink, { roughness: .5 }), .1, 2.2, -3.65, pc);
  plane(1.32, .76, new THREE.MeshBasicMaterial({ map: T.code, toneMapped: false }), .1, 2.2, -3.618, pc);
  add(B(.08, .34, .06), M(0x3A3330), .1, 1.67, -3.67, pc);
  add(RB(.5, .03, .3, .012), M(0x3A3330), .1, 1.515, -3.62, pc);
  add(RB(.9, .04, .3, .015), M(0xEFE6D8), .1, 1.52, -3.0, pc);
  add(RB(.09, .035, .14, .017), M(0xEFE6D8), .74, 1.52, -3.0, pc);

  // headphones
  const hp = G('headphones'), hx = -1.2, hz = -3.55;
  add(new THREE.CylinderGeometry(.13, .14, .03, 24), M(0x3A3330), hx, 1.515, hz, hp);
  add(new THREE.CylinderGeometry(.02, .02, .54, 8), M(0x3A3330), hx, 1.79, hz, hp);
  add(new THREE.TorusGeometry(.17, .026, 10, 28, P), M(0x3A3330), hx, 2.08, hz, hp);
  const cup = M(C.terra);
  add(new THREE.CylinderGeometry(.075, .075, .07, 20), cup, hx - .17, 2.02, hz, hp, [0, 0, P / 2]);
  add(new THREE.CylinderGeometry(.075, .075, .07, 20), cup, hx + .17, 2.02, hz, hp, [0, 0, P / 2]);

  // phone
  const ph = G('phone');
  add(B(.22, .05, .16), M(0xC9B79F), 1.0, 1.525, -3.1, ph);
  const phone = add(RB(.17, .32, .025, .012), M(C.ink, { roughness: .4 }), 1.0, 1.7, -3.14, ph, [-.25, 0, 0]);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.145, .29), M(0x8FA88A, { emissive: 0x8FA88A, emissiveIntensity: .35 })); scr.position.z = .0135; phone.add(scr);

  // lamp
  const lx = 1.55, lz = -3.65, lampM = M(C.ink, { roughness: .5 });
  add(new THREE.CylinderGeometry(.14, .15, .04, 24), lampM, lx, 1.52, lz);
  add(new THREE.CylinderGeometry(.018, .018, .72, 8), lampM, lx, 1.88, lz);
  add(new THREE.CylinderGeometry(.018, .018, .5, 8), lampM, lx - .2, 2.33, lz, null, [0, 0, 1.0]);
  add(new THREE.ConeGeometry(.17, .24, 24, 1, true), M(C.mustard, { side: THREE.DoubleSide }), lx - .44, 2.42, lz, null, [0, 0, .55]);
  const bulbM = M(0xFFF1D0, { emissive: 0xFFD08A, emissiveIntensity: .3 });
  add(new THREE.SphereGeometry(.05, 12, 10), bulbM, lx - .47, 2.36, lz, null, null, true);
  add(new THREE.CylinderGeometry(.065, .06, .14, 20), M(C.cream), .78, 1.57, -3.55);
  add(new THREE.TorusGeometry(.04, .012, 8, 16), M(C.cream), .85, 1.58, -3.55);
  add(new THREE.CylinderGeometry(.055, .055, .32, 16), M(0x7FA3A6), -.5, 1.66, -3.7);
  add(new THREE.CylinderGeometry(.04, .04, .06, 16), M(C.ink), -.5, 1.85, -3.7);
  [[-1.42, 2.4, 0xF2D57A, .1], [-1.16, 2.45, 0xEDB8A6, -.08], [-1.3, 2.16, 0xC4D8AE, .04]].forEach(s => plane(.2, .2, M(s[2]), s[0], s[1], -3.984, null, 0, s[3]));

  // chair
  const chair = new THREE.Group(); chair.position.set(.25, 0, -2.15); chair.rotation.y = -.35; scene.add(chair);
  const seatM = M(C.terra);
  add(RB(.62, .09, .6, .04), seatM, 0, .9, 0, chair);
  add(RB(.6, .62, .07, .035), seatM, 0, 1.36, .3, chair);
  add(B(.05, .4, .05), M(0x3A3330), 0, 1.05, .29, chair);
  add(new THREE.CylinderGeometry(.035, .035, .76, 10), M(0x3A3330), 0, .5, 0, chair);
  for (let i = 0; i < 5; i++) { const a = i * P * 2 / 5; add(B(.36, .04, .05), M(0x3A3330), Math.cos(a) * .18, .1, Math.sin(a) * .18, chair, [0, -a, 0]); add(new THREE.SphereGeometry(.035, 8, 6), M(C.ink), Math.cos(a) * .35, .04, Math.sin(a) * .35, chair); }

  // bookshelf
  const sh = G('shelf'), sx = -3.65, sz = -1.6;
  const shM = M(C.woodDD), boardM = M(0xA06F4B);
  add(B(.6, 3.4, .06), shM, sx, 1.7, sz - .82, sh); add(B(.6, 3.4, .06), shM, sx, 1.7, sz + .82, sh);
  add(B(.03, 3.4, 1.7), M(0x5A3926), -3.93, 1.7, sz, sh);
  [.05, .88, 1.7, 2.52, 3.37].forEach(y => add(B(.6, .06, 1.64), boardM, sx, y, sz, sh));
  const books = [];
  const placeRow = (list, base) => { let zc = sz - .74; list.forEach((b, i) => { const t = .085 + (i % 3) * .022, h = b[2]; zc += t / 2; const m = add(B(.42, h, t), M(b[1], { roughness: .7 }), sx + .04, base + h / 2, zc, sh); if (b[0]) { m.userData.book = b[0]; m.userData.bx = m.position.x; books.push(m); } if (b[3]) { m.rotation.x = b[3]; m.position.z += .05; } zc += t / 2 + .012; }); };
  placeRow(SKILLS.slice(5, 10), 2.55);
  placeRow(SKILLS.slice(0, 5).concat([[null, 0xE8DBC6, .55, .28]]), 1.73);
  placeRow([[null, 0xA9C1C9, .48], [null, 0xE8DBC6, .55], [null, 0xC97B5A, .44], [null, 0x9C8E7E, .5]], .91);
  add(new THREE.CylinderGeometry(.11, .05, .16, 16), M(C.mustard, { metalness: .3, roughness: .4 }), sx, 1.16, sz + .5, sh);
  add(B(.16, .06, .16), M(0x3A3330), sx, .94, sz + .5, sh);
  add(RB(.5, .62, .7, .03), M(0xB9C7A8), sx + .02, .39, sz - .4, sh);
  add(RB(.5, .52, .7, .03), M(0xE8DBC6), sx + .02, .34, sz + .4, sh);
  add(new THREE.CylinderGeometry(.12, .1, .2, 16), M(0xEFE6D8), sx, 3.5, sz + .45, sh);
  add(new THREE.SphereGeometry(.2, 16, 12), M(0x7E9B6A), sx, 3.7, sz + .45, sh).scale.set(1, .8, 1);
  add(new THREE.SphereGeometry(.1, 12, 10), M(0x94B087), sx + .05, 3.86, sz + .55, sh).scale.set(.7, 1.6, .7);
  add(B(.04, .38, .3), M(C.ink), sx - .1, 3.59, sz - .4, sh, [0, 0, -.06]);
  plane(.24, .3, M(0xffffff, { map: T.pol[0] }), sx - .075, 3.59, sz - .4, sh, P / 2);

  // bed
  const bed = G('bed');
  add(RB(3.0, .32, 2.05, .04), M(C.woodDD), -2.5, .3, 2.2, bed);
  [[-1.1, 1.3], [-1.1, 3.1], [-3.9, 1.3], [-3.9, 3.1]].forEach(p => add(B(.1, .16, .1), M(0x6E4630), p[0], .08, p[1], bed));
  add(RB(2.92, .3, 1.95, .08), M(0xF4ECDF), -2.5, .6, 2.2, bed);
  add(RB(2.0, .1, 2.0, .05), M(C.mustard), -1.98, .78, 2.2, bed);
  add(RB(.3, .12, 2.02, .05), M(0xF4ECDF), -3.0, .79, 2.2, bed);
  add(B(.1, .104, 2.01), M(C.terra), -1.4, .782, 2.2, bed);
  add(RB(.55, .2, .85, .1), M(C.cream), -3.48, .86, 1.75, bed, [0, 0, -.28]);
  add(RB(.55, .2, .85, .1), M(0xF1E6D6), -3.48, .86, 2.65, bed, [0, 0, -.28]);
  add(RB(.12, 1.6, 2.15, .04), M(0x9C6B47), -3.94, .95, 2.2, bed);
  add(RB(.3, .05, .22, .01), M(C.teal), -1.8, .855, 2.6, bed, [0, .3, 0]);

  // posters
  const po = G('posters');
  plane(.9, 1.25, M(0xffffff, { map: T.hack }), -3.985, 2.95, 1.55, po, P / 2, .04);
  add(B(.04, 1.14, .94), M(C.ink), -3.97, 2.8, 2.75, po, [-.03, 0, 0]);
  plane(.8, 1.0, M(0xffffff, { map: T.cert }), -3.948, 2.8, 2.75, po, P / 2, -.03);

  // polaroids
  const pol = G('polaroids');
  add(new THREE.CylinderGeometry(.006, .006, 2.0, 6), M(0x8A6E55), -2.45, 3.42, -3.97, pol, [0, 0, P / 2], true);
  [-3.15, -2.68, -2.22, -1.76].forEach((x, i) => { plane(.34, .4, M(0xffffff, { map: T.pol[i] }), x, 3.18 - (i % 2) * .04, -3.982, pol, 0, [-.08, .06, -.03, .1][i]); add(B(.04, .07, .02), M(C.mustard), x, 3.4, -3.975, pol, null, true); });

  // calendar, door, clock
  const cal = G('calendar');
  plane(.58, .74, M(0xffffff, { map: T.cal }), 2.3, 2.88, -3.984, cal);
  add(new THREE.SphereGeometry(.025, 8, 6), M(0x6B5F55), 2.3, 3.29, -3.98, cal);
  const doorM = M(0x9C6B47), panelM = M(0x8E5F3E);
  add(RB(1.1, 2.6, .08, .02), doorM, 3.3, 1.3, -3.96);
  add(B(.8, .85, .02), panelM, 3.3, .7, -3.91, null, null, true); add(B(.8, .85, .02), panelM, 3.3, 1.75, -3.91, null, null, true);
  add(new THREE.SphereGeometry(.045, 12, 10), M(0xCBA45E, { metalness: .6, roughness: .35 }), 2.9, 1.3, -3.89);
  plane(.36, .18, M(0xffffff, { map: T.plaque, metalness: .3, roughness: .45 }), 3.3, 2.38, -3.914);
  add(B(1.28, .08, .1), M(C.trim), 3.3, 2.64, -3.95); add(B(.08, 2.64, .1), M(C.trim), 2.71, 1.32, -3.95); add(B(.08, 2.64, .1), M(C.trim), 3.89, 1.32, -3.95);
  add(new THREE.CylinderGeometry(.3, .3, .05, 32), M(C.ink), -3.975, 3.25, .4, null, [0, 0, P / 2]);
  plane(.52, .52, new THREE.MeshStandardMaterial({ map: T.clock, transparent: true }), -3.945, 3.25, .4, null, P / 2);

  // corner plant
  add(new THREE.CylinderGeometry(.26, .2, .5, 20), M(0xC8693F), -3.45, .25, -3.45);
  add(new THREE.CylinderGeometry(.28, .28, .07, 20), M(0xB85C38), -3.45, .5, -3.45);
  const lr = rng(4);
  for (let i = 0; i < 8; i++) { const a = i / 8 * P * 2, l = add(new THREE.SphereGeometry(.16, 12, 10), M([0x6F8F66, 0x86A67B, 0x7E9B6A][i % 3]), -3.45 + Math.cos(a) * .18, 1.0 + lr() * .3, -3.45 + Math.sin(a) * .18); l.scale.set(.55, 2.4, .55); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); }

  // string lights
  const bulbs = M(0xFFE6B0, { emissive: 0xFFC873, emissiveIntensity: .2 });
  for (let i = 0; i < 22; i++) { const f = i / 21; add(new THREE.SphereGeometry(.035, 8, 6), bulbs, -3.85 + f * 7.6, 4.22 - .12 * Math.sin(P * ((i % 7) / 7)), -3.96, null, null, true); }
  for (let i = 0; i < 20; i++) { const f = i / 19; add(new THREE.SphereGeometry(.035, 8, 6), bulbs, -3.96, 4.22 - .12 * Math.sin(P * ((i % 7) / 7)), -3.7 + f * 7.4, null, null, true); }

  // light
  const hemi = new THREE.HemisphereLight(0xFFF6EA, 0xB59A7C, 1.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xFFF1DE, 2.1); key.position.set(6, 9, 5.5); key.target.position.set(-.5, 0, -1); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 }); key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 4;
  const lampL = new THREE.PointLight(0xFFB25A, 0, 7, 1.2); lampL.position.set(lx - .47, 2.25, lz + .1); scene.add(lampL);
  const monL = new THREE.PointLight(0x8EA6FF, 0, 5, 1.2); monL.position.set(.1, 2.2, -3.1); scene.add(monL);
  const fill = new THREE.PointLight(0xFFC98A, 0, 9, 1); fill.position.set(-1, 3.8, 0); scene.add(fill);
  const patchGeo = new THREE.PlaneGeometry(2.0, 2.6); const pp = patchGeo.attributes.position; for (let i = 0; i < pp.count; i++) pp.setX(i, pp.getX(i) + pp.getY(i) * -.35); patchGeo.rotateX(-P / 2);
  const patchM = new THREE.MeshBasicMaterial({ color: 0xFFD9A0, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false });
  const patch = new THREE.Mesh(patchGeo, patchM); patch.position.set(.9, .025, -.6); patch.raycast = () => {}; scene.add(patch);

  // picking
  const pickables = [];
  scene.traverse(o => { if (o.isMesh && o !== ground && o !== patch) pickables.push(o); });
  const groupMeshes = {};
  Object.entries(groups).forEach(([k, g]) => { g.userData.baseY = g.position.y; groupMeshes[k] = []; g.traverse(o => { if (o.isMesh) { o.userData.key = k; groupMeshes[k].push(o); if (o.material.emissive) o.material = o.material.clone(); o.material.userData.e0 = o.material.emissive ? [o.material.emissive.getHex(), o.material.emissiveIntensity] : null; } }); });

  const controls = new OrbitControls(camera, dom);
  Object.assign(controls, { enableDamping: true, dampingFactor: .08, enablePan: false, rotateSpeed: .55, zoomSpeed: .6, minPolarAngle: .55, maxPolarAngle: 1.36, minAzimuthAngle: .02, maxAzimuthAngle: 1.5 });

  let W = 1, H = 1, overDist = 14, off = { x: 0, y: 0 }, focused = false, locked = false, tw = null;
  const applyOff = (o) => { off = o; if (o.x || o.y) camera.setViewOffset(W, H, o.x, o.y, W, H); else camera.clearViewOffset(); camera.updateProjectionMatrix(); };
  const overviewPos = () => TARGET.clone().addScaledVector(DIR, overDist);
  const resize = () => {
    W = el.clientWidth || 1; H = el.clientHeight || 1;
    renderer.setSize(W, H, false); camera.aspect = W / H; applyOff(off);
    const a = W / H; overDist = 16.6 * Math.pow(Math.max(1, 1.45 / a), .55);
    controls.minDistance = overDist * .55; controls.maxDistance = overDist * 1.12;
  };
  resize();
  const ro = new ResizeObserver(() => { const wasOver = !focused && !tw; resize(); if (wasOver) { camera.position.copy(TARGET).addScaledVector(camera.position.clone().sub(controls.target).normalize(), Math.min(Math.max(camera.position.distanceTo(controls.target), controls.minDistance), controls.maxDistance)); } });
  ro.observe(el);
  controls.target.copy(TARGET);
  const startDir = DIR.clone().applyAxisAngle(V(0, 1, 0), .35);
  camera.position.copy(TARGET).addScaledVector(startDir, overDist * 1.35);
  camera.lookAt(TARGET);

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tweenTo = (pos, tgt, o, dur, done) => { tw = { t: 0, dur, p0: camera.position.clone(), p1: pos, t0: controls.target.clone(), t1: tgt, o0: { ...off }, o1: o, done }; controls.enabled = false; };
  tweenTo(overviewPos(), TARGET.clone(), { x: 0, y: 0 }, 2.0, () => { controls.enabled = true; });

  // hover
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let hoverKey = null, hoverBook = null, hoverBookMesh = null, needPick = false, pointerIn = false, down = null;
  const setMat = (k, on) => (groupMeshes[k] || []).forEach(m => { const e = m.material.userData.e0; if (!e) return; if (on) { m.material.emissive.setHex(0xFF9A4A); m.material.emissiveIntensity = .16; } else { m.material.emissive.setHex(e[0]); m.material.emissiveIntensity = e[1]; } });
  const setHover = (k, bookMesh) => {
    const b = bookMesh ? bookMesh.userData.book : null;
    if (k === hoverKey && b === hoverBook) return;
    if (hoverKey && hoverKey !== k) setMat(hoverKey, false);
    if (k && k !== hoverKey) setMat(k, true);
    hoverKey = k; hoverBook = b; hoverBookMesh = bookMesh || null;
    dom.style.cursor = k ? 'pointer' : 'grab';
    cb.onHover && cb.onHover(k, b);
  };
  const pick = () => { ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(pickables, false)[0]; if (!hit) return [null, null]; const o = hit.object; return [o.userData.key || null, o.userData.book ? o : null]; };
  const setPtr = (e) => { const r = dom.getBoundingClientRect(); ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1; };
  const onMove = (e) => { setPtr(e); pointerIn = e.pointerType === 'mouse'; needPick = true; };
  const onLeave = () => { pointerIn = false; setHover(null); };
  const onDown = (e) => { down = [e.clientX, e.clientY]; if (e.pointerType === 'mouse') dom.style.cursor = hoverKey ? 'pointer' : 'grabbing'; };
  const onUp = (e) => {
    if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null;
    if (moved > 6 || locked) { dom.style.cursor = hoverKey ? 'pointer' : 'grab'; return; }
    setPtr(e); const [k, bm] = pick();
    if (k) cb.onClick && cb.onClick(k, bm ? bm.userData.book : null);
  };
  dom.addEventListener('pointermove', onMove); dom.addEventListener('pointerleave', onLeave);
  dom.addEventListener('pointerdown', onDown); dom.addEventListener('pointerup', onUp);
  dom.style.cursor = 'grab';

  // dots
  const keys = Object.keys(ANCHOR), dots = keys.map(() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#D9734E;border:4px solid #FBF7F0;box-shadow:0 0 0 5px rgba(217,115,78,.25),0 3px 8px rgba(40,25,10,.3);'; dotsEl && dotsEl.appendChild(d); return d; });

  // night
  let nightT = 0, nightTarget = 0;
  const cA = new THREE.Color(), hs0 = new THREE.Color(0xFFF6EA), hs1 = new THREE.Color(0x6A74B8), hg0 = new THREE.Color(0xB59A7C), hg1 = new THREE.Color(0x2E2A44), k0 = new THREE.Color(0xFFF1DE), k1 = new THREE.Color(0x8F9CFF);
  const applyNight = (t) => {
    hemi.intensity = 1.5 - 1.08 * t; hemi.color.copy(hs0).lerp(hs1, t); hemi.groundColor.copy(hg0).lerp(hg1, t);
    key.intensity = 2.1 - 1.85 * t; key.color.copy(k0).lerp(k1, t);
    lampL.intensity = 5 * t; monL.intensity = 2.4 * t; fill.intensity = 1.4 * t;
    bulbM.emissiveIntensity = .3 + 3 * t; bulbs.emissiveIntensity = .2 + 2.6 * t;
    skyDMat.opacity = 1 - t; patchM.opacity = .2 * (1 - t);
    scene.background.copy(bgDay).lerp(bgNight, t);
  };
  applyNight(0);

  const v3 = new THREE.Vector3(), clock = new THREE.Clock();
  let raf = 0, alive = true;
  const project = (p) => { v3.copy(p).project(camera); return [(v3.x * .5 + .5) * W, (-v3.y * .5 + .5) * H, v3.z < 1]; };
  const loop = () => {
    if (!alive) return; raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05);
    if (tw) {
      tw.t += dt; const k = Math.min(1, tw.t / tw.dur), e = ease(k);
      camera.position.lerpVectors(tw.p0, tw.p1, e); controls.target.lerpVectors(tw.t0, tw.t1, e);
      applyOff({ x: tw.o0.x + (tw.o1.x - tw.o0.x) * e, y: tw.o0.y + (tw.o1.y - tw.o0.y) * e });
      camera.lookAt(controls.target);
      if (k >= 1) { const d = tw.done; tw = null; d && d(); }
    } else if (controls.enabled) controls.update();
    if (needPick && pointerIn && !locked && !tw) { needPick = false; const [k, bm] = pick(); setHover(k, bm); }
    Object.entries(groups).forEach(([k, g]) => { const ty = g.userData.baseY + (k === hoverKey && k !== 'shelf' ? .05 : 0); g.position.y += (ty - g.position.y) * Math.min(1, dt * 12); });
    books.forEach(b => { const tx = b.userData.bx + (b === hoverBookMesh ? .14 : 0); b.position.x += (tx - b.position.x) * Math.min(1, dt * 12); });
    if (nightT !== nightTarget) { nightT += Math.sign(nightTarget - nightT) * Math.min(Math.abs(nightTarget - nightT), dt * .8); applyNight(nightT); }
    if (labelEl && hoverKey) {
      let p = ANCHOR[hoverKey];
      if (hoverBookMesh) { hoverBookMesh.updateWorldMatrix(true, false); p = hoverBookMesh.getWorldPosition(new THREE.Vector3()); p.y += hoverBookMesh.geometry.parameters.height / 2 + .08; }
      else p = p.clone().add(V(0, groups[hoverKey].position.y, 0));
      const [x, y] = project(p); labelEl.style.left = x + 'px'; labelEl.style.top = y + 'px';
    }
    keys.forEach((k, i) => { const [x, y, vis] = project(ANCHOR[k].clone().add(V(0, -.18, 0))); dots[i].style.transform = `translate(${x}px, ${y}px)`; dots[i].style.display = vis ? 'block' : 'none'; });
    renderer.render(scene, camera);
  };
  loop();

  return {
    setNight(n, instant) { nightTarget = n ? 1 : 0; if (instant) { nightT = nightTarget; applyNight(nightT); } },
    focus(k, ox, oy) {
      const v = VIEW[k]; if (!v) return;
      locked = true; focused = true; setHover(null);
      const portrait = W / H < 1;
      const pos = v[0].clone().add(v[1].clone().sub(v[0]).multiplyScalar(portrait ? 2.2 : 1.45));
      tweenTo(pos, v[0].clone(), { x: ox || 0, y: oy || 0 }, 1.15);
    },
    overview() {
      if (!focused && !tw) return;
      locked = false; focused = false;
      tweenTo(overviewPos(), TARGET.clone(), { x: 0, y: 0 }, 1.1, () => { controls.enabled = true; });
    },
    dispose() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); dom.remove(); dots.forEach(d => d.remove()); },
  };
}
