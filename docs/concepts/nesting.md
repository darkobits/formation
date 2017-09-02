# Nesting

When working with complex model data, it often becomes necessary to nest forms inside one another to mirror the structure of the data. HTML does not natively support nested `<form>` elements, and Angular offers limited support for nested forms out of the box via `ngForm`. And, because all controls must be manually bound to expressions in a parent controller with `ngModel`, building forms that work with large amounts of data can quickly become unmanageable.

Formation represents model data in forms using objects; keys are control names and values are the control's model values. You can easily represent nested objects by simply nesting one Formation form inside another. The `name` you give to the inner form will be the key in the parent object. You can also represent arrays using Formation's `fmGroup` component.

In order to keep things sane, Formation imposes a few important limitations when working with nested data/forms:

* The top-level form must always be the `fm` component \(form-groups cannot be top-level\) and therefore, the root of your model data must always be an object.
* Form groups may only have forms as direct descendants. In other words, Formation can only model _collections of objects_.
* The top-level of a nested form structure must always be a form. Consequently, the root level of your model data must be an object.
* Nested forms are submitted as a single unit; it is not possible to submit individual child forms.
* The `fm` component delegates model values and configuration data to child forms and controls by matching **object keys** to **form/control names**. However, the `fmGroup` component delegates model values and configuration data to child forms by matching **array indexes** to the form's **position in the template**.

Additionally, the following guidelines should be followed whenever possible to keep managing your form components easy:

* Formation forms delegate to their children whenever possible, so methods like `getModelValues`, `setModelValues`, and `reset` only need to be called from the root-level form controller. You should very rarely need to drill-down to the form controller of a deeply-nested form, though this is possible to do using the `getForm` method.

### Example

Given the following data:

```js
{
  "name": "Jack Dibbert",
  "email": "Jack_Dibbert@gmail.com",
  "phone": "819-032-4356",
  "addresses": [
    {
      "type": "home",
      "streetAddress": "24262 Kertzmann Village",
      "locality": "Mayerberg",
      "administrativeArea": "KS",
      "postalCode": "44194",
      "country": "United States"
    },
    {
      "type": "work",
      "streetAddress": "365 Halvorson Parkway",
      "locality": "Maudeland",
      "administrativeArea": "KS",
      "postalCode": "44197",
      "country": "United States"
    }
  ]
}
```

We can build a Formation form to model it thusly:

```html
<fm name="vm.userForm" controls="vm.controls">
  <fm-input type="text" name="name"></fm-input>
  <fm-input type="email" name="email"></fm-input>
  <fm-input type="tel" name="phone"></fm-input>
  <fm-group name="addresses" repeat="true">
    <fm>
      <fm-input name="streetAddress"></fm-input>
      <fm-input name="locality"></fm-input>
      <fm-select name="administrativeArea"></fm-select>
      <fm-input name="postalCode"></fm-input>
      <fm-select name="country"></fm-select>
    </fm>
  </fm-group>
</fm>
```

There are some important things to note about the above template:

1. We do not need to apply `name` attributes to forms that are direct descendants of a form group; these forms operate based on their position in the template.
2. Notice we only provide **one** address form template, even though we need to model two \(or potentially an unknown number of\) addresses. Because we are working with a collection of uniform objects, we can use the `repeat` attribute on the form group to instruct it to re-use the same template for each member in the collection.



To configure the controls in the repeated forms, we could simply model our configuration object after our data:

```js
function FormCtrl () {
  const vm = this;
  
  vm.controls = {
    name: { /* name config */ },
    email: { /* email config */ },
    phone: { /* phone config */ },
    addresses: [
      {
        // First address form config.
      },
      {
        // Second address form config.
      }
    ]
  };
}
```

But because we don't know how many addresses we'll have to model, a better approach would be to use a separate configuration object for our repeated form:

```html
<fm name="vm.userForm" controls="vm.userControls">
  <fm-input type="text" name="name"></fm-input>
  <fm-input type="email" name="email"></fm-input>
  <fm-input type="tel" name="phone"></fm-input>
  <fm-group name="addresses" repeat="true">
    <fm controls="vm.addressControls">
      <fm-input name="streetAddress"></fm-input>
      <fm-input name="locality"></fm-input>
      <fm-select name="administrativeArea"></fm-select>
      <fm-input name="postalCode"></fm-input>
      <fm-select name="country"></fm-select>
    </fm>
  </fm-group>
</fm>
```

```js
function FormCtrl () {
  const vm = this;
  
  vm.userControls = {
    name: { /* name config */ },
    email: { /* email config */ },
    phone: { /* phone config */ }
  };
  
  vm.addressControls = {
    // Config for each address form.
  };
}
```

With this approach, each address form will receive the same configuration, no matter how many addresses the user has.

A large enough application would likely have a reusable `addressForm` component that provides the template and control configuration for a single Formation address form. In such a case, our template could be further simplified:

```html
<fm name="vm.userForm" controls="vm.userControls">
  <fm-input type="text" name="name"></fm-input>
  <fm-input type="email" name="email"></fm-input>
  <fm-input type="tel" name="phone"></fm-input>
  <fm-group name="addresses" repeat="true">
    <address-form></address-form>
  </fm-group>
</fm>
```



