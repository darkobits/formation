# formation

[![travis][travis-img]][travis-url] [![david][david-img]][david-url] [![codacy][codacy-img]][codacy-url] [![Code Style][xo-img]][xo-url] [![NPM Version][npm-img]][npm-url]

Formation is a form framework for Angular 1.5+. It aims to address many of the shortcomings in the built-in form facilities, and increase consistensy across large code bases by reducing the amount of boilterplace needed to build robust forms.

Formation consists of several small components designed to be used as [atoms](http://bradfrost.com/blog/post/atomic-web-design/#atoms)) to compose more complex components.

It ships with no CSS or themes.

## Setup

```bash
$ npm install @darkobits/formation
```

```js
import Formation, {
  FormationConfigurator
} from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);

// Set-up Formation error behavior.
FormationConfigurator({
  // While optional, you should probably configure this behavior here to ensure
  // every form behaves consistently.
  showErrorsOn: 'touched, submitted'
});
```

## Feature Overview

- Controls are configured using Plain Old JavaScript Objects instead of directives. Configuration definitions can be shared across an application, improving consistency. (See: [Control Configuration](/src/components/FormationControl#control-configuration))
- Model values are managed by the form, so developers no longer need to manage a mess of scope bindings. (See: [Working With Model Values](/src/components/Form#working-with-model-values))
- A form's submit handler will only be invoked when it should be, and will be passed the model values of all controls in the form. (See: [Submitting](/src/components/Form#submitting))
- Using `ngMessages` for validation has been greatly simplified; errors are defined in code, and one line of markup in templates. Sharing error messages across forms no longer requres exposing error copy to templates.
- Easily assign custom error messages on form controls at runtime -- from your API, for example. (See: [Errors](/src/components/Errors))
- Configuring when to display validation errors is trivial; either set the behavior application-wide or for each form by providing a list of states (ex: `"touched, submitted"`) to match against. (See: [showErrorsOn](/src/services/Formation#showerrorsonflags))
- Reset all controls to a pristine, untouched state and optionally reset their model values to an initial state.
- Accessibility: `id` and `for` attributes are managed by the form, so controls and labels are correctly associated without any extra markup.

## Example

Here's the template strucutre you might use to construct a simple address form using Formation:

```html
 <fm name="vm.addressForm" controls="vm.controls" on-submit="vm.submit">
  <fm-input type="text" name="name">Name</fm-input>
  <fm-errors for="name"></fm-errors>

  <fm-input name="streetAddress">Address</fm-input>
  <fm-errors for="streetAddress"></fm-errors>

  <fm-input name="locality">City</fm-input>
  <fm-errors for="locality"></fm-errors>

  <fm-select name="state" options="s.value as s.label for s in vm.states">
    State
  </fm-select>
  <fm-errors for="state"></fm-errors>

  <fm-input name="postalCode">Postal Code</fm-input>
  <fm-errors for="postalCode"></fm-errors>

  <button type="submit">Submit</button>
</fm>
```

Everything else is configured via the form's parent controller:

```js
 // A reference to our Angular module instance.
import app from 'app';

// Formation provides several common validators.
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

Wowza! We kept our template focused on structure, and our controller neatly describes exactly how each control in the form should behave. Check out the documentation on [Control Configuration](/src/components/FormationControl#control-configuration) for a detailed breakdown, or head over to [darkobits.github.io/formation](https://darkobits.github.io/formation/) to see a live demo.

## Documentation

Feel free to explore the [source](/src/packages) -- most of the core components are documented with inline READMEs:

- [Formation Provider/Service](/src/services/Formation)
- Components:
  - [Form](/src/components/Form)
  - [Input](/src/components/Input)
  - [Select](/src/components/Select)
  - [Textarea](/src/components/Textarea)
  - [Errors](/src/components/Errors)
- Classes:
  - [FormationControl](/src/components/FormationControl)

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/formation.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/formation
[david-img]: https://img.shields.io/david/darkobits/formation.svg?style=flat-square
[david-url]: https://david-dm.org/darkobits/formation
[codacy-img]: https://img.shields.io/codacy/coverage/e3fb8e46d6a241f5a952cf3fe6a49d06.svg?style=flat-square
[codacy-url]: https://www.codacy.com/app/darkobits/formation
[xo-img]: https://img.shields.io/badge/code_style-XO-f74c4c.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo
[npm-img]: https://img.shields.io/npm/v/@darkobits/formation.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/formation
