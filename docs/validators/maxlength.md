### `maxLength(value: number): (modelValue: any): boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the length of the string representation of the model value is less than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Maximum length to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import app from 'app';

import {
  maxLength
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  const maxMessageLen = 500;
  
  vm.controls = {
    message: {
      validators: {
        maxLength: maxLength(maxMessageLen)
      },
      errors: [
        ['maxLength', `Messages must be no longer than ${maxMessageLen} characters.`]
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