# Working With Model Values

Traditionally when using forms with Angular 1, each control in the form required an `ngModel` directive that indicated to Angular where to write changes to the control's model value, usually to a key on the form's parent controller. The `ngModel` directive also managed two sets of state: the view value and the model value. This meant developers had to reason about **three** sources of truth for each control in their forms: the `ngModel` view value, the `ngModel` model value, and the value in their controller, which could in some cases diverge from the value in `ngModel`. This resulted in controllers that were polluted with bindings for each form control, a situation that compounded when working with nested or dynamically-generated forms.

Formation, on the other hand, takes a more "managed" approach to model values; rather than requiring developers to manually bind each control to an expression using `ngModel`, Formation creates and maintains an internal object keyed by the name of each control in the form. When the form is submitted, this object is passed to the form's `onSubmit` handler. This means _zero_ bindings for model values in controllers and, in most cases, it means that developers will only have to think about model values in `onSubmit` callbacks. Formation also provides APIs for [forms](/components/form.md) and [form controls](/advanced/formation-control.md) that allow model values to be accessed and modified programatically.

This approach allows templates to remain terse and encourages developers to reason about model values as _inputs to_ and _outputs from_ a component \(the form, in this case\) rather than as two-way-bound data.

### Scenario: Receiving Model Values on Submit

The most basic example we can conceive of is a form that begins empty. The user then fills-out the form and presses a submit button. Angular then invokes the form's submit handler \(actually an expression that gets evaluated, like `ngClick`\) making it difficult to pass anything meaningful to this handler without being terribly verbose. Nor does Angular check to see if the form is valid first, result in submit handlers that are laden with boilerplate that ensures the submit should actually continue and that then gathers all the disparate model value bindings attached to the controller into \(usually an\) object to dispatch to an API.

Formation's managed approach to model values means that for most forms, a developer never has to think about binding model values to the controller; an object is simply passed to the form's `onSubmit` handler. Let's look at an example:

**Vanilla Angular Forms:**

```html
<form name="vm.userForm" ng-submit="vm.onSubmit">
  Name: <input name="name" ng-model="vm.name">
  E-Mail: <input name="email" ng-model="vm.email">
  <button type="submit">Submit</button>
</form>
```

```js
function FormCtrl ($http) {
  const vm = this;

  vm.onSubmit = () => {
    if (vm.userForm.$invalid) {
      return;
    } else {
      $http.post('/some/endpoint', {
        name: vm.name,
        email: vm.email
      });
    }
  };
}
```

**Formation Forms:**

```html
<fm on-submit="vm.onSubmit">
  <fm-input name="name">Name:</fm-input>
  <fm-input name="email">E-Mail:</fm-input>
  <button type="submit">Submit</button>
</fm>
```

```js
function FormCtrl ($http) {
  const vm = this;

  vm.onSubmit = modelValues => {
    $http.post('/some/endpoint', modelValues);
  };
}
```

### Scenario: Setting and Resetting to an Initial State

When working with forms, it is often necessary to pull some data from an API, populate a form with it, allow the user to modify this data, then, assuming the modifications are valid, send it back to the API. When a form's initial state is non-empty, we would want a reset button to reset to the initial data; clearing all the values in the form would be frustrate the user, who might think they had just deleted data on the server.

Formation makes it easy to reset forms to an empty state with the form API's `reset` method, but this method can also accept an object \(just like `setModelValues`\) that will reset all validity states on the form to pristine/untouched and then set the model values of each control to the ones provided. And, because Formation **does not bind** to the objects passed via `reset` or `setModelValues`, we don't have to worry about the user mutating the object with our initial state when they interact with the form.

Here's what a resettable form might look like:

```html
<fm name="vm.myForm">
  <!-- Controls go here -->

  <!-- Reset to original values. -->
  <button ng-click="vm.resetForm()">Reset</button>
</fm>
```

```js
function FormCtrl ($http) {
  const vm = this;

  const initialState = {};

  vm.resetForm = () => {
    vm.myForm.reset(initialState);
  };

  vm.$onInit = () => {
    // Disable the form while we load data so as to avoid weird state.
    vm.myForm.disable();

    $http.get('/api/someEndpoint').then(({data}) => {
      // Save the initial state.
      Object.assign(initialState, data);

      // Invoke our reset method to apply this state to the form.
      vm.resetForm();

      // Finally, enable the form.
      vm.formationForm.enable();
    });
  };
});
```

This behavior is made possible because Formation deep-clones data when setting model values, thereby abstracting the two-way-bound paradigm behind Formation's API, allowing developers to reason about forms in a more unidirectional paradigm: data in via `setModelValues` or `reset`, data out via `getModelValues` or `onSubmit`.

