### `minLength(value: number): (modelValue: any): boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the length of the string representation of the model value is greater than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Minimum length to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import app from 'app';

import {
  minLength
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  vm.controls = {
    password: {
      validators: {
        minLength: minLength(6)
      },
      errors: [
        ['minLength', 'Passwords must contain at least 6 characters.']
      ]
    }
  };
}

app.component('myComponent', {
  controller: MyCtrl,
  controllerAs: 'vm',
  // ...
});
```