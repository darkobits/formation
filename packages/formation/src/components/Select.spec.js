import angular from 'angular';

import {
  module,
  directive
} from '@darkobits/unity';

import Formation from 'index';


describe('Select Component', () => {
  let T;

  const options = 'i.value as i.label for i in items';

  const items = [
    {label: 'foo', value: 1},
    {label: 'bar', value: 2}
  ];

  beforeEach(() => {
    module(Formation);

    T = directive('fmSelect', {
      template: `
        <fm-select options="${options}"></fm-select>
      `,
      wrap: `<fm></fm>`,
      scope: {
        items
      }
    });
  });

  it('should set ngOptions correctly', () => {
    expect(T.$element.find('select').attr('ng-options')).toBe(options);

    [...T.$element.find('option')].forEach((optionEl, index) => {
      const label = angular.element(optionEl).text();
      const value = angular.element(optionEl).attr('value');

      // This accounts for the fact that because no model value has been set
      // which matches an available option, Angular will add a null <option> tag
      // with a value of "?" to the top of the <select>.
      if (index === 0) {
        expect(label).toEqual('');
        expect(value).toEqual('?');
      } else {
        expect(label).toEqual(items[index - 1].label);
        expect(value).toEqual(`number:${items[index - 1].value}`);
      }
    });
  });
});
