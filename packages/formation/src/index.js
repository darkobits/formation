import app from './app';

import './components';

import {
  configure,
  registerControl
} from './etc/config';

import * as $constants from './etc/constants';


// ----- Formation Public API --------------------------------------------------

export {
  $constants
};

export {
  ConfigurableValidator
} from './classes/ConfigurableValidator';

export {
  FormationControl
} from './classes/FormationControl';


const Formation = Object.create(new String(), { // eslint-disable-line no-new-wrappers
  toString: {value: () => app.name}
});


export default Object.assign(Object.create(Formation), {
  configure,
  registerControl
});
