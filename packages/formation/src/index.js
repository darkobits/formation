import app from './app';
import './components';
import * as $constants from './etc/constants';


// ----- Formation Public API --------------------------------------------------

export {
  ConfigurableValidator
} from './classes/ConfigurableValidator';

export {
  FormationControl
} from './classes/FormationControl';

export {
  FormationConfigurator,
  registerControl
} from './etc/config';

// Semi-public, required by the formation-validators package.
export {
  $constants
};


export default app.name;
