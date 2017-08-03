[![][travis-img]][travis-url] [![][npm-img]][npm-url] [![][deps-img]][deps-url] [![][peer-deps-img]][peer-deps-url] [![][dev-deps-img]][dev-deps-url]

# formation-validators

Validators for the Formation framework.

## Install

```bash
$ yarn add @darkobits/formation-validators
```

or

```bash
$ npm install --save @darkobits/formation-validators
```

## Validators

These examples demonstrate how to use `formation-validators` in a Formation form's control configuration object. For more information about how to configure Formation forms, read the [documentation on configuring controls](/packages/formation/src/classes/FormationControl#control-configuration).

### `required(modelValue: any) => boolean`

Returns `true` if the provided model value is not `null`, `undefined`, or an empty string.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`modelValue`|`Any`|Model value to test.|

**Returns:**

`Boolean` - True if the model value is non-nil.

**Example:**

```js
import {
  required,
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        required
      },
      errors: [
        ['required', 'This field is required.']
      ]
    }
  };
});
```

### `min(value: number) => (modelValue: any) => boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the model value is greater than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Number to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import {
  min
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        min: min(42)
      },
      errors: [
        ['min', 'Must be at least 42.']
      ]
    }
  };
});
```

### `minLength(value: number) => (modelValue: any) => boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the length of the string representation of the model value is greater than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Minimum length to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import {
  minLength
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        minLength: minLength(10)
      },
      errors: [
        ['minLength', 'Please enter at least 10 characters.']
      ]
    }
  };
});
```

### `max(value: number) => (modelValue: any) => boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the model value is less than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Number to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import {
  max
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        max: max(17)
      },
      errors: [
        ['max', 'Must be at most 17.']
      ]
    }
  };
});
```

### `maxLength(value: number) => (modelValue: any) => boolean`

Accepts a number and returns a function that, when provided a model value, returns `true` if the length of the string representation of the model value is less than or equal to the number.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`value`|`Number`|Maximum length to test model values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import {
  maxLength
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        maxLength: maxLength(20)
      },
      errors: [
        ['maxLength', 'Please enter at most 20 characters.']
      ]
    }
  };
});
```

### `email(modelValue: any) => boolean`

Returns `true` if the provided model value is a valid e-mail address according to RFC 5322.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`modelValue`|`Any`|Model value to test.|

**Returns:**

`Boolean` - Whether the provided model value is a valid.

**Example:**

```js
import {
  email
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        email
      },
      errors: [
        ['email', 'Please enter a valid e-mail address.']
      ]
    }
  };
});
```

### `pattern(pattern: RegExp) => (modelValue: any, viewValue: any) => boolean`

Accepts a pattern and returns a function that, when provided a model value and view value, returns `true` if the _view value_ matches the pattern.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`pattern`|`RegExp`|Pattern to test view values against.|

**Returns:**

`Function` - Validator function.

**Example:**

```js
import {
  pattern
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    name: {
      validators: {
        pattern: pattern(/[a-zA-z0-9]*/g)
      },
      errors: [
        ['pattern', 'Please enter letters and numbers only.']
      ]
    }
  };
});
```

### `match(controlName: string) => ConfigurableValidator`

Accepts a control name and returns a configurable validator which will be configured by the form and will return a function that, when provided a model value, will return `true` if the model value matches the model value of the named control. See: [LINK]

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`controlName`|`String`|Control name to match.|

**Returns:**

[`ConfigurableValidator`](/packages/formation/src/classes/ConfigurableValidator) - Configurable validator instance.

**Example:**

```js
import {
  email,
  match
} from '@darkobits/formation-validators';

app.controller('MyCtrl', function () {
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
        ['match', 'E-mail addresses must match.']
      ]
    }
  };
});
```

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/formation.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/formation

[npm-img]: https://img.shields.io/npm/v/@darkobits/formation-validators.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/formation-validators

[deps-img]: https://david-dm.org/darkobits/formation/status.svg?path=packages/formation-validators&style=flat-square
[deps-url]: https://david-dm.org/darkobits/formation?path=packages/formation-validators

[peer-deps-img]: https://david-dm.org/darkobits/formation/peer-status.svg?path=packages/formation-validators&style=flat-square
[peer-deps-url]: https://david-dm.org/darkobits/formation?type=peer&path=packages/formation-validators

[dev-deps-img]: https://david-dm.org/darkobits/formation/dev-status.svg?path=packages/formation-validators&style=flat-square
[dev-deps-url]: https://david-dm.org/darkobits/formation?type=dev&path=packages/formation-validators
