### `min(value: number): (modelValue: any): boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the model value is greater than or equal to the number.

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
  min
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  vm.controls = {
    age: {
      validators: {
        min: min(13)
      },
      errors: [
        ['min', 'Minimum age is 13.']
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