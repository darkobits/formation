import {
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from 'etc/constants';

import {
  GetModelValue,
  SetModelValue
} from 'etc/interfaces';


export default class MockControl {
  constructor (ngModelCtrl, formCtrl, formScope) {
    this.name = ngModelCtrl.$name;
    this.getModelValue = this[GetModelValue];
    this.setModelValue = this[SetModelValue];
    this[NG_MODEL_CTRL] = ngModelCtrl;
    this[FORM_CONTROLLER] = formCtrl;

    const cancelWatcher = formScope.$watch(() => ngModelCtrl.$modelValue, newValue => {
      formCtrl.$setModelValue(this.name, newValue);
    });

    formScope.$on('$destroy', cancelWatcher);
  }
}

GetModelValue.implementedBy(MockControl).as(function () {
  return this[FORM_CONTROLLER].$getModelValue(this.name);
});

SetModelValue.implementedBy(MockControl).as(function (n) {}); // eslint-disable-line no-unused-vars
