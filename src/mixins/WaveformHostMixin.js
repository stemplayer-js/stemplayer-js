import { waveform } from '../config.js';

/**
 * A component to render a single stem
 *
 * @cssprop [--stemplayer-js-controls-color]
 * @cssprop [--stemplayer-js-controls-background-color]
 */
export const WaveformHostMixin = superClass =>
  class extends superClass {
    /**
     * Cached computed styles. Cached on firstUpdated and invalidated only on resize
     * @private
     */
    #cachedWaveformStyles = null;

    /**
     * ResizeObserver to detect when the component's size changes
     * @private
     */
    #resizeObserver = null;

    connectedCallback() {
      super.connectedCallback();

      // Set up resize observer to invalidate cache when component size changes
      if (!this.#resizeObserver) {
        this.#resizeObserver = new ResizeObserver(() => {
          // Invalidate cache on resize
          this.#cachedWaveformStyles = null;
        });
      }

      this.#resizeObserver.observe(this);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this.#resizeObserver) {
        this.#resizeObserver.disconnect();
      }
    }

    /**
     * Calculates the styles for rendering the waveform
     * Results are cached until the component is resized
     *
     * @private
     */
    getComputedWaveformStyles() {
      const styles = this.computeWaveformStyles();

      return {
        ...styles,
        waveColor: styles.controlsWaveColor || styles.waveColor,
        waveProgressColor: styles.controlsProgressColor || styles.progressColor,
      };
    }

    /**
     * Computes waveform styles from CSS custom properties
     * Results are cached per resize to avoid expensive getComputedStyle calls
     * @private
     */
    computeWaveformStyles() {
      try {
        // Cache computed styles to avoid expensive getComputedStyle calls
        // Re-computed only on resize via ResizeObserver
        if (!this.#cachedWaveformStyles) {
          const computedStyle = getComputedStyle(this);

          this.#cachedWaveformStyles = {
            waveColor:
              computedStyle.getPropertyValue(
                '--stemplayer-js-waveform-color',
              ) || waveform.waveColor,
            progressColor:
              computedStyle.getPropertyValue(
                '--stemplayer-js-waveform-progress-color',
              ) || waveform.progressColor,
            barWidth:
              computedStyle.getPropertyValue(
                '--stemplayer-js-waveform-bar-width',
              ) || waveform.barWidth,
            barGap:
              computedStyle.getPropertyValue(
                '--stemplayer-js-waveform-bar-gap',
              ) || waveform.barGap,
            pixelRatio:
              computedStyle.getPropertyValue(
                '--stemplayer-js-waveform-pixel-ratio',
              ) || waveform.pixelRatio,
            controlsWaveColor:
              computedStyle.getPropertyValue(
                '--stemplayer-js-controls-waveform-color',
              ) || waveform.controlsWaveColor,
            controlsProgressColor:
              computedStyle.getPropertyValue(
                '--stemplayer-js-controls-waveform-progress-color',
              ) || waveform.controlsProgressColor,
          };
        }

        return this.#cachedWaveformStyles;
      } catch (err) {
        console.debug('Could not use computed waveform styles', err);
      }

      return waveform;
    }
  };
