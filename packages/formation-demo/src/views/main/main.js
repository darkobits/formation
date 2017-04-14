import app from 'app';
import templateUrl from './main.html';
import './main.scss';

import './addressFormDemo/addressFormDemo';
import codeBlocks from './codeBlocks';


function MainCtrl () {
  const vm = this;

  vm.codeBlocks = codeBlocks;
}


app.component('mainComponent', {
  controllerAs: 'vm',
  controller: MainCtrl,
  templateUrl
});


export default 'mainComponent';
