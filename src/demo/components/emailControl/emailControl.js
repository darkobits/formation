import app from 'app';
import {email} from 'formation/etc/validators';


app.component('emailControl', {
  bindings: {
    name: '@'
  },
  transclude: true,
  controller: function () {
    const Email = this;

    Email.$onInit = () => {
      Email.label = 'E-mail address:';
      Email.placeholder = 'user@example.com';
      Email.config = {
        validators: {
          email
        },
        errors: [
          ['required', 'Please provide your e-mail address.'],
          ['email', 'Please enter a valid e-mail address.']
        ]
      };
    };
  },
  controllerAs: 'Email',
  template: `
    <section>
      <fm-input name="{{::Email.name }}"
        type="text"
        placeholder="{{::Email.placeholder }}"
        data-config="::Email.config">
        <span ng-transclude>
          {{::Email.label }}
        </span>
      </fm-input>
      <fm-errors for="{{::Email.name }}"></fm-errors>
    </section>
  `
});
