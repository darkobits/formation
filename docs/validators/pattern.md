### `pattern(pattern: RegExp): (modelValue: any, viewValue: any): boolean`

Accepts a pattern and returns a function that, when provided a model value and view value, returns `true` if the _view value_ matches the pattern.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`pattern`|`RegExp`|Pattern to test view values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import app from 'app';

import {
  pattern
} from '@darkobits/formation-validators';

function MyCtrl() {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        pattern: pattern(/^[\D]+$/g)
      },
      errors: [
        ['pattern', 'Names may only contain letters and punctuation.']
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

> **Why does this validator test against view values?**
>  
>  It is most common to validate the actual input received from the user rather than the value written to the data model. In most cases, the view value and model value for a control are the same. However, when parsers and formatters are used to transform between view values and model values, they can be different.
>
> Imagine you are collecting a user's phone number. You may want to store the number in the [E.164](https://en.wikipedia.org/wiki/E.164) format, but ask the user to enter it in a format appropriate for their locale. In such a case, a `$parser` would be used to transform the locale-specific view value into an E.164-formatted model value. We want to ensure that the user entered their phone number in the locale-specific format, meaning we need to test the _**view value**_, not the model value.

