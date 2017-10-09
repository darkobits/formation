/**
 * Lowercases the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export default function lowercaseFirst (str) {
  return str && String(str).substr(0, 1).toLowerCase() + String(str).substr(1);
}
