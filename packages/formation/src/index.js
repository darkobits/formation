import app from './app';

import './components';

import {
  configure,
  registerControl
} from './etc/config';

import * as $constants from './etc/constants';


// ----- Formation Public API --------------------------------------------------

export {
  $constants,
  configure,
  registerControl
};

export {
  ConfigurableValidator
} from './classes/ConfigurableValidator';

export {
  FormationControl
} from './classes/FormationControl';


export default app.name;
