import { ContextConsumer } from '@lit/context';
import { displayModeContext } from '../contexts.js';

/**
 * Consumer mixin for child components that receive displayMode from a parent provider.
 * Children should use this instead of ResponsiveMixin to avoid redundant resize observers.
 */
export const ResponsiveConsumerMixin = superClass =>
  class extends superClass {
    static get properties() {
      return {
        /**
         * The displayMode determines normal or small screen rendering
         * Consumed from parent via context
         * @private
         */
        displayMode: { state: true },
      };
    }

    constructor() {
      super();
      this.displayMode = 'lg'; // default until context provides value

      // Create context consumer that subscribes to displayMode changes
      this._displayModeConsumer = new ContextConsumer(this, {
        context: displayModeContext,
        callback: value => {
          if (value !== undefined) {
            this.displayMode = value;
          }
        },
        subscribe: true, // Subscribe to updates
      });
    }
  };
