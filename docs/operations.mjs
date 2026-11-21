const product = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];

function quotient([a, b], [c, d]) {
  if (c === 0 && d === 0) throw new RangeError('Division by zero is undefined.');
  // Scale by the larger denominator component before forming the quotient.
  if (Math.abs(c) >= Math.abs(d)) {
    const ratio = d / c,
      scale = 1 + ratio * ratio;
    return [(a / c + (b / c) * ratio) / scale, (b / c - (a / c) * ratio) / scale];
  }
  const ratio = c / d,
    scale = 1 + ratio * ratio;
  return [((a / d) * ratio + b / d) / scale, ((b / d) * ratio - a / d) / scale];
}

export function evaluate(op, z, w, degree) {
  switch (op) {
    case 'multiply':
      return [product(z, w)];
    case 'divide':
      return [quotient(z, w)];
    case 'add':
      return [[z[0] + w[0], z[1] + w[1]]];
    case 'subtract':
      return [[z[0] - w[0], z[1] - w[1]]];
    case 'conjugate':
      return [[z[0], -z[1]]];
    case 'power': {
      if (!Number.isInteger(degree) || Math.abs(degree) > 12)
        throw new RangeError('Use an integer exponent from −12 to 12.');
      let result = [1, 0],
        base = degree < 0 ? quotient([1, 0], z) : z;
      let n = Math.abs(degree);
      while (n > 0) {
        if (n % 2) result = product(result, base);
        n = Math.floor(n / 2);
        if (n) base = product(base, base);
      }
      return [result];
    }
    case 'roots': {
      if (!Number.isInteger(degree) || degree < 1 || degree > 12)
        throw new RangeError('Choose a root degree from 1 to 12.');
      const radius = Math.hypot(...z) ** (1 / degree),
        phase = Math.atan2(z[1], z[0]);
      return Array.from({ length: degree }, (_, k) => {
        const angle = (phase + 2 * Math.PI * k) / degree;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
      });
    }
    default:
      throw new RangeError('Unknown operation.');
  }
}

export function formatNumber(value) {
  if (value === 0) return '0';
  if (Math.abs(value) < 1e-3 || Math.abs(value) >= 1e5) return value.toExponential(2);
  return String(Number(value.toFixed(4)));
}
export function cartesian([a, b]) {
  const scale = Math.max(Math.abs(a), Math.abs(b));
  const re = Math.abs(a) < 8 * Number.EPSILON * scale ? 0 : a;
  const im = Math.abs(b) < 8 * Number.EPSILON * scale ? 0 : b;
  if (!im) return formatNumber(re);
  const coeff = Math.abs(im) === 1 ? '' : formatNumber(Math.abs(im));
  if (!re) return (im < 0 ? '−' : '') + coeff + 'i';
  return formatNumber(re) + (im < 0 ? ' − ' : ' + ') + coeff + 'i';
}
