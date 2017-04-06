import R from 'ramda';

// Note: Consider using Symbols when they are better supported in IE11.


/**
 * Placeholder used in interface definitions to denote any value may be passed.
 *
 * @type {string}
 */
export const Any = 'ANY';


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
 */
export class Interface {
  constructor (name, argTypes) {
    this.name = `@@${name}`;
    this.argTypes = argTypes || [];
  }


  /**
   * Performs simple runtime check on the arguments passed to an interface's
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
          return;
        } else if (this.argTypes[index] && !R.is(this.argTypes[index], arg)) {
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
        // If we're working with a class/constructor function, decorate its
        // prototype. Otherwise, decorate the instance itself.
        const delegate = R.is(Function, obj) ? obj.prototype : obj;

        if (delegate[Interface.name]) {
          throw new Error(`[Interface] Delegate object already implements ${Interface.name}.`);
        }

        if (!R.is(Function, implementation)) {
          throw new Error(`[${Interface.name}] Implementation must be a function.`);
        }

        if (implementation.length < Interface.argTypes.length) {
          throw new Error(`[${Interface.name}] Expected implementation to have arity ${Interface.argTypes.length}.`);
        }

        Object.defineProperty(delegate, Interface.name, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function (...args) {
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


export default {
  Any,
  Interface
};
