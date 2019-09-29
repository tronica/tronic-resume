const ALPHA = Array(26)
  .fill(0)
  .map((_, i) => String.fromCharCode(65 + i))
  .map((s) => s.toUpperCase());

/**
 * Converts a number to the input base
 *
 * @export
 * @param {any[]} base
 * @param {Number} num
 * @returns {String}
 */
export function toBase(base, num) {
  let res = '';
  while (num > 0)
  {
    let remainder = (num - 1) % 26;
    res = base[remainder] + res;
    num = (num - remainder - 1) / 26;
  }
  return res;
}

/**
 * Returns the sheet column from an index
 *
 * @export
 * @param {Number} idx
 * @returns {String}
 */
export function toSheetColumn(idx) {
  return toBase(ALPHA, idx + 1);
}