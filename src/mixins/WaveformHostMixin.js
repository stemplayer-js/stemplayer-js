/**
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
    #computedWaveformStyles;

    /**
     * Calculates the styles for rendering the waveform
     *
     * @private
     */
    getComputedWaveformStyles() {
      const styles =
        this.#computedWaveformStyles || this.computeWaveformStyles();

      this.#computedWaveformStyles = {
        ...styles,
        waveColor: styles.controlsWaveColor || styles.waveColor,
        waveProgressColor: styles.controlsProgressColor || styles.progressColor,
      };

      return this.#computedWaveformStyles;
    }

    computeWaveformStyles() {
      try {
        // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer.
        // This has the possibility of being unreliable.
        // get some stuff that is not styled by css from css vars anyway (for nice theming)
        const computedStyle = getComputedStyle(this);

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