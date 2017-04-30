# ConfigurableValidator

**Type:** `class`

## Description

Allows for the creation of complex validators/asyncValidators that may need to access other controls in the form. The provided function will be bound to the `ConfigurableValidator` instance. Once configured, the validator will have references to the Formation form controller, its scope, and the control's ngModel controller.


### `ConfigurableValidator(validator: function) => ConfigurableValidator`

Creates a new configurable validator with the provided validator function.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`validator`|`Function`|Validator function.|

**Returns:**

`ConfigurableValidator` - Instance.

**Example:**

```js
import angular from 'angular';

import {
  ConfigurableValidator
} from '@darkobits/formation';


// Create a new configurable validator.
const myValidator = new ConfigurableValidator(function (modelValue) {
  const {form, ngModelCtrl, scope} = this;

  // Do something with form/ngModelCtrl/scope/modelValue.
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
