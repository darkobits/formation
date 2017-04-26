import app from 'app';

import {
  required,
  match,
  email
} from '@darkobits/formation-validators';

import {
  onReady
} from '@darkobits/formation';

import templateUrl from './addressFormDemo.html';


app.component('addressFormDemo', {
  controllerAs: 'vm',
  controller ($log, $q, $scope, $timeout, Api) {
    const vm = this;

    vm.disableForm = false;

    // // Configuration for root-level controls.
    vm.controls = {
      name: {
        validators: {
          required
        },
        errors: [
          ['required', 'This field is required.']
        ]
      },
      email: {
        validators: {
          required,
          email
        },
        errors: [
          ['required', 'This field is required.'],
          ['email', 'Please enter a valid e-mail address.'],
          ['match', 'E-mail addresses must match.']
        ]
      },
      emailMatch: {
        validators: {
          required,
          email,
          match: match('email')
        },
        errors: [
          ['required', 'This field is required.'],
          ['email', 'Please enter a valid e-mail address.'],
          ['match', 'E-mail addresses must match.']
        ]
      },
      gender: {
        validators: {
          required
        },
        errors: [
          ['required', 'This field is required.']
        ]
      }
    };

    // // Configuration for controls in each address form.
    vm.addressFormControls = {
      streetAddress: {
        validators: {
          required
        },
        errors: [
          ['required', 'This field is required.']
        ]
      },
      locality: {
        validators: {
          required
        },
        errors: [
          ['required', 'This field is required.']
        ]
      }
    };


    vm.$onInit = () => {
      onReady(vm, 'addressForm').then(form => {
        form.setModelValues({
          name: 'Frodo Baggins',
          gender: 'M',
          addresses: [
            {
              streetAddress: '1 Bag End',
              locality: 'The Shire'
            },
            // null
          ]
        });
      });
    };


    window.setModelValues = obj => {
      $scope.$applyAsync(() => {
        vm.addressForm.setModelValues(obj);
      });
    };


    vm.modelCollection = [
      {
        name: 'foo'
      },
      {
        name: 'bar'
      },
      {
        name: 'baz'
      }
    ];


    vm.foo = 'bar';


    vm.submit = modelValues => {
      console.log('[vm.submit] Model:', modelValues);
      /**
       * We can do additional client-side validation here, like checking for
       * inter-model validity (ex: did the user enter the correct postal code for
       * their state, do the user's passwords match) and reject with any custom
       * field errors needed.
       */

      return Api.req({
        method: 'POST',
        url: '/api',
        data: modelValues
      })
      .then(response => {
        // Request was successful.
        $log.info('[AddressForm] Got API response:', response);
      })
      .catch(err => {
        $log.log('[AddressForm] Got API error:', err);

        return {
          name: 'Bad name.',
          group: [
            null,
            {
              name: 'Bad nested name.'
            }
          ]
        };

        /**
         * Let's assume that when this API responds with a "fields" object in the
         * response body, it contains the field name-to-error message mapping
         * described above. If the API returned field errors, pass them back to
         * the form. If not, assign a generic error message to our "apiErrors"
         * control.
         */
        // const alternativeError = {
        //   apiErrors: 'An unknown error has occurred.'
        // };

        // return R.pathOr(alternativeError, ['data', 'fields'], err);
      });
    };


    vm.isFormDisabled = () => {
      return vm.disableForm;
    };


    vm.reset = () => {
      vm.addressForm.reset({
        name: 'N/A',
        gender: 'M',
        bar: {
          name: 'N/A',
          gender: 'F'
        },
        baz: {
          name: null
        }
      });
    };
  },
  templateUrl
});
