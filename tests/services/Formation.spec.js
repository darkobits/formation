import NgUnit from '../helpers';
import '../../src/index';


describe('Formation Provider/Service', () => {
  let T;

  beforeEach(() => {
    T = new NgUnit();
    T.prepareModule('Formation');
    T.prepareProvider('FormationProvider');
    T.prepareService('Formation');
  });

  describe('#setPrefix / $getPrefixedName', () => {
    it('should return a prefixed name', () => {
      let [prefix, name] = ['foo', 'Bar'];

      T.spec.FormationProvider.setPrefix(prefix);
      let prefixedName = T.spec.Formation.$getPrefixedName(name);

      expect(prefixedName).toBe(`${prefix}${name}`);
    });
  });

  describe('#showErrorsOn / $getShowErrorsOnStr', () => {
    it('should save and return the configured value', () => {
      let showErrorsOn = 'foo, bar';

      T.spec.FormationProvider.showErrorsOn(showErrorsOn);

      expect(T.spec.Formation.$getShowErrorsOnStr()).toBe(showErrorsOn);
    });
  });

  describe('#getRegisteredComponents / $registerComponent / $registerDirective', () => {
    it('should return a list of registered directives/components', () => {
      let [directive, component] = ['foo', 'bar'];

      T.spec.Formation.$registerDirective(directive, () => {});
      T.spec.Formation.$registerDirective(component, () => {});

      expect(T.spec.FormationProvider.getRegisteredComponents()).toEqual(expect.arrayContaining([directive, component]));
    });
  });

  describe('$getNextId', () => {
    it('should increment the counter', () => {
      [0, 1, 2, 3, 4, 5].forEach(value => {
        expect(T.spec.Formation.$getNextId()).toBe(value);
      });
    });
  });
});
