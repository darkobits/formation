# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0"></a>
# [1.0.0](https://github.com/darkobits/formation/compare/@darkobits/formation@1.0.0-beta.12...@darkobits/formation@1.0.0) (2017-10-06)


### Bug Fixes

* Don't clone() on $getModelValue. ([4aa9916](https://github.com/darkobits/formation/commit/4aa9916))
* Deep merging works correctly in IE11. ([9383c12](https://github.com/darkobits/formation/commit/9383c12))


### Features

* **Nesting:** Added the `FormGroup` component and support for nested forms. For more information, see the official documentation on [nesting](https://darkobits.gitbooks.io/formation/content/concepts/nesting.html).
* Mirror HTML5 attributes to control elements. ([9a791c9](https://github.com/darkobits/formation/commit/9a791c9)), closes [#3](https://github.com/darkobits/formation/issues/3)
* Added the [`ConfigurableValidator`](https://darkobits.gitbooks.io/formation/content/advanced/configurable-validator.html) class, allowing consumers to write their own complex Formation validators.
* Added `isDisabled` methods to controls, forms, and form groups.
* Added the `configure` method to forms and form groups, allowing consumers to programatically (re)configure controls.
* Added the `$fm` scope binding. Inside any Formation form, this variable will reference the nearest form controller, giving consumers access to the form API from templates.

  **Example:**

  Imagine we want to apply the `is-disabled` class to a fieldset's `legend` when its related controls are disabled. We could use `vm.myForm` (or whatever the parent controller's `controllerAs` binding is) but this is brittle because it means our code has to know the `controllerAs` binding **and** the name of the form. This decreases reusability of this template.

  Instead, we can use the `$fm` scope binding, which is not environment-dependent:

  ```html
  <fm name="myForm">
    <fieldset>
      <legend ng-class="{'is-disabled': $fm.getControl('updateFrequency').isDisabled()}">
          Update Frequency:
      </legend>

      <fm-input type="radio" name="updateFrequency" ng-value="0">Daily</fm-input>
      <fm-input type="radio" name="updateFrequency" ng-value="1">Weekly</fm-input>
      <fm-input type="radio" name="updateFrequency" ng-value="2">Monthly</fm-input>
    </fieldset>
  </fm>
  ```

  This makes it much easier to turn the fieldset template fragment into a reusable component that can work with any form.


### BREAKING CHANGES:

* Removed `onReady`

  This method has been removed. Instead, use the `on-ready` attribute of a top-level form to specify a callback which will be invoked when the form and any child forms have finished compiling. The callback is passed a reference to the form controller.

  **Before:**

  ```html
  <fm name="vm.myForm">
    ...
  </fm>
  ```

  ```js
  import app from 'app';

  import {
    onReady
  } from '@darkobits/formation';

  app.controller('myCtrl', function () => {
    const vm = this;

    vm.$onInit = () => {
      onReady(vm, 'myForm').then(form => {
        // Do something with vm.myForm/form.
      });
    };
  });
  ```

  **After:**

  ```html
  <fm name="vm.myForm" on-ready="vm.fmReady">
    ...
  </fm>
  ```

  ```js
  import app from 'app';

  app.controller('myCtrl', function () => {
    const vm = this;

    vm.fmReady = form => {
      // Do something with vm.myForm/form.
    };
  });
  ```

* Replaced `Formation` provider/service with `configure` and `registerControl` exports.

  **Before:**

  ```js
  import angular from 'angular';
  import Formation from '@darkobits/formation';

  angular.module('MyApp', [
    Formation
  ]);

  app.config(FormationProvider => {
    FormationProvider.showErrorsOn(/* ... */);
    FormationProvider.setPrefix(/* ... */);
    FormationProvider.registerControl(/* ... */);
  });
  ```

  **After:**

  ```js
  import angular from 'angular';

  import Formation, {
    configure,
    registerControl
  } from '@darkobits/formation';

  angular.module('MyApp', [
    Formation
  ]);

  configure({
    showErrorsOn: /* ... */,
    prefix: /* ... */
  });

  registerControl('myControl', {
    /* ... */
  });
  ```

* Validators have been moved to their own NPM package.

  **Before:**

  ```js
  import {
    min,
    max
  } from '@darkobits/formation/etc/validators';
  ```

  **After:**

  ```bash
  $ yarn add @darkobits/formation-validators
  ```

  or

  ```bash
  $ npm install --save @darkobits/formation-validators
  ```

  ```js
  import {
    min,
    max
  } from '@darkobits/formation-validators';
  ```
