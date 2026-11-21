import { surface, line } from './canvas.mjs';
import { evaluate, formatNumber, cartesian } from './operations.mjs';

const $ = (id) => document.getElementById(id);
const plot = $('plot'),
  deg = $('degree'),
  operation = $('op');
const names = {
  multiply: [
    'Multiplication',
    'Multiplying by w scales length by |w| and adds its angle to the angle of z. A factor of i produces a counterclockwise quarter turn.',
  ],
  divide: [
    'Division',
    'Dividing by w scales length by 1/|w| and subtracts its angle. The zero vector has no multiplicative inverse.',
  ],
  add: [
    'Addition',
    'Translate the vector w to the tip of z. The resultant ends at the opposite corner of the parallelogram.',
  ],
  subtract: [
    'Subtraction',
    'The result is the vector from the tip of w to the tip of z, drawn here from the origin.',
  ],
  conjugate: [
    'Conjugation',
    'The real coordinate stays fixed while the imaginary coordinate changes sign. The real axis is the line of reflection.',
  ],
  power: [
    'Integer powers',
    'An integer power multiplies the argument by n and raises the magnitude to n. Negative powers also take the reciprocal.',
  ],
  roots: [
    'Roots on a circle',
    'Nonzero roots have equal magnitude and are spaced by 360°/n. Raising any displayed root to n returns the input. Zero occurs with multiplicity n when the input is zero.',
  ],
};
const colors = { z: '#77d8d5', w: '#f7c674', result: '#c8a9ff', grid: '#44384e', axis: '#8d8399' };
const presets = {
  turn: ['multiply', 2, 1, 0, 1, 3],
  unity: ['roots', 1, 0, 0, 1, 5],
  mirror: ['conjugate', 2, 1.5, 0, 1, 3],
};
const isBinary = (op) => ['multiply', 'divide', 'add', 'subtract'].includes(op);
const argument = (p) =>
  Math.hypot(...p) === 0 ? '—' : formatNumber((Math.atan2(p[1], p[0]) * 180) / Math.PI);
let transform;

