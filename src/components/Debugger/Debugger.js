import app from 'app';
import templateUrl from './Debugger.html';
import {className} from './Debugger.scss';

import {
  FORM_COMPONENT_NAME
} from 'etc/constants';

import {
  FORM_CONTROLLER
} from 'components/FormationControl';


function DebuggerController () {
  const Debugger = this;

  Debugger.$onInit = () => {
    Debugger.className = className;
    Debugger.$form = Debugger[FORM_CONTROLLER];
  };
}


app.run(Formation => {
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
