# Submitting

By default, Angular will invoke a form's `ngSubmit` function immediately upon receiving the `submit` event, even if the form is invalid. This provides developers control, but often results in boilerplate in submit handlers.

Additionally, Angular does not wait for any pending `$asyncValidators` to finish before submitting the form. This means that if an async validator rejects after the form was submitted, you might wind up sending bad data to the server.

Provided the form is valid \(at least on the client side\) and an HTTP request has been initiated, you'll probably want to disable the form until the request finishes to prevent the user from modifying data while its being validated by the API.

If the API indicates that the request was not valid for some reason, Angular doesn't provide an easy mechanism to allow you to set control-specific errors based on API responses. For example, if we submitted a form and got a response with a status code of `400 (Bad Request)` and the following data:

```json
{
  "message": "Bad request.",
  "invalidFields": {
    "email": "This e-mail address is already in use."
  }
}
```

It would be non-trivial, from the context of our submit handler, to set that error on the `email` control in our form. Formation addresses this issue by creating a promise-based submission flow that allows developers to return errors back to the form to be applied to controls.

Formation addresses each of these issues using a promise-based submit process.

### Formation Submit Flow

When a Formation form is submitted, the following steps are taken:

1. Determine if another submit is already in progress. If so, bail.
2. Mark the form and all child forms as "submitting", disabling their controls and preventing additional submits.
3. Clear any `$custom` validation errors on controls.
4. Wait for any pending async validators to complete.
5. Check if the form is `$valid`. If not, skip to **\(7\)**.
6. Invoke the `onSubmit` handler for the form, passing it the model values from the form. If this function returns a promise, the following actions are performed:
   1. If the promise rejects, skip to **\(7\)**.
   2. If the promise resolves, assume the resolved value is an object consisting of control names and error messages \(typically from an API\). Each custom error message will be applied to controls using the `$custom` validation key. \(When using the [Errors](/components/errors.md) component, everything Just Works.\)
7. Remove the "submitting" flag and re-enable all controls.

Based on this, a submit handler might look something like the following:

```js
function FormCtrl ($http) {
  const vm = this; 

  vm.onSubmit = modelValues => {
    return $http.post('/api/someEndPoint', {
      data: modelValues
    })
    .then(response => {
      // All good! No need to return anything to Formation.
    })
    .catch(response => {
      // Something went wrong. Let's assume our API will send us field errors
      // in an "invalidFields" key in the response. Return them to Formation,
      // which will apply a "$custom" error validation key to each control using
      // the provided messages.
      return response.data.invalidFields;
    });
  }
}
```

Let's break down what's going on:

* We know the form is valid by the time our submit handler is invoked.
* We know that all async validators have finished \(and set their controls to `$valid`\).
* By `return`-ing the entire HTTP promise chain to Formation, it can automatically disable and re-enable controls for us.
* If we get an error back from the API, we can `catch` it and return a value to Formation, which it will interpret as a map of field names to custom error messages.

> **Note: **If you do not `return` your `$http` request to Formation, it will not be able to disable controls while the request is outstanding and re-enable them when it completes.



