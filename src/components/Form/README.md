# Form Component

**Name:** `fm`

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Creates a new Formation form.

**Bindings:**

|Name|Type|Description|
|---|---|---|
|`name`|`@`|Name of the form, and expression in parent scope to bind controller instance to.|
|`controls`|`<`|Expression in parent scope to use for control configuration.|
|`onSubmit`|`<`|Function in parent scope to invoke when submitting the form.|
|`showErrorsOn`|`@`|String of comma/space delimited control/form states to check for showing control errors.|
|`ngDisabled`|`<`|Expression to evaluate to determine if the form and all controls should be disabled.|

----

This component should be used in lieu of `<form>` when working with Formation.

## Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
  <fm-input name="lastName">Last Name:</fm-input>
  <!-- etc... -->
</fm>
```

## Working With Model Values

Formation takes a "managed" approach to model values in forms; rather than requiring developers to manually bind each control to an expression using `ngModel`, Formation creates an object keyed by the name of each control in the form. This object is accessible via the `getModelValues` instance member, and is also passed to the form's `onSubmit` function. This allows templates to remain terse, and prevents controllers from becoming cluttered.

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

### Example:

When a Formation form is submitted, the following steps are taken:

1. Determine if another submit is already in progress. If so, bail.
2. Disable all controls in the form.
3. Clear any `$custom` validation errors on controls.
3. Wait for any pending async validators to complete.
4. Check if the form is `$valid`. If not, bail.
5. Invoke the `onSubmit` handler for the form, passing it the model values from the form. If this function returns a promise, the following actions are performed:
  - If the promise rejects, bail.
  - If the promise resolves, assume the resolved value is an object of control names and error messages from the API. Each custom error message will be applied to fields using the `$custom` validation key.

Based on this, a submit handler might look something like this:

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
    // Something went wrong. Our API will send us field errors in an "invalidFields" key. Return it to Formation:
    return response.data.invalidFields;
  });
};
```

## API

The Formation controller exposes the following methods:

### `getControl(controlName) => Object`

Returns the first control whose name matches the provided value.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`controlName`|`String`|Name of the control to get.|

**Returns:**

`Object` - Control instance, if found.

**Example:**

```js
vm.myForm.getControl('firstName');
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
