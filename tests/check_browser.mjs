import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate } from '../docs/operations.mjs';

const cases = JSON.parse(readFileSync(process.argv[2], 'utf8'));
assert.equal(cases.length, 35);
let count = 0;
for (const { op, z, w, n, results } of cases) {
  const browser = evaluate(op, z, w, n);
  assert.equal(browser.length, results.length);
  for (let k = 0; k < browser.length; k++) {
    for (let i = 0; i < 2; i++) {
      assert.ok(
        Math.abs(browser[k][i] - results[k][i]) < 2e-12 * (1 + Math.abs(results[k][i])),
        op + ' case ' + z,
      );
    }
    count++;
  }
}
assert.throws(() => evaluate('divide', [1, 1], [0, 0], 1), RangeError);
assert.throws(() => evaluate('power', [0, 0], [1, 0], -1), RangeError);
assert.throws(() => evaluate('roots', [1, 0], [1, 0], 0), RangeError);
assert.deepEqual(evaluate('power', [0, 1], [0, 0], -1), [[0, -1]]);
console.log(
  cases.length + ' native cases, ' + count + ' complex results matched in the browser arithmetic.',
);
