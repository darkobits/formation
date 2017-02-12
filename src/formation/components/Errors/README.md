# Errors Component

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Shows `ngMessages` errors for a specific control.

|Binding|Type|Description|
|---|---|---|
|`for`|`<`|Control name to show errors for.|

----

`ngMessages` is a powerful Angular 1.x module that allows developers to display validation error messages for individual form controls. However, in large applications, it can be cumbersome to work with for the following reaons:

- All message strings must be literals or exposed to the template via the controller.
- Determining when to show/hide errors is tedious.
- Markup bloats with each validation message added.
- Developers have to concern themselves with a model value and the control state, which are stored in different objects.
- Consistency is difficult to maintain as each developer working on a large codebase may use slightly different markup or message copy.

Here's an example of what the markup for an `ngMessages` block might look like in a typical application:

```html
<form name="vm.addressForm">
  <div class="control-group"
    ng-class="{'has-error': vm.addressForm.myName.$invalid && (vm.addressForm.$submitted || vm.addressForm.myName.$touched)}">
    <lablel for="firstName">
      First Name:
    </label>
    <input id="firstName"
      name="firstName"
      type="text"
      ng-model="vm.firstName"
      minlength="2"
      maxlength="42"
      pattern="^[a-zA-Z0-9]*$"
      required>
    <div ng-messages="vm.addressForm.firstName.$error"
      ng-show="vm.addressForm.myName.$invalid && (vm.addressForm.$submitted || vm.addressForm.myName.$touched)">
      <span ng-message="required">
        {{ vm.errorMessages.required }}
      </span>
      <span ng-message="minlength">
        {{ vm.errorMessages.minLength }}
      </span>
      <span ng-message="pattern">
        {{ vm.errorMessages.pattern }}
      </span>
      <span ng-message="maxlength">
        {{ vm.errorMessages.maxLength }}
      </span>
    </div>
  </div>
</form>

```

It isn't difficult to imagine that a form with a dozen controls could easily require hundreds of lines of markup, most of which are related to business logic rather than the structure or presentation of the document. Formation addresses this by providing the `Errors` component, which is used thusly:

```html
<fm name="vm.addressForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
  <fm-errors for="firstName"><fm-errors>
</fm>
```

On the JavaScript side, we will tell Formation to display errors on invalid fields when either 1) they have been touched or 2) when the form has been submitted:

```js
angular.module('myApp').config(Formation => {
  Formation.showErrorsOn('touched, submitted');
});
```

And here's what our controller would look like:

```js
import {
  required,
  minLength,
  maxLength,
  pattern
} from 'formation/etc/validators';

angular.module('myApp').controller('addressFormCtrl', function () {
  const vm = this;

  vm.controls = {
    firstName: {
      validators: {
        required,
        minLength: minLength(2),
        maxLength: maxLength(42),
        pattern: pattern(new RegExp(/^[a-zA-Z0-9]*$/g))
      },
      errors: [
        ['required', 'This field is required'],
        ['minLength', 'Please enter at least 2 characters']
        ['maxLength', 'Please enter no more than 42 characters.']
        ['pattern', 'Please enter alphanumeric characters only.']
      ]
    }
  };
});
```

Now, business logic lives in the controller, presentation and strucutre in the template. The template does not bloat if we need to add new validation rules, and styles for validation errors can be written once per application instead of once per form.

Note that `validators` are nothing special. Formation provides several common validators for convenience, but a validatior can be any function that returns a boolean.

## API

This control extends the [`FormationControl`](/src/formation/components/FormationControl) class, and does not implement any additional methods.

## See Also:
- [AngularJS: API: ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages)
- [AngularJS: API: ngModel.ngModelController](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController)
