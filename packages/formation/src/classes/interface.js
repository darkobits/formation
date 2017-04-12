// ----- Interface -------------------------------------------------------------

/**
 * Placeholder used in interface definitions to denote any value may be passed.
 *
 * @type {string}
 */
export const Any = 'ANY';


/**
 * Determines if 'value' is an instance of 'constructor'.
 *
 * @private
 *
 * @param  {object} constructor
 * @param  {*} value
 * @return {boolean}
 */
function is (constructor, value) {
  return value !== null && (value.constructor === constructor || value instanceof constructor);
}


/**
 * Provides a fluent API for registering interface implementations on classes.
 * Enforces naive runtime checks to ensure interfaces are used as intended.
 *
 * @example
 *
 * // Create a new interface, Foo, that should be invoked with one string
 * // argument.
 * const Foo = new Interface('Foo', [String]);
 *
 * class Bar { }
 *
 * // Bar can then implement Foo:
 * Foo.implementedBy(Bar).as(function (str) {
 *   // 'this' is bound to the current instance of Bar.
 *   // Do something with 'str'.
 * });
 *
 * // The interface can then be used thusly:
 * const myBar = new Bar();
 * myBar[Foo]('baz');
 *
 * @example
 *
 * // You can also implement interfaces directly on objects, rather than
 * // prototypes. This is advantageous when using constructor functions that use
 * // private data/methods that the interface needs access to.
 *
 * function Bar () {
 *   // Private data.
 *   var foo = '';
 *
 *   this.getFoo = () => {
 *     return foo;
 *   };
 *
 *   Foo.implementedBy(this).as(function (str) {
 *     // Mutate private data.
 *     this.foo = str;
 *   });
 * }
 *
 * const myBar = new Bar();
 * myBar[Foo]('baz');
 */
export default class Interface {
  constructor (name, argTypes) {
    if (!is(String, name)) {
      throw new Error([
        '[Interface] Constructor expected argument 1 to be of type "String"',
        `but got "${typeof name}".`
      ].join(' '));
    }

    if (argTypes && !is(Array, argTypes)) {
      throw new Error([
        '[Interface] Constructor expected argument 2 to be undefined or of type',
        `"Array" but got "${typeof argTypes}".`
      ].join(' '));
    }

    this.name = `@@${name}`;
    this.argTypes = argTypes || [];
  }


  /**
   * Performs a simple runtime check on the arguments passed to an interface's
   * implementation.
   *
   * @param  {arglist} args
   * @return {boolean} - True if the arguments are valid.
   */
  checkArguments (...args) {
    if (args && args.length >= this.argTypes.length) {
      args.forEach((arg, index) => {
        if (this.argTypes[index] === Any) {
          // Simple arity-check using Any as a placeholder.
        } else if (this.argTypes[index] && !is(this.argTypes[index], arg)) {
          throw new Error([
            `[${this.name}]`,
            `Expected argument ${index + 1} to be of type "${this.argTypes[index].name}"`,
            `but got "${typeof arg}".`
          ].join(' '));
        }
      });

      return true;
    }

    throw new Error([
      `[${this.name}]`,
      `Must be invoked with at least ${this.argTypes.length}`,
      `argument${this.argTypes.length > 1 ? 's' : ''}.`
    ].join(' '));
  }


  /**
   * Accepts an object, constructor function, or class and returns an object
   * which provides the 'as' method, which is then passed the interface
   * implementation for the provided object.
   *
   * @param  {object|function|class} obj
   * @return {object}
   */
  implementedBy (obj) {
    const Interface = this;

    return {
      as: implementation => {
        // If we're working with a class/constructor function, use its
        // prototype. Otherwise, use the instance itself.
        const delegate = is(Function, obj) ? obj.prototype : obj;

        if (delegate[Interface.name]) {
          throw new Error(`[Interface] Delegate object already implements ${Interface.name}.`);
        }

        if (!is(Function, implementation)) {
          throw new Error(`[${Interface.name}] Implementation must be a function.`);
        }

        // Implementations must accept at least as many arguments as the
        // interface specifies.
        if (implementation.length < Interface.argTypes.length) {
          throw new Error(`[${Interface.name}] Expected implementation to have arity ${Interface.argTypes.length}.`);
        }

        Object.defineProperty(delegate, Interface.name, {
          enumerable: false,
          configurable: false,
          writable: true,
          value (...args) {
            if (Interface.checkArguments(...args)) {
              return implementation.call(this, ...args);
            }
          }
        });
      }
    };
  }


  /**
   * Implement a toString method that returns the interface's name. This allows
   * the interface instance to be used directly as a method name on objects that
   * implement it.
   *
   * @return {string}
   */
  toString () {
    return this.name;
  }
}
