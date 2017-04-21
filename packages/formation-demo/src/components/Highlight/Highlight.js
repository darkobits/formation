import app from 'app';
import Prism from 'prismjs';
import {Highlight} from './Highlight.scss';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace';


app.component('highlight', {
  bindings: {
    lang: '@',
    code: '<'
  },
  controller ($element) {
    const $ctrl = this;

    Prism.plugins.NormalizeWhitespace.setDefaults({
      'remove-trailing': true,
      'remove-indent': true,
      'left-trim': true,
      'right-trim': true,
      // 'break-lines': 80,
      indent: false,
      'remove-initial-line-feed': true,
      'tabs-to-spaces': 2,
      'spaces-to-tabs': false
    });

    $ctrl.$onChanges = changes => {
      const {code, lang} = changes;

      if (lang) {
        const {currentValue} = lang;
        $element.find('code').addClass(`language-${currentValue}`);
      }

      if (code) {
        const {currentValue} = code;

        $element.find('code').html(currentValue);

        try {
          Prism.highlight($element.find('code'), true);
        } catch (err) {
          // Content may not be highlight-able.
        }
      }
    };
  },
  template: `
    <div class="${Highlight}">
      <pre>
        <code></code>
      </pre>
    </div>
  `
});
