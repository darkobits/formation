export default {
  first: {
    lang: 'html',
    content: `
      <div class="foo">
        This is some HTML.
      </div>
    `
  },
  addressTemplate: {
    lang: 'html',
    content: `
      <fm name="vm.addressForm"
        controls="vm.controls"
        show-errors-on="touched, submitted"
        on-submit="vm.submit">
        <div>
          <fm-input name="name">Name</fm-input>
          <fm-errors for="name"></fm-errors>
        </div>
        <div>
          <fm-input name="streetAddress">Address</fm-input>
          <fm-errors for="streetAddress"></fm-errors>
        </div>
        <div>
          <fm-input name="locality">City</fm-input>
          <fm-errors for="locality"></fm-errors>
        </div>
        <div>
          <fm-select name="state"
            options="state.value as state.label for state in vm.states">
            State
          </fm-select>
          <fm-errors for="state"></fm-errors>
        </div>
        <div>
          <fm-input name="postalCode">Postal Code</fm-input>
          <fm-errors for="postalCode"></fm-errors>
        </div>
        <button type="submit">Submit</button>
      </fm>
    `
  },
  addressController: {
    lang: 'js',
    content: `
      // A reference to our Angular module instance.
      import app from 'app';

      // Formation provides several common validators.
      import {
        required,
        minLength,
        pattern
      } from '@darkobits/formation/etc/validators';

      app.controller('MyCtrl', function () {
        const vm = this;

        vm.controls = {
          // Each key here corresponds to the control name we used in the template.
          name: {
            // Make this field required, and ensure the user enters at least 6 characters.
            validators: {
              required,
              minLength: minLength(6)
            },
            // Error messages are just arrays of validation key/message pairs.
            errors: [
              ['required', 'This field is required.'],
              ['minLength', 'Please enter at least 6 characters.']
            ]
          },
          streetAddress: {
            validators: {required},
            errors: [
              ['required', 'This field is required.']
            ]
          },
          locality: {
            validators: {required},
            errors: [
              ['required', 'This field is required.']
            ]
          },
          state: {
            validators: {required},
            errors: [
              ['required', 'This field is required.']
            ]
          },
          postalCode: {
            validators: {
              required,
              // Require a valid U.S. postal code on this field.
              pattern: pattern(/(\\d{5}([-]\\d{4})?)/g)
            },
            errors: [
              ['required', 'This field is required.'],
              ['pattern', 'Please enter a valid U.S. postal code.']
            ]
          }
        };

        vm.states = [/* State data. */];

        vm.submit = modelValues => {
          // Do something with modelValues here.
        };
      });
    `
  }
};
