import {get} from './get';

/**
 * `$httpBackend` accepts either a string or a regular expression. When passing
 * a string, the developer must provide the entire, exact URL that their code
 * will make the request with. Regular expressions are more flexible because the
 * entire URL need not be known, but constructing them can be tedious. This
 * method allows developers to build regular expressions that express URLs in
 * terms of route segments and query params, which can then be provided to
 * `$httpBackend`.
 *
 * @example
 *
 * import {
 *   module,
 *   get,
 *   matchUrl
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeSpec', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *
 *     // This will match requests like "/api/v1/foo/bar?baz=qux&bleep=bloop
 *     const url = matchUrl(['foo', 'bar'], {baz: 'qux'});
 *
 *     get('$httpBackend').when('GET', url).respond({
 *       // ...
 *     })
 *   });
 *
 *   it('should be awesome', () => {
 *     // ...
 *   });
 * });
 *
 * @param  {array} segments - List of URL segments you expect to see in the
 *   request, in order.
 * @param  {object} [params] - Query string params you expect to see
 *   in the request. May contain arrays and objects.
 * @return {RegExp} - Regular expression instance that can be passed to
 *   `$httpBackend.when()` for URL-matching.
 */
export function matchUrl (segments, params) {
  return new RegExp([
    '^',
    segments.join('.*'),
    get('$httpParamSerializer')(params).replace('&', '.*'),
    '$'
  ].join('.*'), 'g');
}
