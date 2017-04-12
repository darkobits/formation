# Form Component

**Name:** `fm`

**Type:** [`component`](https://docs.angularjs.org/guide/component)

## Description

Creates a new Formation form. This component should be used in lieu of `<form>` when working with Formation.

## Bindings

|Name|Type|Description|
|---|---|---|
|`name`|`@`|Name of the form, and expression in parent scope to bind controller instance to.|
|`controls`|`<`|Expression in parent scope to use for control configuration.|
|`onSubmit`|`<`|Function in parent scope to invoke when submitting the form.|
|`showErrorsOn`|`@`|String of comma/space delimited control/form states to check for showing control errors.|
|`ngDisabled`|`<`|Expression to evaluate to determine if the form and all controls should be disabled.|

## API

The Formation controller exposes the following methods:

### `getControl(controlName) => FormationControl`

Returns the first control whose name matches the provided value.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`controlName`|`String`|Name of the control to get.|

**Returns:**

[`FormationControl`](/src/components/FormationControl) - Control instance, if found.

**Example:**

```js
vm.myForm.getControl('firstName'); // => FormationControl instance
```

----

### `getModelValues() => Object`

Returns a _new_ object containing the current non-null, non-undefined, non-`''` model values for each control.

**Returns:**

`Object` - Model values.

**Example:**

```js
vm.myForm.getModelValues();
// => {firstName: 'Frodo', lastName: 'Baggins'}
```

----

### `setModelValues(modelValues)`

Sets the model value of each control in `modelValues` to the provided value.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`modelValues`|`Object`|Map of control names to model values.|

**Example**:

```js
vm.myForm.setModelValues({race: 'Hobbit', home: 'Shire'});
```

----

### `disable()`

Disables the form and any Formation controls therein.

**Example**:

```js
vm.myForm.disable();
```

----

### `enable()`

Enables the form and any Formation controls therein. Note: Controls may still remain disabled via an `ngDisabled` directive on the control element. For this reason, it is not advised to mix `ngDisabled` with `enable`/`disable`.

**Example**:

```js
vm.myForm.enable();
```


----

### `reset(modelValues)`

Resets the form and each control to a pristine state. Optionally, resets the model value of each control in `modelValues` to the provided value, and then validates all controls.

> **If all controls are re-validated, won't this cause errors to be displayed?**<br><br>
If you have configured the `showErrorsOn` behavior of Formation to something sensible, like `'touched, submitted'`, then no errors will be shown because, even though certain fields may be invalid, these flags will be false. This is exactly the same state the form is usually in when the page first loads.

|Name|Type|Description|
|---|---|---|
|`modelValues`|`Object`|(Optional) Map of control names to model values.|

**Example**:

```js
// Resets interaction states without changing model values.
vm.myForm.reset();

// Resets model values to the provided data.
vm.myForm.reset({firstName: null, lastName: null});
```

## Additional Behavior

- Disabling: The form can be disabled/enabled in two ways:
  - Using `ngDisabled` on the Formation form element (`<fm>`).
  - Using the [`disable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#disable)/[`enable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#enable) methods of the Formation form API.

## Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
  <fm-input name="lastName">Last Name:</fm-input>
  <!-- etc... -->
</fm>
```

## Working With Model Values

Formation takes a "managed" approach to model values in forms; rather than requiring developers to manually bind each control to an expression using `ngModel`, Formation creates an object keyed by the name of each control in the form. Model values can be accessed and modified using the [`getModelValues`](/src/components/Form#getmodelvalues--object) and [`setModelValues`](/src/components/Form#setmodelvaluesmodelvalues) instance methods, and are also passed to the form's [`onSubmit`](/src/components/Form#bindings) handler. This approach allows templates to remain terse, prevents controllers from becoming cluttered with extraneous model value bindings, and encourages developers to reason about model values as inputs to and outputs from a component rather than two-way-bound data.

It is also possible to manipulate the model value of a specific control programatically using the [`getModelValue`](/src/components/FormationControl#getmodelvalue--) and [`setModelValue`](/src/components/FormationControl#setmodelvalue) methods of the control API.

#### Scenario: Setting and Resetting to an Initial State

Because Formation does not bind to the objects passed via `setModelValue` and `setModelValues`, it is easy to set a form's model values to an initial state, and then reset them to that state later:

```js
import app from 'app';

app.controller('MyCtrl', function () {
  const vm = this;

  vm.$onInit = () => {
    // Get some data from the API, then set the form's initial state, keeping
    // the form disabled until the request completes.
    vm.myForm.disable();

    $http.get('/api/someEndpoint').then(response => {
      // Assume response.data is an object that represents named controls in
      // our form and their current values in the database.
      vm.initialState = response.data;
      vm.resetForm();
      vm.myForm.enable();
    });
  };

  vm.resetForm = () => {
    // Formation does not "bind" to this object; it will not be modified as
    // model values in the form change.
    vm.myForm.setModelValues(vm.initialState);
  };
});

```

```html
<fm name="vm.myForm">
  <!-- Controls -->
  <button ng-click="vm.resetForm()">Reset</button>
</fm>
```

## Submitting

By default, Angular will invoke a form's `ngSubmit` function immediately upon receiving the `submit` event, even if the form is invalid. This provides developers control, but often results in boilerplate in submit handlers. Additionally, Angular does not wait for any pending `$asyncValidators` to finish before submitting the form. This means that if an async validator rejects after the form was submitted, you might wind up sending bad data to your server.

Furthermore, Angular doesn't provide an easy mechanism to allow developers to set control-specific errors based on API responses. For example, if we submitted a form and got a response with status code `400 (Bad Request)` back with the following data:

```json
{
  "message": "Bad request.",
  "invalidFields": {
    "email": "This e-mail address is already in use."
  }
}
```
it would be non-trivial, from the context of our submit handler, to set that error on the `email` control in our form. Formation addresses this issue by creating a promise-based submission flow that allows developers to return errors back to the form to be applied to controls.

### Example

When a Formation form is submitted, the following steps are taken:

1. Determine if another submit is already in progress. If so, bail.
2. Disable all controls in the form.
3. Clear any `$custom` validation errors on controls.
3. Wait for any pending async validators to complete.
4. Check if the form is `$valid`. If not, bail.
5. Invoke the `onSubmit` handler for the form, passing it the model values from the form. If this function returns a promise, the following actions are performed:
  - If the promise rejects, bail.
  - If the promise resolves, assume the resolved value is an object of control names and error messages (typically from an API). Each custom error message will be applied to controls using the `$custom` validation key. (When using the [Errors](/src/components/Errors) component, everything Just Works.)

Based on this, a submit handler might look something like the following:

```js
vm.onSubmit = modelValues => {
  // Form is guaranteed to be valid, no need to check vm.myForm.$valid.
  return $http.post('/api/someEndPoint', {
    data: modelValues
  })
  .then(response => {
    // All good! No need to return anything to Formation.
  })
  .catch(response => {
    // Something went wrong. Our API will send us field errors in an
    // "invalidFields" key in the response. Return them to Formation, which
    // will apply a "$custom" error validation key to each control using the
    // provided messages.
    return response.data.invalidFields;
  });
};
```

## Additional Resources

- [AngularJS: API: ngForm](https://docs.angularjs.org/api/ng/directive/ngForm)
- [AngularJS: API: ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages)
