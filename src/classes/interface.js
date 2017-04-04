import R from 'ramda';


/**
 * Placeholder used in interface definitions to denote any value may be passed.
 *
 * @type {string}
 */
export const Any = 'Any';


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
 * // Bar can them implement Foo:
 * Foo.implementedBy(Bar).as(function (str) {
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

  test (...args) {
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
            if (Interface.test(...args)) {
              return implementation.call(this, ...args);
            }
          }
        });
      }
    };
  }

  toString () {
    return this.name;
  }
}


export default {
  Any,
  Interface
};
