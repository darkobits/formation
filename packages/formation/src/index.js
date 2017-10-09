import {
  configure,
  registerControl
} from 'etc/config';

import * as $constants from 'etc/constants';

import app from './app';

import './components';


// ----- Formation Public API --------------------------------------------------

export {
  $constants,
  configure,
  registerControl
};

export {
  ConfigurableValidator
} from 'classes/ConfigurableValidator';

export {default as FormationControl} from 'classes/FormationControl';


export default app.name;
