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
     * @private
     */
    #computedStyle;

    /**
     * Calculates the styles for rendering the waveform
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

    computeWaveformStyles() {
      try {
        // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer.
        // This has the possibility of being unreliable.
        // get some stuff that is not styled by css from css vars anyway (for nice theming)
        if (!this.#computedStyle) {
          this.#computedStyle = getComputedStyle(this);
          setTimeout(() => {
            this.#computedStyle = null;
          }, 1000);
        }

        const computedStyle = this.#computedStyle;

        return {
          waveColor:
            computedStyle.getPropertyValue('--stemplayer-js-waveform-color') ||
            waveform.waveColor,
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
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug('Could not use computed waveform styles', err);
      }

      return waveform;
    }
  };
