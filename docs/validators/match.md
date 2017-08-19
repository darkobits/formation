### `match(controlName: string): ConfigurableValidator`

Accepts a control name and returns a [configurable validator](/advanced/configurable-validator.md) which will be configured by the form and will return a function that, when provided a model value, will return `true` if the model value matches the model value of the named control.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`controlName`|`String`|Control name to match.|

**Returns:**

[`ConfigurableValidator`](/advanced/configurable-validator.md) - Configurable validator instance.

**Example:**

```js
import app from 'app';

import {
  email,
  match
} from '@darkobits/formation-validators';

function MyCtrl() {
  const vm = this;

  vm.controls = {
    email: {
      validators: {
        email
      },
      errors: [
        ['email', 'Please enter a valid e-mail address.']
      ]
    },
    emailMatch: {
      validators: {
        email,
        match: match('email')
      },
      errors: [
        ['email', 'Please enter a valid e-mail address.'],
        ['match', 'E-']
      ]
    }
  };
});

app.component('myComponent', {
  controller: MyCtrl,
  controllerAs: 'vm',
  // ...
});
```