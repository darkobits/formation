import {
  FormController
} from '../../src/components/Form/Form';

import {
  FORM_CONTROLLER
} from '../../src/etc/constants';

import $scope from './$scope.mock';
import $q from './$q.mock';


export default function createForm ({bindings, injectables = {}, ngForm = {}} = {}) {
  // Injectables.
  const i = Object.assign({
    $attrs: {},
    $compile: {},
    $element: {},
    $log: {},
    $parse: {},
    $q,
    $scope,
    $transclude: {}
  }, injectables);

  const form = Object.assign(new FormController(
    i.$attrs,
    i.$compile,
    i.$element,
    i.$log,
    i.$parse,
    i.$q,
    i.$scope,
    i.$transclude
  ), Object.assign(bindings, {
    [FORM_CONTROLLER]: ngForm
  }));

  i.$scope.Form = form;

  return form;
}
