# ConfigurableValidator

**Type:** `function`

## Description

Allows for the creation of complex validators/asyncValidators that may need to access other controls in the form. The provided function will be invoked when the control is registered with the form, and will be passed an object containing references to the `form`, the control's `ngModelCtrl`, and the form's `scope`. This function should return the final validation function that the form will invoke to validate the control.

### `ConfigurableValidator(validatorConfigurator: function) => function`

Creates a new configurable validator with the provided validator function.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`validatorConfigurator`|`Function`|Validator configuration function.|

**Returns:**

`function` - Intermediate configuration function invoked by the form during control registration.

**Example:**

```js
import angular from 'angular';

import {
  ConfigurableValidator
} from '@darkobits/formation';


// Create a new configurable validator.
const myValidator = ConfigurableValidator(({form, ngModelCtrl, scope}) => {
  return modelValue => {
    // Do something with form/ngModelCtrl/scope/modelValue, return a boolean.
  };
});


angular.module('MyApp').controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        // Use the validator like any other function in a control's "validators"
        // object.
        required: myValidator
      }
    }
  }
});
```

## Additional Resources

- [AngularJS: API: Custom Validation](https://docs.angularjs.org/guide/forms#custom-validation)
