// Arma web/data/obras_por_depto.json: una fila corta por obra, agrupadas por departamento,
// para las vistas de puntos (Simulador y Comparar). Corre después de `make export`:
//   node scripts/build_puntos.mjs
//
// Fila: [x, y, avance (-1 sin dato), causa 0-5, año de inicio - 2000 (0 sin dato),
//        falta ejecutar en millones (0 sin saldo), nombre, distrito, nivel L/R/N, CUI]
// x, y están en el mismo plano de 420 px de ancho que usan los mapas de puntos.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { puntoInterior, puntoCerca, dentro } from '../web/interior.js';

const require = createRequire(import.meta.url);
const topo = require('topojson-client');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const capa = (nivel) => {
  const t = leer(`web/data/geo/${nivel}.json`);
  return topo.feature(t, t.objects[Object.keys(t.objects)[0]]);
};

// proyección equirectangular con corrección por latitud, ajustada al ancho de 420
const deps = capa('departamentos');
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
const recorrer = (c, f) => (typeof c[0] === 'number' ? f(c) : c.forEach((k) => recorrer(k, f)));
deps.features.forEach((f) => recorrer(f.geometry.coordinates, ([x, y]) => {
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
}));
const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180), ANCHO = 420, sc = ANCHO / ((x1 - x0) * k);
const P = ([x, y]) => [(x - x0) * k * sc, (y1 - y) * sc];

// centro de cada zona: un punto que cae dentro de ella (ver web/interior.js), en el plano de 420 px
const C = {};
for (const nivel of ['distritos', 'provincias', 'departamentos']) {
  capa(nivel).features.forEach((f) => {
    const z = f.geometry && puntoInterior(f.geometry);
    if (z) C[f.properties.ubigeo] = { c: P(z.c), anillo: z.anillo.map(P), w: z.w * k * sc, h: z.h * sc };
  });
}

const o = leer('web/data/obras.json');
const obras = o.rows.map((r) => Object.fromEntries(o.cols.map((c, i) => [c, r[i]])));
const CAUSAS = ['Incumplimiento de contrato', 'Falta de recursos financieros y liquidez', 'Discrepancias, controversias y arbitraje', 'Deficiencia en el expediente técnico', 'Abandono de obra'];
const NIVEL = { Local: 'L', Regional: 'R', Nacional: 'N' };

// ruido fijo para separar obras del mismo distrito: el archivo sale igual en cada corrida
let semilla = 5;
const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
const corto = (n) => {
  n = String(n).replace(/\s+/g, ' ').trim();
  if (n === n.toUpperCase()) { n = n.toLowerCase(); n = n[0].toUpperCase() + n.slice(1); }
  return n.length > 70 ? `${n.slice(0, 68)}…` : n;
};
const titulo = (n) => String(n || '').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

const out = {};
let sinLugar = 0;
for (const x of obras.sort((a, b) => (b.saldo || 0) - (a.saldo || 0))) {
  const z = C[x.u_dist] || C[x.u_prov] || C[x.u_dep];
  if (!z) { sinLugar++; continue; }
  const j = C[x.u_dist] ? 3 : 10;
  const ci = CAUSAS.indexOf(x.causal);
  // un poco de ruido para separar obras del mismo lugar, sin salirse de su zona ni de su departamento
  const q = puntoCerca(z, j / 2, azar, C[x.u_dep]?.anillo);
  // al redondear al pixel un punto pegado a la costa puede caer al mar: se prueba el pixel vecino
  const marco = C[x.u_dep]?.anillo || z.anillo;
  const p = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    .map(([dx, dy]) => [Math.round(q[0]) + dx, Math.round(q[1]) + dy]).find((r) => dentro(r, marco)) || q.map(Math.round);
  (out[x.u_dep] = out[x.u_dep] || []).push([
    p[0], p[1],
    x.avance == null ? -1 : Math.round(x.avance),
    ci < 0 ? 5 : ci,
    x.ini ? x.ini - 2000 : 0,
    // 4 decimales en millones (S/ 100) y un mínimo para que los saldos pequeños no queden en cero
    x.saldo > 0 ? Math.max(0.0001, +(x.saldo / 1e6).toFixed(4)) : 0,
    corto(x.nombre), titulo(x.dist || x.prov || ''), NIVEL[x.nivel] || 'L',
    // CUI: con él se arman los enlaces al Seguimiento de Inversiones del MEF
    /^\d{5,}$/.test(String(x.cui || '')) ? String(x.cui) : '',
  ]);
}
writeFileSync(join(ROOT, 'web/data/obras_por_depto.json'), JSON.stringify(out));
const total = Object.values(out).reduce((s, l) => s + l.length, 0);
console.log(`obras_por_depto.json: ${total} obras en ${Object.keys(out).length} departamentos${sinLugar ? `, ${sinLugar} sin ubicación` : ''}`);
