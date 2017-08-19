# Configurable Validators

**Type:** `function`

Allows for the creation of validators/asyncValidators that need access to the form, other controls, or the form's scope. The `match` validator in the `formation-validators` package is a `ConfigurableValidator`.

### `ConfigurableValidator(validatorConfigurator: function): function`

Creates a new configurable validator.

The provided function will be invoked when the form is created and passed an object with the following shape: `{form: object, ngModelCtrl: object, scope: object}` where `form` is a reference to the Formation form controller, `ngModelCtrl` is a reference to the ngModel controller on the control which the validator is being used, and `scope` is a reference to the Formation form's _isolate_ scope.

This function should return a function with the following signature:

`(modelValue: object, viewValue: object): boolean`

which will be assigned to the control's `$validators` .

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `validatorConfigurator` | `Function` | Validator configuration function. |

#### **Returns**

| Type | Description |
| :--- | :--- |
| `function` | Intermediate configuration function invoked by the form during control registration. |

#### **Example**

A configurable validator can be defined by importing `ConfigurableValidator` from the Formation package:

```js
// myValidator.js
import {
  ConfigurableValidator
} from '@darkobits/formation';

export default ConfigurableValidator(({form, ngModelCtrl, scope}) => {
  return modelValue => {
    // Do something with form/ngModelCtrl/scope/modelValue, return a boolean.
  };
});
```

It can then be used thusly:

```js
// myCtrl.js
import app from 'app';

import {
  required,
  minLength
} from '@darkobits/formation-validators';

import myValidator from './myValidator';


app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        required,
        minLength: minLength(6),
        // Use the validator like any other function in a control's "validators"
        // configuration.
        required: myValidator
      }
    }
  }
});
```

### Additional Resources

* [AngularJS: API: Custom Validation](https://docs.angularjs.org/guide/forms#custom-validation)



