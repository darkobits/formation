import app from './app';
import './components';
import './filters';


// Re-export configurator and registerControl.
export {
  FormationConfigurator,
  registerControl
} from './etc/config';


export default app.name;
