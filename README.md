[![][travis-img]][travis-url] [![][npm-img]][npm-url] [![][codacy-img]][codacy-url] [![][xo-img]][xo-url]

# formation

Formation is a form framework for Angular 1.5+ designed for medium-to-large applications that require consistent, robust forms. It aims to reduce template size by moving business logic to controllers, which also encourages code-reuse and improves consistency.

## Feature Overview

- Controls are configured using Plain Old JavaScript Objects rather than directives. Configuration definitions can be shared across an application or abstracted into custom components. (See: [Control Configuration](/packages/formation/src/classes/FormationControl#control-configuration))
- Model values are managed by the form and passed to the form's submit handler, completely eliminating the need to bind model values to a scope. (See: [Working With Model Values](/packages/formation/src/components/Form#working-with-model-values))
- A form's submit handler will only be called when it should be, eliminating the need for repititious boilerplate in submit handlers. (See: [Submitting](/packages/formation/src/components/Form#submitting))
- Using `ngMessages` for validation has been greatly simplified; error messages are defined in code, reducing template bloat, eliminating the need to bind error messages to a scope, and making it easier to share common messages across an application.
- Easily assign custom error messages on form controls at runtime (from your API, for example). (See: [Errors](/packages/formation/src/components/Errors))
- Configuring when to display validation errors can be done application-wide or for each form, and is as simple as providing a list of states (ex: `touched`, `submitted`) to match against. (See: [showErrorsOn](/packages/formation/src/services/Formation#showerrorsonflags))
- Reset all controls to a pristine, untouched state and optionally reset their model values to an initial state. (See: [reset](/packages/formation/src/components/Form#resetmodelvalues-object--void))
- Accessibility: Formation uses [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) attributes where applicable, and assigns matching `id` and `for` attributes to controls and labels, ensuring they are correctly associated with each other. Formation is also [`ngAria`](https://docs.angularjs.org/api/ngAria)-friendly.

## Setup

```bash
$ npm install @darkobits/formation
```

```js
import Formation, {
  configure as configureFormation
} from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);

// Configure global error behavior.
configureFormation({
  showErrorsOn: 'touched, submitted'
});
```

## Example

Here's the template strucutre you might use to construct an address form using Formation:

```html
<div ng-app="MyApp" ng-controller="MyCtrl">
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

    <button type="submit">
      Submit
    </button>
  </fm>
</div>
```

Everything else is configured via the form's parent controller:

```js

import {
  required,
  minLength,
  pattern
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    // Each key here corresponds to the control name we used in the template.
    name: {
      // Make this control required, and ensure the user enters at least 6 characters:
      validators: {
        required,
        minLength: minLength(6)
      },
      // Error messages are defined as arrays of validation key/message tuples:
      errors: [
        ['required', 'This field is required.'],
        ['minLength', 'Please enter at least 6 characters.']
      ]
    },
    streetAddress: {
      validators: {required},
      errors: [
        ['required', 'This field is required.']
      ]
    },
    locality: {
      validators: {required},
      errors: [
        ['required', 'This field is required.']
      ]
    },
    state: {
      validators: {required},
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

  vm.states = [/* State data. */];

  vm.submit = modelValues => {
    // Do something with modelValues here.
  };
});
```

_Wowza!_ We kept our template focused on structure, and our controller neatly describes exactly how each control in the form should behave. Check out the documentation on [Control Configuration](/packages/formation/src/classes/FormationControl#control-configuration) for a detailed breakdown, or head over to [darkobits.github.io/formation](https://darkobits.github.io/formation/) to see a live demo.

## Documentation

Feel free to explore the [source](/packages/formation) -- most of the core components are documented with inline READMEs:

- [Configuration & Registering Components](/packages/formation/src/etc/config)
- Components:
  - [Form](/packages/formation/src/components/Form)
  - [FormGroup](/packages/formation/src/components/FormGroup)
  - [Input](/packages/formation/src/components/Input)
  - [Select](/packages/formation/src/components/Select)
  - [Textarea](/packages/formation/src/components/Textarea)
  - [Errors](/packages/formation/src/components/Errors)
- Classes:
  - [FormationControl](/packages/formation/src/classes/FormationControl)
  - [ConfigurableValidator](/packages/formation/src/classes/ConfigurableValidator)

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/formation.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/formation

[codacy-img]: https://img.shields.io/codacy/coverage/e3fb8e46d6a241f5a952cf3fe6a49d06.svg?style=flat-square
[codacy-url]: https://www.codacy.com/app/darkobits/formation

[minified-img]: http://img.badgesize.io/https://unpkg.com/@darkobits/formation@1.0.0-beta.4/dist/index.min.js?label=minified&style=flat-square
[gzipped-img]: http://img.badgesize.io/https://unpkg.com/@darkobits/formation@1.0.0-beta.4/dist/index.min.js?compression=gzip&label=gzipped&style=flat-square
[unpkg-url]: https://unpkg.com/@darkobits/formation@1.0.0-beta.4/dist/

[xo-img]: https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo

[npm-img]: https://img.shields.io/npm/v/@darkobits/formation.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/formation

