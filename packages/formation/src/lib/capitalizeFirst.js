/**
 * Capitalizes the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export default function capitalizeFirst (str) {
  return str && String(str).substr(0, 1).toUpperCase() + String(str).substr(1);
}
