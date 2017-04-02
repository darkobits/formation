// Nesting Notes:

// Proposal:

// 1. Controls in a form are always an object.
// 2. Child forms are always an array.
//
// If a form meets the following criteria, it will behave like a form:
// 1. It has at least 1 control.
// 2. It has zero or more child forms.
// 2. It receives an object as its root-level modelValues param.
//
// If a form meets the following criteria, it will behave like a form group:
// 1. It has zero controls.
// 2. It has at least 1 child form.
// 3. It receives an array as its root-level modelValues param.

// Control config can work in a similar way:

vm.controls = {
  foo: { /* config for foo contorl*/ },
  addresses: [
    { /* config for first address form */ },
    { /* config for second address form */ },
    { /* config for third address form */ }
  ]
};



modelValues = {
  // Assign to control "foo" in main form.
  foo: 'bar',
  // First, look for a control named "addresses" in main form. If not found,
  // look for a child form with the name "addresses". If found, pass this array
  // into child form.
  addresses: [
    // Child form "addresses" receives an array as its root-level model values
    // param, and will pass each object in the collection to its array of child
    // forms.
    {
      // The child form, having received an object, assigns "1" to the "name"
      // control.
      name: 1
    },
    {
      name: 2
    },
    {
      name: 3
    }
  ]
};




fm[name="vm.mainForm"]
  fm-input[name="foo"]
  fm[name="addresses"]
    fm[name="0"][ng-repeat]
      fm-input[name="name"]
    fm[name="1"]
      fm-input[name="name"]
    fm[name="2"]
      fm-input[name="name"]


// Future release:
// Add a form-builder that maps the structure of a model to components that will
// be rendered:

// Array: Spec for form/sub-form. ['name', obj/array spec]

// Object: controls/name of sub-form.
// Array: Spec for sub-form.

[
  'fm',
  {
    foo: 'fm-input',
    addresses: [
      'fm', [
        'fm', {
          name: 'fm-input'
        }
      ]
    ]
  }
]
