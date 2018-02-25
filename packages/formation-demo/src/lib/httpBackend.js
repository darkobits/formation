import app from 'app';
import R from 'ramda';

import {
  API_DELAY,
  API_ENDPOINT
} from 'etc/constants';


/**
 * Contains request objects to be matched against and canned responses to
 * return.
 *
 * @type {Map}
 */
const responses = new Map();


// ----- Emulated HTTP Delay ---------------------------------------------------

app.config($httpProvider => {
  $httpProvider.interceptors.push(($q, $timeout) => ({
    request (req) {
      if (new RegExp(API_ENDPOINT, 'g').test(req.url)) {
        return $timeout(() => req, API_DELAY);
      }

      return req;
    }
  }));
});


/**
 * Returns true if all key/value pairs in the first object are contained in the
 * second object.
 *
 * @param  {object} objA
 * @param  {object} objB
 * @return {boolean}
 */
function containsObj (a, b) {
  return Object.keys(a).reduce((r, k) => {
    return r && R.equals(a[k], b[k]);
  }, true);
}

// Helper to make responses easier to compose and read.
const buildResponse = options => [options.status, options.data, options.headers, options.statusText];


// ----- Emulated HTTP Backend -------------------------------------------------

app.run(($httpBackend, $log) => {
  // Request handler.
  const handleRequest = (method, url, data) => {
    const parsedData = JSON.parse(data);

    $log.log('[Api] Got data:', parsedData);

    // If request matches a key in the map, return the corresponding response.
    for (const [req, res] of responses.entries()) {
      if (url === req.url && method === req.method && containsObj(req.data, parsedData)) {
        return res;
      }
    }

    // Otherwise, return a 404.
    return buildResponse({
      status: 404,
      statusText: 'Not found.'
    });
  };


  // Set up handlers.
  $httpBackend.whenGET(/.*/g).respond(handleRequest);
  $httpBackend.whenPOST(/.*/g).respond(handleRequest);
});


/**
 * Adds the provided request matcher and response object to 'responses'.
 */
export function addResponse (req = {}, res = {}) {
  responses.set(Object.assign({
    url: API_ENDPOINT
  }, req), buildResponse(res));
}
