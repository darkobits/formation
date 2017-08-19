### `max(value: number): (modelValue: any): boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the model value is less than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Number to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import app from 'app';

import {
  max
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  const maxQuantity = 6;
  
  vm.controls = {
    quantity: {
      validators: {
        max: max(maxQuantity)
      },
      errors: [
        ['max', `Quantity must be no greater than ${maxQuantity}.`]
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