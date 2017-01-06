import app from 'app';
import R from 'ramda';

import {
  required,
  minLength,
  pattern
} from 'formation/etc/validators';

import templateUrl from './addressFormDemo.html';


app.component('addressFormDemo', {
  controllerAs: 'vm',
  controller: function ($log, Api) {
    const vm = this;

    vm.controls = {
      name: {
        validators: {
          required,
          minLength: minLength(6)
        },
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
          pattern: pattern(/^(\d{5})([-]\d{4})?$/g)
        },
        errors: [
          ['required', 'This field is required.'],
          ['pattern', 'Please enter a valid U.S. postal code.']
        ]
      }
    };

    vm.states = [
      {
        name: 'Alabama',
        abbreviation: 'AL'
      },
      {
        name: 'Alaska',
        abbreviation: 'AK'
      },
      {
        name: 'American Samoa',
        abbreviation: 'AS'
      },
      {
        name: 'Arizona',
        abbreviation: 'AZ'
      },
      {
        name: 'Arkansas',
        abbreviation: 'AR'
      },
      {
        name: 'California',
        abbreviation: 'CA'
      },
      {
        name: 'Colorado',
        abbreviation: 'CO'
      },
      {
        name: 'Connecticut',
        abbreviation: 'CT'
      },
      {
        name: 'Delaware',
        abbreviation: 'DE'
      },
      {
        name: 'District Of Columbia',
        abbreviation: 'DC'
      },
      {
        name: 'Federated States Of Micronesia',
        abbreviation: 'FM'
      },
      {
        name: 'Florida',
        abbreviation: 'FL'
      },
      {
        name: 'Georgia',
        abbreviation: 'GA'
      },
      {
        name: 'Guam',
        abbreviation: 'GU'
      },
      {
        name: 'Hawaii',
        abbreviation: 'HI'
      },
      {
        name: 'Idaho',
        abbreviation: 'ID'
      },
      {
        name: 'Illinois',
        abbreviation: 'IL'
      },
      {
        name: 'Indiana',
        abbreviation: 'IN'
      },
      {
        name: 'Iowa',
        abbreviation: 'IA'
      },
      {
        name: 'Kansas',
        abbreviation: 'KS'
      },
      {
        name: 'Kentucky',
        abbreviation: 'KY'
      },
      {
        name: 'Louisiana',
        abbreviation: 'LA'
      },
      {
        name: 'Maine',
        abbreviation: 'ME'
      },
      {
        name: 'Marshall Islands',
        abbreviation: 'MH'
      },
      {
        name: 'Maryland',
        abbreviation: 'MD'
      },
      {
        name: 'Massachusetts',
        abbreviation: 'MA'
      },
      {
        name: 'Michigan',
        abbreviation: 'MI'
      },
      {
        name: 'Minnesota',
        abbreviation: 'MN'
      },
      {
        name: 'Mississippi',
        abbreviation: 'MS'
      },
      {
        name: 'Missouri',
        abbreviation: 'MO'
      },
      {
        name: 'Montana',
        abbreviation: 'MT'
      },
      {
        name: 'Nebraska',
        abbreviation: 'NE'
      },
      {
        name: 'Nevada',
        abbreviation: 'NV'
      },
      {
        name: 'New Hampshire',
        abbreviation: 'NH'
      },
      {
        name: 'New Jersey',
        abbreviation: 'NJ'
      },
      {
        name: 'New Mexico',
        abbreviation: 'NM'
      },
      {
        name: 'New York',
        abbreviation: 'NY'
      },
      {
        name: 'North Carolina',
        abbreviation: 'NC'
      },
      {
        name: 'North Dakota',
        abbreviation: 'ND'
      },
      {
        name: 'Northern Mariana Islands',
        abbreviation: 'MP'
      },
      {
        name: 'Ohio',
        abbreviation: 'OH'
      },
      {
        name: 'Oklahoma',
        abbreviation: 'OK'
      },
      {
        name: 'Oregon',
        abbreviation: 'OR'
      },
      {
        name: 'Palau',
        abbreviation: 'PW'
      },
      {
        name: 'Pennsylvania',
        abbreviation: 'PA'
      },
      {
        name: 'Puerto Rico',
        abbreviation: 'PR'
      },
      {
        name: 'Rhode Island',
        abbreviation: 'RI'
      },
      {
        name: 'South Carolina',
        abbreviation: 'SC'
      },
      {
        name: 'South Dakota',
        abbreviation: 'SD'
      },
      {
        name: 'Tennessee',
        abbreviation: 'TN'
      },
      {
        name: 'Texas',
        abbreviation: 'TX'
      },
      {
        name: 'Utah',
        abbreviation: 'UT'
      },
      {
        name: 'Vermont',
        abbreviation: 'VT'
      },
      {
        name: 'Virgin Islands',
        abbreviation: 'VI'
      },
      {
        name: 'Virginia',
        abbreviation: 'VA'
      },
      {
        name: 'Washington',
        abbreviation: 'WA'
      },
      {
        name: 'West Virginia',
        abbreviation: 'WV'
      },
      {
        name: 'Wisconsin',
        abbreviation: 'WI'
      },
      {
        name: 'Wyoming',
        abbreviation: 'WY'
      }
    ];


    vm.submit = modelValues => {

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
      .catch(response => {
        $log.log('[AddressForm] Got API error:', response);

        /**
         * Let's assume that when this API responds with a "fields" object in the
         * response body, it contains the field name-to-error message mapping
         * described above. If the API returned field errors, pass them back to
         * the form. If not, assign a generic error message to our "apiErrors"
         * control.
         */
        const alternativeError = {
          apiErrors: 'An unknown error has occurred.'
        };

        return R.pathOr(alternativeError, ['data', 'fields'], response);
      });
    };

    vm.isFormDisabled = () => {
      return vm.disableForm;
    };


    window.getForm = () => {
      return vm.addressForm;
    };


    vm.reset = () => {
      vm.addressForm.reset({
        name: null,
        streetAddress: null,
        locality: null,
        state: null,
        postalCode: null
      });
    };
  },
  templateUrl: templateUrl
});
