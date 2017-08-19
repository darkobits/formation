### `email(modelValue: any): boolean`

Returns `true` if the provided model value is a valid e-mail address according to [RFC 5322](https://en.wikipedia.org/wiki/Email_address).

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`modelValue`|`Any`|Model value to test.|

**Returns:**

`Boolean` - Whether the provided model value is a valid.

**Example:**

```js
import app from 'app';

import {
  email
} from '@darkobits/formation-validators';

function MyCtrl () {
  const vm = this;
  
  vm.controls = {
    emailAddress: {
      validators: {
        email
      },
      errors: [
        ['email', 'Please enter a valid e-mail address.']
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