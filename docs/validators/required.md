### `required(modelValue: any): boolean`

Returns `true` if the provided model value is not `null`, `undefined`, or an empty string.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`modelValue`|`Any`|Model value to test.|

**Returns:**

`Boolean` - True if the model value is non-nil.

**Example:**

```js
import app from 'app';

import {
  required
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  vm.controls = {
    firstName: {
      validators: {
        required
      },
      errors: [
        ['required', 'Please enter your first name.']
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