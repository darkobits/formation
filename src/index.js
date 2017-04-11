import app from './app';
import './components';
import './filters';


// ----- Public Exports --------------------------------------------------------

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

export default app.name;
