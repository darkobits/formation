This document details new features and breaking changes introduced in Formation 1.0.

# New Feaures

### Added the `FormGroup` component and support for nested forms

Concepts:
- Forms are always objects, form groups are always arrays.
- Form groups are *not* submittable; a form group must always have a parent form.
- Forms inside form groups do not need names. Configuration and model values are delegated to forms in form groups based on their index, which is determined by their position in the DOM.
- Only the top-level form is "submittable".

### Added the `ConfigurableValidator` class

This class allows developers to write complex validators that may need to access the form or other controls. For more information, see the [documentation for ConfigurableValidator](/packages/formation/src/classes/ConfigurableValidator).

### Added `isDisabled` methods to controls, forms, form groups

This method returns `true` if a form, form group, or control is currently disabled.

### Added `configure` method to forms, form groups.

Forms, form groups, and controls now have a `configure` method, which accepts the same configuration object that can be provided via the `controls` attribute on the `fm` component. This enables controls to be (re)configured after a form has bootstrapped.

### Added the `$fm` scope binding

To facilitate interacting with a form's API from templates, the `$fm` scope binding has been added.

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

---

# Breaking Changes

### Removed `onReady`

The `$postLink` lifecycle hook will be called after `$onInit`, when any Formation form controllers are ready. Migrate code inside `onReady` callbacks to a `$postLink` lifecycle hook.

### Replaced `Formation` provider/service with `FormationConfigurator` and `registerControl`.

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
  FormationConfigurator,
  registerControl
} from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);

FormationConfigurator({
  showErrorsOn: /* ... */,
  prefix: /* ... */
});

registerControl('myControl', {
  /* ... */
});
```

---

### Validators have been moved to their own NPM package.

**Before:**

```js
import {
  min,
  max
} from '@darkobits/formation/etc/validators';
```

**After:**

```bash
npm install --save @darkobits/formation-validators
```

```js
import {
  min,
  max
} from '@darkobits/formation-validators';
```

---