function gridStep(range) {
  const base = 10 ** Math.floor(Math.log10(range));
  const s = range / base;
  return (s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10) * base;
}
function draw(z, w, results, op) {
  const { ctx, width, height } = surface(plot);
  const left = 20,
    right = width - 20,
    top = 16,
    bottom = height - 16;
  const ox = (left + right) / 2,
    oy = (top + bottom) / 2;
  const points = [z, ...(isBinary(op) ? [w] : []), ...results];
  const limit = 1.24 * Math.max(1, ...points.flatMap((p) => p.map(Math.abs)));
  const scale = Math.min(right - left, bottom - top) / (2 * limit);
  transform = { ox, oy, scale };
  const step = gridStep(limit / 3),
    extentX = (right - left) / (2 * scale),
    extentY = (bottom - top) / (2 * scale);
  const sx = (x) => ox + x * scale,
    sy = (y) => oy - y * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  for (let k = -Math.floor(extentX / step); k <= Math.floor(extentX / step); k++)
    line(ctx, sx(k * step), top, sx(k * step), bottom, colors.grid);
  for (let k = -Math.floor(extentY / step); k <= Math.floor(extentY / step); k++)
    line(ctx, left, sy(k * step), right, sy(k * step), colors.grid);
  line(ctx, left, oy, right, oy, colors.axis);
  line(ctx, ox, top, ox, bottom, colors.axis);
  if (scale > 3) {
    ctx.beginPath();
    ctx.setLineDash([3, 6]);
    ctx.arc(ox, oy, scale, 0, 2 * Math.PI);
    ctx.strokeStyle = '#786781';
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#c3b6cb';
  ctx.textAlign = 'center';
  for (let k = -Math.floor(extentX / step); k <= Math.floor(extentX / step); k++) {
    if (k && sx(k * step) < right - 12 && sx(k * step) > left + 10)
      ctx.fillText(formatNumber(k * step), sx(k * step), oy + 16);
  }
  ctx.textAlign = 'right';
  for (let k = -Math.floor(extentY / step); k <= Math.floor(extentY / step); k++) {
    if (k && sy(k * step) > top + 11 && sy(k * step) < bottom - 7)
      ctx.fillText(formatNumber(k * step), ox - 8, sy(k * step) + 4);
  }
  if (op === 'roots' && results.length > 1) {
    ctx.beginPath();
    results.forEach(([a, b], i) => (i ? ctx.lineTo(sx(a), sy(b)) : ctx.moveTo(sx(a), sy(b))));
    ctx.closePath();
    ctx.fillStyle = '#c6a0ff22';
    ctx.fill();
    ctx.strokeStyle = colors.result;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  if (op === 'add' && results.length) {
    ctx.setLineDash([4, 5]);
    line(ctx, sx(z[0]), sy(z[1]), sx(results[0][0]), sy(results[0][1]), colors.w);
    line(ctx, sx(w[0]), sy(w[1]), sx(results[0][0]), sy(results[0][1]), colors.z);
    ctx.setLineDash([]);
  }
  if (op === 'conjugate') {
    ctx.setLineDash([4, 5]);
    line(ctx, sx(z[0]), sy(z[1]), sx(z[0]), sy(-z[1]), '#9b89ac');
    ctx.setLineDash([]);
  }
  if ((op === 'multiply' || op === 'divide') && results.length) {
    const turn = (op === 'divide' ? -1 : 1) * Math.atan2(w[1], w[0]),
      start = Math.atan2(z[1], z[0]);
    const radius = Math.min(
      45,
      scale * Math.hypot(...z) * 0.45,
      scale * Math.hypot(...results[0]) * 0.45,
    );
    if (radius > 13 && Math.abs(turn) > 0.07) {
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -start, -(start + turn), turn > 0);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#e5cfaa';
      ctx.stroke();
      const mid = start + turn / 2;
      ctx.fillStyle = '#f7dba1';
      ctx.textAlign = 'center';
      ctx.fillText(
        (turn > 0 ? '+' : '') + formatNumber((turn * 180) / Math.PI) + '°',
        ox + (radius + 17) * Math.cos(mid),
        oy - (radius + 17) * Math.sin(mid) + 4,
      );
    }
  }
  function arrow(p, color, dashed = false) {
    const px = sx(p[0]),
      py = sy(p[1]),
      angle = Math.atan2(py - oy, px - ox);
    if (dashed) ctx.setLineDash([5, 4]);
    line(ctx, ox, oy, px, py, color, 2);
    ctx.setLineDash([]);
    if (Math.hypot(px - ox, py - oy) < 10) return;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 10 * Math.cos(angle - 0.39), py - 10 * Math.sin(angle - 0.39));
    ctx.lineTo(px - 10 * Math.cos(angle + 0.39), py - 10 * Math.sin(angle + 0.39));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  arrow(z, colors.z);
  if (isBinary(op)) arrow(w, colors.w, true);
  results.forEach((p, i) => {
    if (op !== 'roots' || i === 0) arrow(p, colors.result);
    ctx.beginPath();
    ctx.arc(sx(p[0]), sy(p[1]), 4, 0, 2 * Math.PI);
    ctx.fillStyle = colors.result;
    ctx.fill();
  });
  ctx.restore();
  ctx.fillStyle = '#f2eaf7';
  ctx.textAlign = 'right';
  ctx.fillText('Re', width - 3, oy - 7);
  ctx.textAlign = 'left';
  ctx.fillText('Im', ox + 6, 12);
}
function coords(a, b) {
  const values = [$(a).valueAsNumber, $(b).valueAsNumber];
  if (values.some((v) => !Number.isFinite(v) || Math.abs(v) > 12))
    throw new Error('Enter both coordinates between −12 and 12.');
  return values;
}
function render() {
  const op = operation.value,
    binary = isBinary(op),
    indexed = op === 'power' || op === 'roots';
  $('w-group').hidden = !binary;
  $('legend-w').hidden = !binary;
  $('degree-group').hidden = !indexed;
  $('degree-label').textContent = op === 'power' ? 'Integer exponent n' : 'Root degree n';
  deg.min = op === 'power' ? -12 : 1;
  $('interpret-title').textContent = names[op][0];
  $('interpret').textContent = names[op][1];
  $('result-title').textContent = op === 'roots' ? 'First root · k = 0' : 'Result';
  $('rows').replaceChildren();
  $('notice').hidden = true;
  try {
    const z = coords('zr', 'zi'),
      w = binary ? coords('wr', 'wi') : [0, 0];
    const results = evaluate(op, z, w, deg.valueAsNumber);
    if (results.some((p) => p.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e100)))
      throw new Error(
        'The result exceeds the plot range of 10¹⁰⁰. Try a smaller exponent or a larger divisor.',
      );
    draw(z, w, results, op);
    $('result').textContent = cartesian(results[0]);
    $('magnitude').textContent = formatNumber(Math.hypot(...results[0]));
    const angle = argument(results[0]);
    $('angle').textContent = angle === '—' ? angle : angle + '°';
    results.forEach((p, k) => {
      const row = document.createElement('tr');
      for (const value of [
        op === 'roots' ? 'k = ' + k : 'result',
        formatNumber(p[0]),
        formatNumber(p[1]),
        formatNumber(Math.hypot(...p)),
        argument(p),
      ]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      $('rows').append(row);
    });
  } catch (error) {
    for (const id of ['result', 'magnitude', 'angle']) $(id).textContent = '—';
    $('notice').textContent = error.message;
    $('notice').hidden = false;
    surface(plot);
    transform = undefined;
  }
}
operation.addEventListener('change', render);
for (const id of ['zr', 'zi', 'wr', 'wi', 'degree']) $(id).addEventListener('input', render);
document.querySelectorAll('[data-case]').forEach((button) =>
  button.addEventListener('click', () => {
    const values = presets[button.dataset.case];
    ['op', 'zr', 'zi', 'wr', 'wi', 'degree'].forEach((id, i) => {
      $(id).value = values[i];
    });
    render();
  }),
);
plot.addEventListener('click', (event) => {
  if (!transform) return;
  const bounds = plot.getBoundingClientRect(),
    { ox, oy, scale } = transform;
  const re = (event.clientX - bounds.left - ox) / scale,
    im = (oy - event.clientY + bounds.top) / scale;
  if (Math.abs(re) > 12 || Math.abs(im) > 12) return;
  $('zr').value = re.toFixed(2);
  $('zi').value = im.toFixed(2);
  render();
});
new ResizeObserver(render).observe(plot);
render();
