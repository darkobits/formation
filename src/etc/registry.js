import R from 'ramda';


/**
 * Manages collections of controls and forms, provides utility methods for
 * ingesting and extracting data. Facilitates DRY-ing up other controllers and
 * components.
 *
 * @param {string} [ID_KEY] - Key in members used to match against when
 *   ingesting object data.
 */
export default function Registry (ID_KEY) {
  const Registry = this;


  /**
   * Tracks objects in the registry.
   *
   * @private
   *
   * @type {array}
   */
  let REGISTRY = [];


  /**
   * Adds a new member to the registry.
   *
   * @param  {object|array} newMember
   */
  Registry.insert = newMember => {
    if (!R.is(Object, newMember)) {
      throw new Error('NON_OBJECT_INSERT');
    }

    REGISTRY.push(newMember);
  };


  /**
   * Returns the first member that satisfies the provided predicate function.
   *
   * @param  {function} fn
   * @return {object|array}
   */
  Registry.find = fn => {
    return R.find(fn, REGISTRY);
  };


  /**
   * Removes all members that satisfy the provided predicate function.
   *
   * @param  {function} fn
   */
  Registry.removeWith = fn => {
    REGISTRY = R.reject(fn, REGISTRY);
  };


  /**
   * Removes the provided member from the registry.
   *
   * @param  {object|array} item
   */
  Registry.remove = item => {
    Registry.removeWith(i => i === item);
  };


  /**
   * Returns a copy of registry data having applied each member to the provided
   * function.
   *
   * @param  {function} fn
   * @return {array}
   */
  Registry.map = fn => {
    return R.map(fn, REGISTRY);
  };


  /**
   * Similar to R.pluck, but supports invoking methods on registry members.
   *
   * @param  {string} methodOrPropertyName
   * @return {array}
   */
  Registry.pluck = methodOrPropertyName => {
    return Registry.map(i => {
      if (R.is(Function, i[methodOrPropertyName])) {
        return i[methodOrPropertyName]();
      }

      return i[methodOrPropertyName];
    });
  };


  /**
   * Returns an object representation of the registry with each key
   * corresponding to each member's ID_KEY, and each value being the member or
   * the result of calling the provided function on the member.
   *
   * @example
   *
   * const reg = new Registry('name');
   *
   * reg.insert({name: 'foo', value: 12});
   * reg.insert({name: 'bar', value: 24});
   *
   * const values = reg.toMap(R.prop('value')) //=> {foo: 12, bar: 24}
   *
   * @param  {function} fn
   * @return {object}
   */
  Registry.toMap = fn => {
    return REGISTRY.reduce((obj, member, index) => {
      return Object.assign(obj, {
        [ID_KEY ? member[ID_KEY] : index]: fn ? fn(member) : member
      });
    }, {});
  };


  /**
   * Accepts an object or array, and calls the provided function with each
   * entry in the data set and its matching registry member. The callback can
   * then be used to update members using the data fragment. This function is
   * auto-curried.
   *
   * If an array is supplied as data, entries and members are matched by index.
   *
   * If an object is supplied as data, entries and members are matched by keys
   * in 'data' and the value of members' ID_KEY.
   *
   * @example
   *
   * const reg = new Registry('name');
   * reg.insert({name: 'foo'});
   * reg.insert({name: 'bar'});
   *
   * const updateNames = reg.ingest((member, newName) => member.name = newName);
   * updateNames(['newFoo', 'newBar']);
   *
   * @example
   *
   * const reg = new Registry('name');
   * reg.insert({name: 'foo', value: 1});
   * reg.insert({name: 'bar', value: 2});
   *
   * const updateValues = reg.ingest((member, {value}) => member.value = value);
   *
   * updateValues({
   *   // ID_KEY is 'name', so this will match all members with a 'name' of foo,
   *   // and our callback will then set their 'value' to the value here.
   *   foo: {
   *     value: 10
   *   }
   * });
   *
   * @param  {function} - Callback invoked with each entry in the ingested data
   *   set and the relevant registry member.
   */
  Registry.ingest = R.curry((fn, data) => {
    // If ingesting an array, match data and registry members by their indexes.
    const isArray = Array.isArray(data);

    // If no ID_KEY was used, we can only ingest arrays.
    if (!isArray && !ID_KEY) {
      throw new Error('NO_ID_KEY');
    }

    // For each entry in data, find the desired registry member to update and
    // pass it to the provided callback with its matching data.
    R.forEach(([keyOrIndex, data]) => {
      const members = isArray ? [REGISTRY[keyOrIndex]] : R.filter(member => {
        return String(member[ID_KEY]) === String(keyOrIndex);
      }, REGISTRY);

      // For each matching member, invoke the provided callback with the member
      // and the data fragment.
      R.forEach(member => {
        try {
          fn(member, data);
        } catch (err) {
          const match = err.message.match(/^member\.(\S+) is not a function$/);

          if (match) {
            // Throw more informative error for members that don't have a method.
            throw new Error(`[Registry] Member does not implement method "${match[1]}"`);
          } else {
            throw err;
          }
        }
      }, members);
    }, Object.entries(data));
  });
}
