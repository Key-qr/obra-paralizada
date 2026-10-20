// Un punto que de verdad cae dentro de una zona (distrito, provincia o departamento).
// El promedio de los vértices del borde no sirve: en zonas alargadas o con un borde muy
// detallado (Putumayo, a lo largo del río) cae en la frontera o fuera del país.

function areaYCentro(anillo) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [x0, y0] = anillo[j], [x1, y1] = anillo[i];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  a /= 2;
  return a ? { a: Math.abs(a), c: [cx / (6 * a), cy / (6 * a)] } : { a: 0, c: anillo[0] };
}

export function dentro([x, y], anillo) {
  let d = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

// { c: [lon, lat] dentro de la zona, anillo: su polígono más grande, w, h: tamaño de su caja }
export function puntoInterior(geom) {
  if (!geom) return null;
  const polis = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let m = null;
  for (const p of polis) {
    const r = areaYCentro(p[0]);
    if (!m || r.a > m.a) m = { ...r, anillo: p[0] };
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of m.anillo) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  let c = m.c;
  if (!dentro(c, m.anillo)) {
    // Zonas en media luna: el punto de una grilla interior más cercano al centroide.
    let bd = Infinity;
    for (let i = 1; i < 20; i++) for (let j = 1; j < 20; j++) {
      const p = [x0 + ((x1 - x0) * i) / 20, y0 + ((y1 - y0) * j) / 20];
      if (!dentro(p, m.anillo)) continue;
      const d = (p[0] - m.c[0]) ** 2 + (p[1] - m.c[1]) ** 2;
      if (d < bd) { bd = d; c = p; }
    }
  }
  return { c, anillo: m.anillo, w: x1 - x0, h: y1 - y0 };
}

// Un punto cerca del centro, desplazado al azar, que no se sale de la zona. Si se da `marco`
// (el contorno del departamento que se dibuja), tampoco se sale de él: los mapas de distritos y
// de departamentos están simplificados por separado y en la costa sus bordes no calzan del todo.
export function puntoCerca(z, radio, azar, marco) {
  const ok = (p) => dentro(p, z.anillo) && (!marco || dentro(p, marco));
  let c = z.c;
  if (!ok(c)) {
    let bd = Infinity;
    const [cx, cy] = z.c, w = z.w || 0.2, h = z.h || 0.2;
    for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) {
      const p = [cx + (w * i) / 20, cy + (h * j) / 20];
      if (!ok(p)) continue;
      const d = i * i + j * j;
      if (d < bd) { bd = d; c = p; }
    }
  }
  for (let t = 0; t < 8; t++) {
    const ang = azar() * Math.PI * 2, r = Math.sqrt(azar()) * radio * (1 - t / 8);
    const p = [c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r];
    if (ok(p)) return p;
  }
  return c;
}
