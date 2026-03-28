import { ContextConsumer } from '@lit/context';
import { playerStateContext } from '../contexts.js';

export const PlayerStateConsumerMixin = superClass =>
  class extends superClass {
    constructor() {
      super();

      this._playerStateConsumer = new ContextConsumer(this, {
        context: playerStateContext,
        callback: state => {
          if (state !== undefined) {
            // Apply all player state properties automatically
            // Doing this means Lit will batch updates if multiple properties are set
            for (const key of Object.keys(state)) {
              try {
                this[key] = state[key];
              } catch (e) {
                // Safely ignore getter-only properties (like 'peaks' on StemPlayerStem)
              }
            }
          }
        },
        subscribe: true,
      });
    }
  };
