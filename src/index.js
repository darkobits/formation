import module from './app';

import './components';
import './filters';

// Re-export configurator.
export {
  FormationConfigurator
} from './etc/config';

export default module.name;


/**
 * TODO:
 *
 * - Make a ConfigurableValidator class.
 */
