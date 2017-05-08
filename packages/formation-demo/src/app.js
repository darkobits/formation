import 'angular-ui-router/release/stateEvents';
import 'angular-mocks';
import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import ngMessages from 'angular-messages';
import uiRouter from 'angular-ui-router';

import Formation, {
  FormationConfigurator
} from '@darkobits/formation';


const app = angular.module('App', [
  'ngMockE2E',
  'ui.router.state.events',
  Formation,
  ngAnimate,
  ngAria,
  ngMessages,
  uiRouter
]);


// Set API delay.
app.constant('API_DELAY', 1000);


// Set-up Formation error behavior.
FormationConfigurator({
  showErrorsOn: 'touched, submitted'
});


export default app;
