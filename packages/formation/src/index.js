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

export {
  onReady
} from './etc/utils';

// Semi-public, used by formation-validators.
export {
  $constants
};


export default app.name;
