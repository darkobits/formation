import angular from 'angular';
import 'angular-messages';

import {
  MODULE_NAME
} from 'formation/etc/constants';


const module = angular.module(MODULE_NAME, [
  'ngMessages'
]);


export default module;
