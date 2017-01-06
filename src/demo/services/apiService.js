import app from 'app';
import R from 'ramda';


app.service('Api', function (API_DELAY, $http, $timeout) {

  function req (options) {
    return $timeout(() => {}, API_DELAY || 0).then(() => $http(options));
  }

  return {
    req
  };
});


app.run($httpBackend => {
  const responses = new Map();

  // Helper to make responses easier to compose and read.
  const buildResponse = options => [options.status, options.data, options.headers, options.statusText];

  // Request handler.
  const handleRequest = (method, url, data) => {
    data = JSON.parse(data);
    console.log('[Api] Got data:', data);

    // If request matches a key in the map, return the corresponding response.
    for (const [req, res] of responses.entries()) {
      if (R.equals({method, url, data}, req)) {
        return res;
      }
    }

    // Otherwise, return a 404.
    return buildResponse({
      status: 404,
      statusText: 'Not found.'
    });
  };


  /* ----- Responses -------------------------------------------------------- */

  responses.set({
    method: 'POST',
    url: '/api',
    data: {
      email: 'foo@bar.com',
      emailMatch: 'foo@bar.com'
    }
  }, buildResponse({
    status: 200
  }));


  responses.set({
    method: 'POST',
    url: '/api',
    data: {
      email: 'badEmail@host.com',
      emailMatch: 'badEmail@host.com',
      message: 'meh',
      foo: true
    }
  }, buildResponse({
    status: 400,
    data: {
      fields: {
        email: 'This e-mail address is already in use.'
      }
    }
  }));


  // Set up handlers.
  $httpBackend.whenGET(/.*/g).respond(handleRequest);
  $httpBackend.whenPOST(/.*/g).respond(handleRequest);
});
