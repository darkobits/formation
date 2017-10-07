# Example Form

For those readers who want to see a fully functional, real world, not-in-any-way-contrived example before diving into the rest of this guide,  the following has been provided.

In this example, we will be refactoring a component that renders a U.S. address form. The form has the following requirements, which cannot be altered by the refactor:

* It must have fields for name, street address, city, state, and postal code.
* All fields are required.
* The name field must contain at least 6 characters.
* The postal code field must contain a valid U.S. zip code.
* All fields must display error copy that indicates why a field is invalid.
* Error messages should only be shown on invalid controls once a control has been touched \(focused then blurred\) or if the user tries to submit the form.

Here's the code for the existing form, written using vanilla Angular:

> `addressForm.html`

```html
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

  <!-- City -->
  <div>
    <input type="text"
      name="city"
      ng-model="vm.city"
      required>
  </div>
  <div ng-messages="vm.addressForm.city.$error"
      ng-if="vm.addressForm.city.$invalid && (vm.addressForm.$submitted || vm.addressForm.city.$touched)">
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

> `addressForm.js`

```js
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
      city: vm.city,
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

* There is a substantial amount of business logic is in the template, and much of it is repetitious. For example, every control requires a hefty `ngIf` expression to display validation errors if the control has been touched or if the form has been submitted -- typically a behavior that doesn't change from form to form in a large application.
* The size of the template will grow as we add additional validation error messages to controls, even though the structure of the document has not fundamentally changed. In large applications, this copy may be centralized in a constants file or even delivered from an API, but to expose these messages to the template would entail even more scope bindings.
* The form's data model \(constructed using `ngModel` directives\) is completely separate from the form controller's API, meaning developers must reason about two different    models that developers must reason about:
  * The form controller, used to access a controls errors \(among other things\): `vm.addressForm.name.$error`
  * The bindings where model values for each control are written: `vm.name`
* The form's submit handler is invoked even if the form is not valid, requiring that a check for validity be made before proceeding.
* There are a total of **22** references to `vm.addressForm` between the template and the controller, all of which must be updated if the name of the form is changed.

---

To see how Formation addresses these concerns, let's refactor the above component.

First, let's import Formation and add it to our module's dependencies:

> `app.js`

```js
import angular from 'angular';

import Formation from '@darkobits/formation';

export default angular.module('MyApp', [
  Formation
]);
```

Then, in our application's config files, we can tell Formation when to show error messages on controls:

> `config.js`

```js
import {
  configure
} from '@darkobits/formation';

configure({
  showErrorsOn: 'touched, submitted'
});
```

Next, lets update our template:

> `addressForm.html`

```html
<fm controls="vm.controls" on-submit="vm.submit">
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

  <fm-select name="state" options="state.value as state.label for state in vm.states">
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

> `addressForm.js`

```js
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

Let's look at how things have improved:

* Zero business logic in the template; it is focused only on the structure of the document.
* Template size will never increase if validators/error messages are added to controls.
* The form's data model is reflected by its controls, eliminating the need for `ngModel` and reducing scope bindings.
* The form's submit handler is only invoked if the form is valid, and because we returned a promise, Formation automatically disables the form while our API request is pending.
* There are **0** references to `vm.addressForm` in our refactored component.

<p align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/441546/29554975-f3d790fe-86d5-11e7-9e17-5fee853a49f7.png"
    width="42"
    height="42">
</p>



