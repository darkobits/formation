# Form & Control Configuration

Controls in a form can be configured at the control level and at the form level. Form-level configuration will always override control-level configuration. This allows developers to create reusable control components by providing generic configuration at the control level and context-specific configuration at the form level. In both cases the following options are supported:



| Name | Type | Description |
| --- | --- | --- |
| `parsers` | `Array` | Array of parser functions to be added to the control's `$parsers`. |
| `formatters` | `Array` | Array of formatter functions to be added to the control's `$formatters`. |
| `validators` | `Object` | Object containing validators to be added to the control's `$validators`. |
| `asyncValidators` | `Object` | Object containing async validators to be added to the control's `$asyncValidators`. |
| `ngModelOptions` | `Object` | Object providing [`ngModelOptions`](https://docs.angularjs.org/api/ng/directive/ngModelOptions) configuration for the control. |
| `errors` | `Array` | Array containing tuples of validation keys and error messages. |

### Form-Level Configuration

Given the following template:

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
</fm>
```

We can configure the `firstName` control from the form's parent controller \(`vm`\) by defining `vm.controls` as an object with a `firstName` key that contains any of the above properties we wish to configure for this control:

```js
import app from 'app';

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
        // List of validation keys/error messages. As is the case with
        // ngMessages, order matters.
        ['required', 'This field is required.'],
        ['inUse', 'This name is taken.']
      ]
    }
  };
});
```

This is a significant improvement over the template-driven approach, wherein all of this logic would have to be added to our template. Consistency can be improved by sharing lists of error messages, validation functions, etc. across a code base.

### Component-Level Configuration

For the greatest possible consistency, however, we would want to define the behavior \(and styles\) for commonly-used controls in a single place. We can achieve this by creating components that compose Formation components, providing configuration for them in the composite component's controller.

For example, let's say we wanted to build a control that would serve as an e-mail address input. We want to ensure the input collected is a valid e-mail address and set up our label, placeholder, and error messages to display copy specific to this kind of control. We can do this by passing a configuration object to the Formation control via the `config` binding.

Here's what that might look like:

> `emailAddress.js`

```js
import app from 'app';

import {
  email
} from '@darkobits/formation-validaotrs';

function EmailCtrl () {
  const EmailInput = this;

  // Set a default label. If the consumer provides one via transclusion,
  // this one will be overwritten.
  EmailInput.label = 'E-Mail Address:';

  EmailInput.placeholder = 'user@example.com';

  EmailInput.config = {
    validators: {
      email
    },
    errors: [
      ['required', 'Please provide your e-mail address.'],
      ['email', 'Please enter a valid e-mail address.']
    ]
  };
}

app.component('emailAddress', {
  bindings: {
    name: '@',
  },
  controller: EmailCtrl,
  controllerAs: 'EmailInput',
  transclude: true,
  template: `
    <fm-input name="{{ EmailInput.name }}"
      type="email"
      placeholder="{{ EmailInput.placeholder }}"
      config="EmailInput.config">
      <span ng-transclude>
        {{ EmailInput.label }}
      </span>
    <fm-input>
    <fm-errors for="{{ EmailInput.name }}"><fm-errors>
  `
});
```

We can then use this component thusly:

> `userForm.html`

```html
<fm name="vm.myForm" controls="vm.controls">
  <email-address name="emailAddress"></email-address>
  <!-- etc. -->
</fm>
```

This will render a fully-configured email input control. If the consumer of this control decides to provide additional configuration via `vm.controls`, that configuration will take precedence over the configuration provided in the `emailAddress` component's controller.

Also notice that we have supplied a validation message for the `required` error,  but did not apply the `required` validator. This allows the control to be used in contexts where it _may_ be optional. However, by providing the `required` validation message in the component configuration, we have the opportunity to use a message specific to the kind of control we are creating. In this case, rather than using a generic _"This field is required."_ message, we can say _"Please provide your e-mail address"_.

If another developer wanted to make this control required in their form, they would only need to add the `required` validator:

> `userForm.js`

```js
import app from 'app';

import {
  required
} from '@darkobits/formation-validators';

import templateUrl from './userForm.html';

function UserFormCtrl () {
  const vm = this;

  vm.controls = {
    email: {
      validators: {
        required
      }
    }
  };
});

app.component('userForm', {
  controller: UserFormCtrl,
  controllerAs: 'vm',
  templateUrl
});
```



