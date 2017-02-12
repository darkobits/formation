import formationModule from 'formation/module';
import templateUrl from './Debugger.html';
import {className} from './Debugger.scss';

import {
  FORM_COMPONENT_NAME
} from 'formation/etc/constants';

import {
  FORM_CONTROLLER
} from 'formation/components/FormationControl';


function DebuggerController () {
  const Debugger = this;

  Debugger.$onInit = () => {
    Debugger.className = className;
    Debugger.$form = Debugger[FORM_CONTROLLER];
  };
}


formationModule.run(Formation => {
  const NAME = Formation.$getPrefixedName('Debugger');

  Formation.$registerComponent(NAME, {
    require: {
      [FORM_CONTROLLER]: `^^${FORM_COMPONENT_NAME}`
    },
    controller: DebuggerController,
    controllerAs: 'Debugger',
    templateUrl
  });
});
