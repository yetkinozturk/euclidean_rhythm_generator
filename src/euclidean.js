/**
 * Bjorklund's algorithm for generating Euclidean rhythms.
 * Attempt to distribute `pulses` hits as evenly as possible over `steps`.
 *
 * @param {number} pulses - Number of active beats
 * @param {number} steps  - Total number of steps
 * @returns {number[]}    - Array of 1s (hit) and 0s (rest)
 */
export function euclidean(pulses, steps) {
  if (steps === 0) return [];
  if (pulses >= steps) return new Array(steps).fill(1);
  if (pulses === 0) return new Array(steps).fill(0);

  let pattern = [];
  let counts = [];
  let remainders = [];
  let divisor = steps - pulses;
  remainders.push(pulses);
  let level = 0;

  while (true) {
    counts.push(Math.floor(divisor / remainders[level]));
    remainders.push(divisor % remainders[level]);
    divisor = remainders[level];
    level++;
    if (remainders[level] <= 1) break;
  }
  counts.push(divisor);

  function build(lv) {
    if (lv === -1) {
      pattern.push(0);
      return;
    }
    if (lv === -2) {
      pattern.push(1);
      return;
    }
    for (let i = 0; i < counts[lv]; i++) build(lv - 1);
    if (remainders[lv] !== 0) build(lv - 2);
  }
  build(level);

  // Rotate so first element is a pulse
  const firstOne = pattern.indexOf(1);
  if (firstOne > 0) {
    pattern = [...pattern.slice(firstOne), ...pattern.slice(0, firstOne)];
  }
  return pattern;
}

/**
 * Apply rotation to a pattern
 */
export function rotatePattern(pattern, rotation) {
  if (!pattern.length || rotation === 0) return pattern;
  const r = ((rotation % pattern.length) + pattern.length) % pattern.length;
  return [...pattern.slice(r), ...pattern.slice(0, r)];
}
