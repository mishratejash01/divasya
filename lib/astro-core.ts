// ============================================================================
//  DIVASYA — astronomical core
//  Low-precision planetary theory (Meeus / JPL approximations), pure TS.
//  Accuracy: Sun ~0.01°, Moon ~0.05°, planets <1° — ample for panchang &
//  rashi/nakshatra work. Everything is COMPUTED live; nothing is hardcoded.
// ============================================================================

const RAD = Math.PI / 180;

export const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Julian Day from a JS Date (UTC-based). */
export function julianDay(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

/** Julian centuries since J2000.0 */
export const jCentury = (jd: number) => (jd - 2451545.0) / 36525;

/** Apparent tropical longitude of the Sun (degrees). Meeus ch. 25. */
export function sunLongitude(jd: number): number {
  const T = jCentury(jd);
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * RAD;
  return norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(omega));
}

/** Tropical longitude of the Moon (degrees). Meeus ch. 47 (truncated). */
export function moonLongitude(jd: number): number {
  const T = jCentury(jd);
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841);
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * RAD;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * RAD;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * RAD;
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T * T) * RAD;
  const dL =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * Math.sin(2 * D - M) -
    0.040923 * Math.sin(M - Mp) -
    0.03472 * Math.sin(D) -
    0.030383 * Math.sin(M + Mp) +
    0.015327 * Math.sin(2 * D - 2 * F) -
    0.012528 * Math.sin(Mp + 2 * F) +
    0.01098 * Math.sin(Mp - 2 * F) +
    0.010675 * Math.sin(4 * D - Mp) +
    0.010034 * Math.sin(3 * Mp) +
    0.008548 * Math.sin(4 * D - 2 * Mp) -
    0.007888 * Math.sin(2 * D + M - Mp) -
    0.006766 * Math.sin(2 * D + M) -
    0.005163 * Math.sin(D - Mp) +
    0.004987 * Math.sin(D + M) +
    0.004036 * Math.sin(2 * D - M + Mp) +
    0.003994 * Math.sin(2 * D + 2 * Mp) +
    0.003861 * Math.sin(4 * D) +
    0.003665 * Math.sin(2 * D - 3 * Mp);
  return norm360(Lp + dL);
}

/** Lahiri (Chitrapaksha) ayanamsa, degrees. Linear approximation around J2000. */
export function ayanamsa(jd: number): number {
  const y = 2000 + (jd - 2451545.0) / 365.25;
  return 23.85236 + 0.0139651 * (y - 2000);
}

/** Sidereal (nirayana) longitude from tropical. */
export const sidereal = (tropical: number, jd: number) => norm360(tropical - ayanamsa(jd));

// ---------------------------------------------------------------------------
//  Sunrise / sunset — NOAA solar equations.
// ---------------------------------------------------------------------------
export function sunriseSunset(
  date: Date,
  lat: number,
  lon: number
): { sunrise: Date | null; sunset: Date | null; solarNoon: Date | null } {
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  const jd = julianDay(noon);
  const T = jCentury(jd);
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = (357.52911 + 35999.05029 * T) * RAD;
  const C =
    (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * RAD;
  const lambda = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega)) * RAD;
  const eps = (23.439291 - 0.0130042 * T) * RAD;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const y = Math.tan(eps / 2) ** 2;
  const e = 0.016708634 - 0.000042037 * T;
  const L0r = L0 * RAD;
  const Etime =
    (4 / RAD) *
    (y * Math.sin(2 * L0r) -
      2 * e * Math.sin(M) +
      4 * e * y * Math.sin(M) * Math.cos(2 * L0r) -
      0.5 * y * y * Math.sin(4 * L0r) -
      1.25 * e * e * Math.sin(2 * M)); // minutes
  const h0 = -0.833 * RAD;
  const cosH =
    (Math.sin(h0) - Math.sin(lat * RAD) * Math.sin(dec)) / (Math.cos(lat * RAD) * Math.cos(dec));
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const tzOffsetMin = -date.getTimezoneOffset();
  const solarNoonMin = 720 - 4 * lon - Etime + tzOffsetMin;
  const solarNoon = new Date(base.getTime() + solarNoonMin * 60000);
  if (cosH < -1 || cosH > 1) return { sunrise: null, sunset: null, solarNoon };
  const H = Math.acos(cosH) / RAD;
  return {
    sunrise: new Date(base.getTime() + (solarNoonMin - 4 * H) * 60000),
    sunset: new Date(base.getTime() + (solarNoonMin + 4 * H) * 60000),
    solarNoon,
  };
}

// ---------------------------------------------------------------------------
//  Planetary longitudes — JPL approximate Keplerian elements (1800–2050).
//  Geocentric tropical ecliptic longitudes, good to <1°.
// ---------------------------------------------------------------------------
type El = [number, number, number, number, number, number];
const ELEMENTS: Record<string, { e0: El; rate: El }> = {
  Mercury: {
    e0: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  Venus: {
    e0: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
    rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
  },
  Earth: {
    e0: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0],
  },
  Mars: {
    e0: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  Jupiter: {
    e0: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  Saturn: {
    e0: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
};

function helioXYZ(name: keyof typeof ELEMENTS, T: number): [number, number, number] {
  const { e0, rate } = ELEMENTS[name];
  const a = e0[0] + rate[0] * T;
  const e = e0[1] + rate[1] * T;
  const I = (e0[2] + rate[2] * T) * RAD;
  const L = e0[3] + rate[3] * T;
  const wbar = e0[4] + rate[4] * T;
  const O = e0[5] + rate[5] * T;
  const M = norm360(L - wbar) * RAD;
  const w = (wbar - O) * RAD;
  const Or = O * RAD;
  let E = M;
  for (let i = 0; i < 10; i++) E = M + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const xh = r * (Math.cos(Or) * Math.cos(v + w) - Math.sin(Or) * Math.sin(v + w) * Math.cos(I));
  const yh = r * (Math.sin(Or) * Math.cos(v + w) + Math.cos(Or) * Math.sin(v + w) * Math.cos(I));
  const zh = r * Math.sin(v + w) * Math.sin(I);
  return [xh, yh, zh];
}

export type PlanetName =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

/** Geocentric TROPICAL ecliptic longitudes for the nine grahas. */
export function planetLongitudes(jd: number): Record<PlanetName, number> {
  const T = jCentury(jd);
  const [ex, ey] = helioXYZ("Earth", T);
  const geo = (p: keyof typeof ELEMENTS) => {
    const [x, y] = helioXYZ(p, T);
    return norm360(Math.atan2(y - ey, x - ex) / RAD);
  };
  const rahu = norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
  return {
    Sun: sunLongitude(jd),
    Moon: moonLongitude(jd),
    Mercury: geo("Mercury"),
    Venus: geo("Venus"),
    Mars: geo("Mars"),
    Jupiter: geo("Jupiter"),
    Saturn: geo("Saturn"),
    Rahu: rahu,
    Ketu: norm360(rahu + 180),
  };
}

/** Sidereal ascendant (lagna), degrees — needs birth time + coordinates. */
export function ascendant(jd: number, lat: number, lon: number): number {
  const T = jCentury(jd);
  const gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const ramc = norm360(gmst + lon) * RAD;
  const eps = (23.439291 - 0.0130042 * T) * RAD;
  const phi = lat * RAD;
  const lambda = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return sidereal(norm360(lambda / RAD), jd);
}
