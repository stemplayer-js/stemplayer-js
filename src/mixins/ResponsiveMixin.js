import { ContextProvider } from '@lit/context';
import onResize from '../lib/on-resize.js';
import { responsiveBreakpoints } from '../config.js';
import { displayModeContext } from '../contexts.js';

/**
 * Provider mixin for the parent component that calculates displayMode
 * and provides it to all children via context.
 * Only ONE component in the tree should use this mixin (the parent).
 */
export const ResponsiveMixin = superClass =>
  class extends superClass {
    static get properties() {
      return {
        /**
         * The displayMode determines normal or small screen rendering
         * @private
         */
        displayMode: { state: true },
      };
    }

    /**
     * @function
     * @private
     */
    #onResizeCallback;

    /**
     * @private
     */
    #rafId = null;

    /**
     * @private
     */
    #displayModeProvider;

    constructor() {
      super();
      this.displayMode = 'lg';

      // Set up context provider
      this.#displayModeProvider = new ContextProvider(this, {
        context: displayModeContext,
        initialValue: this.displayMode,
      });
    }

    connectedCallback() {
      super.connectedCallback();
      setTimeout(() => {
        this.#onResizeCallback = onResize(
          this.shadowRoot.firstElementChild,
          () => {
            // Batch the calculation in next frame to avoid layout thrashing
            if (this.#rafId) return;

            this.#rafId = requestAnimationFrame(() => {
              this.#rafId = null;
              this.#recalculateDisplayMode();

              // emit resize event (The window resize event fires if the window is resized -not the element)
              this.dispatchEvent(new Event('resize'));
            });
          },
        );

        // Initial calculation
        this.#recalculateDisplayMode();
      }, 0);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.#onResizeCallback?.un();

      if (this.#rafId) {
        cancelAnimationFrame(this.#rafId);
        this.#rafId = null;
      }
    }

    /**
     * Calculate displayMode based on component width
     * @private
     */
    #recalculateDisplayMode() {
      const { xs, sm } = responsiveBreakpoints;

      const width = this.clientWidth;

      let size = 'lg';

      if (width < sm) size = 'sm';
      if (width < xs) size = 'xs';

      // Only update if changed to avoid unnecessary re-renders
      if (this.displayMode !== size) {
        this.displayMode = size;

        this.#provideDisplayMode();
      }
    }

    /**
     * Provide displayMode to all children via context
     * Updates the ContextProvider value
     * @private
     */
    #provideDisplayMode() {
      // Update the provider value - this triggers consumer callbacks
      this.#displayModeProvider.setValue(this.displayMode);
    }

    /**
     * Recalculate display mode (public API for manual recalculation)
     */
    recalculateDisplayMode() {
      this.#recalculateDisplayMode();
    }
  };
