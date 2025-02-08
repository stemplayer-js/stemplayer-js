import onResize from '../lib/on-resize.js';
import { responsiveBreakpoints } from '../config.js';

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

    constructor() {
      super();
      this.displayMode = 'lg';
    }

    connectedCallback() {
      super.connectedCallback();
      setTimeout(() => {
        this.#onResizeCallback = onResize(
          this.shadowRoot.firstElementChild,
          () => {
            this.recalculateDisplayMode();

            // emit resize event (The window resize event fires if the window is resized -not the element)
            this.dispatchEvent(new Event('resize'));
          },
        );
      }, 0);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.#onResizeCallback?.un();
    }

    /**
     * @private
     */
    recalculateDisplayMode() {
      const { xs, sm } = responsiveBreakpoints;

      let size = 'lg';

      if (this.clientWidth < sm) size = 'sm';
      if (this.clientWidth < xs) size = 'xs';

      this.displayMode = size;
    }
  };
