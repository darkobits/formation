# FormationControl

**Type:** `class`

## Description

This is the base class shared by all Formation control components ([`Input`](/src/components/Input), [`Select`](/src/components/Select), [`Textarea`](/src/components/Textarea), [`Errors`](/src/components/Errors)). It can be extended to create custom components that work with Formation forms. You can use the [`getControl`](/src/components/Form#getcontrolcontrolname--object) method of the Formation [form controller](/src/components/FormationControl) to access individual control instnaces in the form.

## API

This class implements the following public methods:

### `getControlId() => String`

Returns the `id` attribute assigned to the control instnace.

**Returns:**

`String` - Control's `id` attribute.

**Example:**

```js
vm.myForm.getControl('firstName').getControlId()
// => 'vm.myForm-firstName-0'
```

----

### `getControlErrors() => Object`

Returns the control's `$error` object, or `false` if the control is valid.

**Returns:**

`Object` - The `ngModel` controller's `$error` object for the control.

**Example:**

```js
vm.myForm.getControl('age').getControlErrors()
// => {required: false, min: true}
```

----

### `getErrorMessages() => Array`

Returns the configured error messages for the control.

**Returns:**

`Array` - List of key/message pairs for the control.

**Example:**

```js
vm.myForm.getControl('firstName').getErrorMessages()
// => [['required', 'This field is required'], ['minLength', 'Please enter at least two characters.']]

```

----

### `disable()`

Sets the control's internal `$disabled` flag to true. A control will be disabled if any of the following conditions are true:

1. It's `$disabled` flag is `true`.
2. It has a truthy `ngDisabled` expression on it.
3. The form's `$disabled` flag is `true`, set using [`Form#disable`](/src/components/Form#disable)
4. The form has a truthy `ngDisabled` expresssion on it.

**Example:**

```js
vm.myForm.getControl('firstName').disable();
```

----

### `enable()`

Sets the control's internal `$disabled` flag to `false`. Note that the control _may_ still remain disabled if any of the above conditions are also true. It is recommended that either `ngDisabled` or the form/control APIs be used, but not both.

**Example:**

```js
vm.myForm.getControl('firstName').enable();
```

----

### `getModelValue() => *`

Return's the control's model value.

**Example:**

```js
vm.myForm.getControl('firstName').getModelValue();
// => 'Frodo'
```

----

### `setModelValue(*)`

Set's the control's model value.

**Example:**

```js
vm.myForm.getControl('age').setModelValue(42);
```

## Control Configuration

Controls can be configured at the control level and at the form level, with the latter taking precedence over the former. This allows developers to avoid repetition by providing generic configuration at the control level and context-specific configuration at the form level. In both cases the following options are supported:

|Name|Type|Description|
|---|---|---|
|`parsers`|`Array`|Array of parser functions to be added to the control's `$parsers`.|
|`formatters`|`Array`|Array of formatter functions to be added to the control's `$formatters`.|
|`validaotrs`|`Object`|Object containing validators to be added to the control's `$validators`.|
|`asyncValidators`|`Object`|Object containing async validators to be added to the control's `$asyncValidators`.|
|`ngModelOptions`|`Object`|Object providing [`ngModelOptions`](https://docs.angularjs.org/api/ng/directive/ngModelOptions) configuration for the control.|
|`errors`|`Array`|Array containing tuples of validation keys and error messages.|

### Form Configuration

Given the following template:

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
</fm>
```

We can configure the `firstName` control from the form's parent controller (`vm`) thusly:

```js
app.controller('MyCtrl', function (MyService) {
  const vm = this;

  vm.controls = {
    firstName: {
      parsers: [
        // List of parser functions.
        viewValue => viewValue.toUpperCase()
      ],
      formatters: [
        // List of formatter functions.
        modelValue => modelValue.toLowerCase()
      ],
      validators: {
        // Map of validation keys/functions.
        required: modelValue => !!modelValue
      },
      asyncValidators: {
        inUse: modelValue => MyService.isInUse(modelValue)
      },
      ngModelOptions: {
        updateOn: 'default blur',
        debounce: {
          default: 500,
          blur: 0
        }
      },
      errors: [
        // List of validation keys/error messages. As is the case with ngMessages, order matters.
        ['required', 'This field is required.'],
        ['inUse', 'This name is taken.']
      ]
    }
  };
});

```

This is a significant improvement over the template-driven approach, wherein all of this logic would have to be added to our template. Consistency can be improved by sharing lists of error messages, validation functions, etc. across a code base.

### Component Configuration

For the greatest possible consistency, however, we would want to define the behavior (and even styles) for something like an e-mail control once, and then allow developers to use that e-mail control anywhere in the application with the guarantee that it will look and behave exactly as it should.

To demonstrate this approach, we will be using Angular [components](https://docs.angularjs.org/guide/component), available since version 1.5. We will also assume that a module-bundler like [Webpack](https://webpack.js.org/) is being used to parse stylesheets and other assets.

```css
/* emailControl.css */

my-email {
  /* Define rules for the email control here. */
  fm-input {

  }

  fm-errors {

  }
}
```

```js
/* emailControl.js */

import app from 'app';
import {email} from '@darkobits/formation/etc/validaotrs';
import './emailControl.css';

app.component('myEmail', {
  bindings: {
    name: '@',
  },
  controller () {
    const Email = this;

    // Set a default label. If the consumer provides one via transclusion,
    // it will be overwritten.
    Email.label = 'E-Mail Address:';

    Email.placeholder = 'user@example.com';

    Email.config = {
      validators: {
        email
      },
      errors: [
        ['required', 'Please provide your e-mail address.'],
        ['email', 'Please enter a valid e-mail address.']
      ]
    };
  },
  controllerAs: 'Email',
  transclude: true,
  template: `
    <fm-input name="{{::Email.name }}"
      type="email"
      placeholder="{{::Email.placeholder }}"
      config="Email.config">
      <span ng-transclude>
        {{::Email.label }}
      </span>
    <fm-input>
    <fm-errors for="{{::Email.name }}"><fm-errors>
  `
});
```

We can then use this component thusly:

```html
<fm name="vm.myForm" controls="vm.controls">
  <my-email name="emailAddress"></my-email>
</fm>
```

This will render a fully styled, fully configured email input control.

Notice that we have supplied a validation message for `required`, but did not apply the `required` validator. This allows the control to be used in contexts where it may be optional. However, by providing the `required` validation message in the component configuration, we have the opportunity to use a message specific to the kind of control we are using. In this case, rather than using a generic "This field is required." message, we can say "Please provide your e-mail address".

If another developer wanted to make this control required in their form, they could simply use the `required` validator:

```js
import app from 'app';
import {required} from '@darkobits/formation/etc/validators';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.controls = {
    email: {
      validators: {required}
    }
  };
});

```

## Additional Resources

- [AngularJS: API: ngModel.ngModelController](http://docs.angularjs.org/api/ng/type/ngModel.NgModelController)
- [AngularJS: API: ngMessages](http://docs.angularjs.org/api/ngMessages/directive/ngMessages).
