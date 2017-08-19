# Form Component

**Name:** `fm`

**Type:** [`component`](https://docs.angularjs.org/guide/component)

Creates a new Formation form. This component should be used in lieu of `<form>` when working with Formation.

### Bindings

| Name | Type | Description |
| --- | --- | --- |
| `name` | `@` | Name of the form, and expression in parent scope to bind controller instance to. |
| `controls` | `<` | Expression in parent scope to use for control configuration. |
| `onSubmit` | `<` | Function in parent scope to invoke when submitting the form. |
| `showErrorsOn` | `@` | String of comma/space delimited control/form states to check for showing control errors. This can also be configured globally using the [configure](/packages/formation/src/etc/config#configureopts-object--void) method. |
| `ngDisabled` | `<` | Expression to evaluate to determine if the form and all controls should be disabled. |

### Properties

#### `$valid`

**Type:** `boolean`

Whether or not the form is valid. This is a pass-through to the Angular form controller property.

#### `$invalid`

**Type:** `boolean`

Whether or not the form is invalid. This is a pass-through to the Angular form controller property.

#### `$pristine`

**Type:** `boolean`

Whether or not the form is pristine \(controls have not been touched\). This is a pass-through to the Angular form controller property.

#### `$dirty`

**Type:** `boolean`

Whether or not the form is dirty \(controls have been touched\). This is a pass-through to the Angular form controller property.

#### `$submitting`

**Type:** `boolean`

Whether or not the form is currently in the process of being submitted. Requires that a promise be returned from the form's `onSubmit` handler to work correctly.

#### `$submitted`

**Type:** `boolean`

Whether or not the form has been submitted \(successfully or not\). This is a pass-through to the Angular form controller property.

### API

### `getControl(controlName: string): FormationControl`

Returns the first control whose name matches the provided value.

#### **Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `controlName` | `String` | Name of the control to get. |

#### **Returns:**

[`FormationControl`](/packages/formation/src/classes/FormationControl) - Control instance, if found.

#### **Example:**

```js
vm.formationForm.getControl('firstName'); // => FormationControl
```

---

### `getForm(formName: string): Form`

Returns the named child form or form group.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `formName` | `String` | Name of the child form or form group. |

#### **Returns**

Form\|[`FormGroup`](/packages/formation/src/components/FormGroup) - Form or form group instance, if found.

#### **Example**

```js
vm.formationForm.getForm('address'); // => FormController
```

---

### `getModelValues(): object`

Returns a _new_ object containing the current non-null, non-undefined, non-`''` model values for each control.

#### **Returns**

`Object` - Model values.

#### **Example**

```js
vm.formationForm.getModelValues(); // => {firstName: 'Frodo', lastName: 'Baggins'}
```

---

### `setModelValues(modelValues: object): void`

Sets the model value of each control in `modelValues` to the provided value.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `modelValues` | `Object` | Map of control names to model values. |

#### **Example**

```js
vm.formationForm.setModelValues({race: 'Hobbit', home: 'Shire'});
```

---

### `isDisabled(): boolean`

Returns true if the form is disabled.

#### **Example**

```js
vm.formationForm.isDisabled(); // => true
```

---

### `disable(): void`

Disables the form and any Formation controls therein.

#### **Example**

```js
vm.formationForm.disable();
```

---

### `enable(): void`

Enables the form and any Formation controls therein.

> Note: Controls may still remain disabled via an `ngDisabled` directive on the control element. For this reason, it is not advised to mix `ngDisabled` with `enable`/`disable`.

#### **Example**

```js
vm.formationForm.enable();
```

---

### `reset(modelValues?: object): void`

Resets the form and each control to a pristine state. Optionally, resets the model value of each control in `modelValues` to the provided value, and then validates all controls. Because this operation can destroy data that a user has entered but not yet persisted to a server, a field must be explicitly enumerated and set to `null` or `''` to "clear" it. Calling `reset` without any arguments will only reset the state flags \(`$touched`, `$pristine`, etc\) of each control and the form to their initial values.

> **If all controls are re-validated, won't this cause errors to be displayed?**
>
> If `showErrorsOn` has been set to something sensible, like `'touched, submitted'`, then no errors will be shown because, even though certain fields may be invalid, these flags will be false because the controls will be in a pristine state. This is the same state the form is usually in when the page first loads.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| \[`modelValues`\] | `Object` | _\(Optional\)_ Map of control names to model values. |

#### **Example**

```js
// Resets interaction states without destroying model values.
vm.formationForm.reset();

// Resets all fields, but only destroys model values for the firstName and lastName fields.
vm.formationForm.reset({firstName: null, lastName: null});
```

---

### `configure(config: object): void`

Merges the provided object with the form's existing control configuration and \(re\)configures each registered control, child form, or child form group.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `config` | `Object` | Control configuration. |

#### **Example**

```js
// Configure controls/child forms with the provided object.
vm.formationForm.configure({
  firstName: {
    // ...
  },
  lastName: {
    // ...
  }
});
```

---

### Example

```html
<fm name="vm.formationForm" controls="vm.controls">
  <fm-input name="firstName">First Name:</fm-input>
  <fm-input name="lastName">Last Name:</fm-input>
  <!-- etc... -->
</fm>
```

### Additional Resources

* [AngularJS: API: ngForm](https://docs.angularjs.org/api/ng/directive/ngForm)
* [AngularJS: API: ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages)



