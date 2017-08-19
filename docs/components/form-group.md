# Form Group Component

**Name:** `fmGroup`

**Type:** [`component`](https://docs.angularjs.org/guide/component)

Creates a new Formation form group; a collection of child Formation forms.

### Bindings

| Name | Type | Description |
| --- | --- | --- |
| `name` | `@` | Name of the form, and expression in parent scope to bind controller instance to. |
| `repeat` | `<` | Whether or not to re-use the form group's transcluded template for each member in its model value collection. |
| `ngDisabled` | `<` | Expression to evaluate to determine if the form and all controls should be disabled. |

### API

### `getForm(formName: string): Form`

Returns the named child form.

> **Note:** This method locates forms by name. Be mindful when using it with form groups where naming child forms is optional.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `formName` | `String` | Name of the child form. |

#### **Returns**

Form - Form instance, if found.

#### **Example**

```js
vm.formationForm.getForm('addresses').getForm('homeAddress'); // => FormController
```

---

### `getModelValues(): array`

Returns a _new_ array containing the current non-null, non-undefined, non-`''` model values for each child form.

#### **Returns**

`Array` - Model values of each child form.

#### **Example**

```js
vm.formationForm.getForm('addresses').getModelValues();
// => [{firstName: 'Frodo', lastName: 'Baggins'}, {firstName: 'Samwise', lastName: 'Gamgee'}]
```

---

### `setModelValues(modelValues: array): void`

Sets the model value of each child form in `modelValues` to the provided value.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `modelValues` | `Array` | Array of objects to be passed to each child form. |

#### **Example**

```js
vm.formationForm.getForm('addresses').setModelValues([
  {race: 'Hobbit', home: 'Shire'}
]);
```

---

### `isDisabled(): boolean`

Returns true if the form group is disabled.

#### **Example**

```js
vm.formationForm.getForm('addresses').getForm('homeAddress').isDisabled(); // => true
```

---

### `disable(): void`

Disables the form group and any child forms therein.

#### **Example**

```js
vm.formationForm.getForm('addresses').disable();
```

---

### `enable(): void`

Enables the form group and any child forms therein.

> Note: Child forms may still remain disabled via an `ngDisabled` directive on their element. For this reason, it is not advised to mix `ngDisabled` with `enable`/`disable`.

#### **Example**

```js
vm.formationForm.getForm('addresses').enable();
```

---

### `reset(modelValues?: array): void`

Resets each child form to a pristine state. Optionally, resets the model values of each child form enumerated in `modelValues` to the provided value, and then validates all child forms. Because this operation can destroy data that a user has entered but not yet persisted to a server, a field must be explicitly enumerated and set to `null` or `''` to "clear" it. Calling `reset` without any arguments will only reset the state flags \(`$touched`, `$pristine`, etc\) of controls to their initial values.

> **If all controls are re-validated, won't this cause errors to be displayed?**
>
> If `showErrorsOn` has been set to something sensible, like `'touched, submitted'`, then no errors will be shown because, even though certain fields may be invalid, these flags will be false because the controls will be in a pristine state. This is the same state the form is usually in when the page first loads.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| \[`modelValues`\] | `Array` | _\(Optional\)_ Map of control names to model values. |

#### **Example**

```js
// Resets interaction states without destroying model values.
vm.formationForm.getForm('addresses').reset();

// Resets all fields, but only destroys model values for the firstName and lastName fields.
vm.formationForm.getForm('addresses').reset([
  {firstName: null, lastName: null}
]);
```

---

### `configure(config: array): void`

Merges the provided array with the form group's existing control configuration and \(re\)configures each registered child form.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `config` | `Array` | Control configuration. |

#### **Example**

```js
// Configure controls/child forms with the provided array of objects.
vm.myForm.getForm('addresses').configure([
  {
    /* Config for first form. */
  },
  {
    /* Config for second form. */
  },
  // etc ...
]);
```

---

### Example

```html
<fm name="vm.formationForm" controls="vm.controls">
  <fm-group name="addresses" repeat="true">
    <fm>
      <fm-input type="text" name="streetAddress"></fm-input>
      <fm-input type="text" name="locality"></fm-input>
      <!-- etc -->
    </fm>
  </fm-group>
</fm>
```

### Additional Resources

* [AngularJS: API: ngForm](https://docs.angularjs.org/api/ng/directive/ngForm)
