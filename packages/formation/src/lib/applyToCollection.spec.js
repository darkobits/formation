import {prop} from 'ramda';
import applyToCollection from './applyToCollection';


describe('applyToCollection', () => {
  const item = id => ({
    id,
    setName (name) {
      this.name = name;
    }
  });

  const collection = [
    item(1),
    item(2)
  ];

  const data = {
    1: 'foo',
    2: 'bar'
  };

  it('should apply data to each member of the collection', () => {
    applyToCollection(collection, prop('id'), 'setName', data);
    expect(collection[0].name).toEqual('foo');
    expect(collection[1].name).toEqual('bar');
  });
});
