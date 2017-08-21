# Example Form

For those readers who want to see a fully functional, real world, not-in-any-way-contrived example before diving into the rest of this guide,  the following has been provided.

In this example, we will be refactoring a component that renders a U.S. address form. The form has the following requirements:

* It must have fields for name, street address, city, state, and postal code.
* All fields are required.
* The name field must contain at least 6 characters.
* The postal code field must contain a valid U.S. zip code.
* All fields must display error copy that indicates why a field is invalid.
* Error messages should only be shown on invalid controls once a control has been touched \(focused then blurred\) or if the user tries to submit the form.

Here's the code for the existing form, written using vanilla Angular:

```html
<!-- addressForm.html -->
<form name="vm.addressForm"
  ng-submit="vm.submit"
  novalidate>
  
  <!-- Name -->
  <div>
    <input type="text"
      name="name"
      ng-model="vm.name"
      ng-minlength="6"
      required>
  </div>
  <div ng-messages="vm.addressForm.name.$error"
    ng-if="vm.addressForm.name.$invalid && (vm.addressForm.$submitted || vm.addressForm.name.$touched)">
    <span ng-message="required">
      This field is required.
    </span>
    <span ng-message="minlength">
      Please enter at least 6 characters.
    </span>
  </div>
  
  <!-- Street Address -->
  <div>
    <input type="text"
      name="streetAddress"
      ng-model="vm.streetAddress"
      required>
  </div>
  <div ng-messages="vm.addressForm.streetAddress.$error"
    ng-if="vm.addressForm.streetAddress.$invalid && (vm.addressForm.$submitted || vm.addressForm.streetAddress.$touched)">
    <span ng-message="required">
      This field is required.
    </span>
  </div>
  
  <!-- Locality (City) -->
  <div>
    <input type="text"
      name="locality"
      ng-model="vm.locality"
      required>
  </div>
  <div ng-messages="vm.addressForm.locality.$error"
      ng-if="vm.addressForm.locality.$invalid && (vm.addressForm.$submitted || vm.addressForm.locality.$touched)">
    <span ng-message="required">
      This field is required.
    </span>
  </div>
  
  <!-- State -->
  <div>
    <select name="state"
      ng-model="vm.state"
      ng-options="state.value as state.label for state in vm.states"
      required>
    </select>
  </div>
  <div ng-messages="vm.addressForm.state.$error"
    ng-if="vm.addressForm.state.$invalid && (vm.addressForm.$submitted || vm.addressForm.state.$touched)">
    <span ng-message="required">
      This field is required.
    </span>
  </div>
  
  <!-- Postal Code -->
  <div>
    <input type="text"
      name="postalCode"
      ng-model="vm.postalCode"
      ng-pattern="/(\d{5}([-]\d{4})?)/g"
      required>
  </div>
  <div ng-messages="vm.addressForm.postalCode.$error"
    ng-if="vm.addressForm.postalCode.$invalid && (vm.addressForm.$submitted || vm.addressForm.postalCode.$touched)">
    <span ng-message="required">
      This field is required.
    </span>
    <span ng-message="pattern">
      Please enter a valid U.S. postal code.
    </span>
  </div>
  
  <!-- Submit -->
  <div>
    <button type="submit">
      Submit
    </button>
  </div>
</form>
```

```js
// addressForm.js
import app from 'app';
import templateUrl from './addressForm.html';

function AddressFormCtrl ($http) {
  const vm = this;
  
  vm.states = [
    // State data.
  ];
  
  vm.submit = () => {
    if(vm.addressForm.$invalid) {
      return;
    }
    
    $http.post('/api/address', {
      name: vm.name,
      streetAddress: vm.streetAddress,
      locality: vm.locality,
      state: vm.state,
      postalCode: vm.postalCode
    });
  };
}

app.component('addressForm', {
  controller: AddressFormCtrl,
  controllerAs: 'vm',
  templateUrl
});
```

 Notice a few things about this component:

* There is a substantial amount of business logic is in the template, and much of it is very repetitious.
* The size of the template will grow as we add additional validation error messages to controls, even though the structure of the document has not fundamentally changed.
* There are two very separate models that developers must reason about:
  * The form controller, used to access a controls errors \(among other things\): `vm.addressForm.someControl`
  * The bindings where model values for each control are written: `vm.someControl`.

---

To see how Formation addresses these concerns, let's refactor the above component.

First, let's import Formation and add it to our module's dependencies:

```js
// app.js
import angular from 'angular';

import Formation from '@darkobits/formation';

export default angular.module('MyApp', [
  Formation
]);
```

Then, in our application's config files, we can tell Formation when to show error messages on controls:

```js
// config.js
import {
  configure
} from '@darkobits/formation';

configure({
  showErrorsOn: 'touched, submitted'
});
```

Next, lets update our template:

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

That's it! We've used just enough markup to describe how we want to structure the document. The rest of the logic to drive the form will reside in its controller:

```js
// addressForm.js
import app from 'app';

// Formation offers an optional "formation-validators" package with,
// several common validators, but you can use or write any
// boolean-returning function as a validator, just as you would
// with ngModelCtrl.
import {
  required,
  minLength,
  pattern
} from '@darkobits/formation-validators';

import templateUrl from './addressForm.html';

function AddressFormCtrl ($http) {
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
    // No need to check for $invalid here, because Formation will not invoke
    // a submit handler on invalid forms.
    
    // We return the promise for our asynchronous submit action so that
    // Formation can automatically disable the form until the API request
    // finishes.
    return $http.post('/api/address', modelValues);
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

