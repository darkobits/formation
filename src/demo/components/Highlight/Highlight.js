import Prism from 'prismjs';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js';

import app from 'app';
import {Highlight} from './Highlight.scss';


Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  // 'break-lines': 80,
  'indent': false,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2,
  'spaces-to-tabs': false
});


app.component('highlight', {
  bindings: {
    lang: '@'
  },
  transclude: true,
  template: `
    <div class="${Highlight}">
      <pre>
        <code class="language-{{::$ctrl.lang }}"
          ng-transclude>
        </code>
      </pre>
    </div>
  `
});
