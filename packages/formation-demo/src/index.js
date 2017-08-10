import 'babel-polyfill';

import angular from 'angular';
import './states';
import './components';
import './etc';
import './services';

import 'etc/style/global.scss';

console.info('Angular version:', angular.version.full);
console.info(`Using formation@${webpack.FORMATION_VERSION}.`); // eslint-disable-line no-undef
