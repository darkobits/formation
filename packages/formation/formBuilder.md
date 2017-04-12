## Form Builder

A data structure like this could be passed to a component, which would then
render a complex form:


- Default "type" is "text".
- Value will be passed to `ng-value` for radio controls.


```js
const form = {component: 'fm', name: 'vm.addressForm', children: [
  // Name Control
  {component: 'fmInput', name: 'name', config: {}},

  // Gender Radio Control
  {component: 'fmInput', type: 'radio', name: 'gender', value: 'M'},
  {component: 'fmInput', type: 'radio', name: 'gender', value: 'F'}

  // Address Form Group
  {component: 'fmGroup', name: 'addresses', children: [

    // Address Form (Repeated Form in Form Group)
    {component: 'fm', config: {}, repeat: true, children: [
      // Street Address Control
      {component: 'fmInput', name: 'streetAddress', config: {}},

      // City Control
      {component: 'fmInput', name: 'city', config: {}},

      // Postal Code Control
      {component: 'fmInput', name: 'postalCode', config: {}}
    ]}
  ]}
]};
```

```html
<fm name="vm.addressForm">
  <fm-input name="name" config=""></fm-input>
  <fm-group name="addresses">
    <fm config="" ng-repeat="address in modelData.addresses">
      <fm-input name="city" config=""></fm-input>
      <fm-input name="postalCode" config=""></fm-input>
    </fm>
  </fm-group>
</fm>
```
