import angular from 'angular';
import ngMessages from 'angular-messages';

import {
  MODULE_NAME
} from './etc/constants';


const module = angular.module(MODULE_NAME, [
  ngMessages
]);


export default module;
