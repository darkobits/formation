import {
  filter,
  identity,
  map
} from 'ramda';


/**
 * Accepts a comma/space-delimited list of strings and returns an array of
 * $-prefixed strings.
 *
 * @example
 *
 * "touched, submitted" => ['$touched', '$submitted']
 *
 * @private
 *
 * @param  {string} string
 * @return {array}
 */
export default function parseFlags (string) {
  if (!string || string === '') {
    return;
  }

  const states = map(state => {
    return state.length && `$${state.replace(/[, ]/g, '')}`;
  }, String(string).split(/, ?| /g));

  return filter(identity, states);
}
