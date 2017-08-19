# Example Form

For those readers who want to see a fully functional, real world, not-in-any-way-contrived example before diving into the rest of this guide,  the following has been provided.

In this example, we will build a U.S. address form that satisfies the following requirements:

* It must have fields for name, street address, city, state, and postal code.
* All fields are required.
* The name field must contain at least 6 characters.
* The postal code field must contain a valid U.S. zip code.
* All fields must display error copy that indicates why a field is invalid.
* Error messages should only be shown on invalid controls once a control has been touched \(focused then blurred\) or if the user tries to submit the form.

First, let's import Formation and add it to our module's dependencies:

```js
// app.js
import angular from 'angular';

import Formation from '@darkobits/formation';

export default angular.module('MyApp', [
  Formation
]);
```

Then, in our application's config files, we can tell Formation when to show error messages:

```js
// config.js
import {
  configure
} from '@darkobits/formation';

configure({
  showErrorsOn: 'touched, submitted'
});
```

Next, lets set up the template for our address form:

```html
<!-- addressForm.html -->
<fm name="vm.addressForm" controls="vm.controls" on-submit="vm.submit">
  <fm-input type="text" name="name">
    Name
  </fm-input>
  <fm-errors for="name"></fm-errors>

  <fm-input type="text" name="streetAddress">
    Address
  </fm-input>
  <fm-errors for="streetAddress"></fm-errors>

  <fm-input type="text" name="locality">
    City
  </fm-input>
  <fm-errors for="locality"></fm-errors>

  <fm-select name="state" options="s.value as s.label for s in vm.states">
    State
  </fm-select>
  <fm-errors for="state"></fm-errors>

  <fm-input type="text" name="postalCode">
    Postal Code
  </fm-input>
  <fm-errors for="postalCode"></fm-errors>
</fm>
```

And finally, the form's parent component:

```js
// addressForm.js
import app from 'app';

// Formation offers an optional "formation-validators" package,
// but you can use any boolean-returning function as a validator,
// just as you would with ngModelCtrl.
import {
  required,
  minLength,
  pattern
} from '@darkobits/formation-validators';

import templateUrl from './addressForm.html';

function AddressFormCtrl () {
  const vm = this;

  vm.controls = {
    // Each key here corresponds to the control name we used in the template.
    name: {
      // Make this control required, and ensure the user enters at least 6 characters:
      validators: {
        required,
        minLength: minLength(6)
      },
      // Error messages are defined as arrays of validation key/message pairs. They
      // use an array rather than an object because ngMessages relies on order to
      // determine which message to show when a control has more than 1 active error.
      errors: [
        ['required', 'This field is required.'],
        ['minLength', 'Please enter at least 6 characters.']
      ]
    },
    streetAddress: {
      validators: {
        required
      },
      errors: [
        ['required', 'This field is required.']
      ]
    },
    locality: {
      validators: {
        required
      },
      errors: [
        ['required', 'This field is required.']
      ]
    },
    state: {
      validators: {
        required
      },
      errors: [
        ['required', 'This field is required.']
      ]
    },
    postalCode: {
      validators: {
        required,
        // Require a valid U.S. postal code on this field:
        pattern: pattern(/(\d{5}([-]\d{4})?)/g)
      },
      errors: [
        ['required', 'This field is required.'],
        ['pattern', 'Please enter a valid U.S. postal code.']
      ]
    }
  };

  vm.states = [
    // State data.
  ];

  vm.submit = modelValues => {
    // Do something with modelValues here. The form is guaranteed to be
    // $valid, guaranteed to not be waiting for another submit to complete,
    // and guaranteed to not be waiting for any $asyncValidators to finish.
  };
});

app.component('addressForm', {
  controller: AddressFormCtrl,
  controllerAs: 'vm',
  templateUrl
});
```

_Wowza!_

We kept our template focused on structure, and our controller neatly describes exactly how each control in the form should behave. Notice there are no `ngModel` directives present, no bindings exposed to the template for error copy, and no verbose `ngIf` expressions to determine when to show/hide error messages.

