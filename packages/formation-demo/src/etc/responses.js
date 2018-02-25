import {
  addResponse
} from 'lib/httpBackend';


// ----- Responses -------------------------------------------------------------

addResponse({
  method: 'GET'
}, {
  status: 200,
  data: {
    name: 'Frodo Baggins'
  }
});

addResponse({
  method: 'POST',
  data: {
    email: 'frodo@shirewire.net'
  }
}, {
  status: 200,
  data: 'Everything looks good!'
});

addResponse({
  method: 'POST',
  data: {
    email: 'badEmail@shirewire.net'
  }
}, {
  status: 400,
  data: {
    fields: {
      email: 'This e-mail address is already in use.'
    }
  }
});

addResponse({
  method: 'POST',
  data: {
    email: 'unknown@shirewire.net'
  }
}, {
  status: 500,
  data: 'An unknown error has occurred.'
});
