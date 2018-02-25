import app from 'app';
import R from 'ramda';

import {
  required,
  match,
  email
} from '@darkobits/formation-validators';

import templateUrl from './addressFormDemo.html';
import './addressFormDemo.scss';


app.component('addressFormDemo', {
  controllerAs: 'vm',
  controller ($http, $log, $q, $scope) {
    const vm = this;

    vm.disableForm = false;

    vm.initialData = {
      name: 'Frodo Baggins',
      gender: 'M',
      addresses: [
        {
          type: 'Home',
          streetAddress: '1 Bag End',
          locality: 'The Shire'
        },
        {
          type: 'Work',
          streetAddress: 'asdf1',
          locality: 'foo'
        }
      ]
    };

    // Configuration for root-level controls.
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


    vm.fmReady = form => {
      form.setModelValues(vm.initialData);
    };


    window.setModelValues = obj => {
      $scope.$applyAsync(() => {
        vm.addressForm.setModelValues(obj);
      });
    };

    window.configure = obj => {
      $scope.$applyAsync(() => {
        vm.addressForm.configure(obj);
      });
    };


    vm.submit = modelValues => {
      console.log('[vm.submit] Model:', modelValues);
      /**
       * We can do additional client-side validation here, like checking for
       * inter-model validity (ex: did the user enter the correct postal code for
       * their state, do the user's passwords match) and reject with any custom
       * field errors needed.
       */
      return $http({
        method: 'POST',
        url: '/api',
        data: modelValues
      })
      .then(response => {
        // Request was successful.
        $log.info('[AddressForm] Got API response:', response);
      })
      .catch(err => {
        $log.error('[AddressForm] Got API error:', err);


        /**
         * Let's assume that when this API responds with a "fields" object in the
         * response body, it contains the field name-to-error message mapping
         * described above. If the API returned field errors, pass them back to
         * the form. If not, assign a generic error message to our "apiErrors"
         * control.
         */
        const alternativeError = {
          apiError: 'An unknown error has occurred.'
        };

        if (R.is(String, err.data)) {
          // If we got a simple string error from the API, assign it to our
          // "apiError" control.
          return {
            apiError: err.data
          };
        }

        if (R.is(Object, err.data)) {
          // If we got an object, attempt to return its "fields" property. If it
          // doesn't have a "fields" property, fall back to a generic error
          // message.
          return R.pathOr(alternativeError, ['fields'], err.data);
        }
      });
    };
  },
  templateUrl
});
