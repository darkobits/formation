# Debugger Component

**Name:** `fmDebugger` (Prefix configurable.)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Shows form state and model values, useful for debugging.

----

This component can help in developing and debugging forms. It will render a small panel which shows the `$pristine`, `$submitted`, `$submitting`, and `$valid` states of the form, as well as the form's model values.

To use, place inside a Formation form:

```html
<fm name="vm.myForm controls="vm.controls">
  <fm-debugger></fm-debugger>
</fm>
```
