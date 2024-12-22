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
import { html, css } from 'lit';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import formatSeconds from './lib/format-seconds.js';
import { defaults } from './config.js';
import { computeWaveformStyles } from './lib/compute-styles.js';
import debounce from './lib/debounce.js';

/**
 * A component to render a single stem
 *
 * @cssprop [--stemplayer-js-controls-color]
 * @cssprop [--stemplayer-js-controls-background-color]
 * @cssprop [--stemplayer-js-controls-waveform-color]
 * @cssprop [--stemplayer-js-controls-waveform-progress-color]
 */
export class SoundwsStemPlayerControls extends ResponsiveLitElement {
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      css`
        :host {
          --soundws-player-button-color: var(
            --stemplayer-js-controls-color,
            var(--stemplayer-js-color, white)
          );
          display: block;
          color: var(--stemplayer-js-controls-color, inherit);
          background-color: var(--stemplayer-js-controls-background-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      ...ResponsiveLitElement.properties,

      /**
       * The label to display
       */
      label: { type: String },

      /**
       * The duration of the track
       */
      duration: { type: Number },

      /**
       * The current time of playback
       */
      currentTime: { type: Number },

      /**
       * The peaks data that are to be used for displaying the waveform
       */
      peaks: { type: Object },

      /**
       * The percentage of the current time
       */
      currentPct: { type: Number },

      /**
       * The playing state
       */
      isPlaying: { type: Boolean },

      /**
       * The colour of the waveform
       */
      waveColor: { type: String },

      /**
       * The wave progress colour
       */
      waveProgressColor: { type: String },

      /**
       * Whether the loop is toggled on or off
       */
      loop: { type: Boolean },

      /**
       * Used to determine whether the DOM has been initialised
       */
      _rowHeight: { state: true },
    };
  }

  /**
   * @private
   */
  #debouncedHandleSeek;

  /**
   * @private
   */
  #computedWaveformStyles;

  constructor() {
    super();
    this.#debouncedHandleSeek = debounce(this.#handleSeek, 100);
  }

  firstUpdated() {
    this.#computedWaveformStyles = this.#computeWaveformStyles();

    // get the _rowHeight so we know the height for the waveform
    this._rowHeight = this.shadowRoot.firstElementChild.clientHeight;
  }

  render() {
    const styles = this.#computedWaveformStyles;

    return html`<div class="dFlex flexRow row">
      <soundws-player-button
        class="w2"
        .disabled=${!this.duration}
        @click=${this.isPlaying ? this.#onPauseClick : this.#onPlayClick}
        .title=${this.isPlaying ? 'Pause' : 'Play'}
        .type=${this.isPlaying ? 'pause' : 'play'}
      ></soundws-player-button>
      <soundws-player-button
        class="w2 ${this.loop ? '' : 'textMuted'}"
        @click=${this.#toggleLoop}
        .title=${this.loop ? 'Disable loop' : 'Enable Loop'}
        type="loop"
      ></soundws-player-button>
      ${this.displayMode !== 'xs'
        ? html`<div class="w9 truncate hideXs px4 textCenter">
            <span>${this.label}</span>
          </div>`
        : ''}
      <div class="w2 textXs textMuted pr1 textCenter">
        <span>${formatSeconds(this.currentTime || 0)}</span>
      </div>
      ${this.displayMode === 'lg' && this._rowHeight
        ? html`<div class="flex1">
            <soundws-waveform
              .peaks=${this.peaks}
              .duration=${this.duration}
              .progress=${this.currentPct}
              .progressColor=${styles.waveProgressColor}
              .waveColor=${styles.waveColor}
              .barWidth=${styles.barWidth}
              .barGap=${styles.barGap}
              .pixelRatio=${styles.devicePixelRatio}
            ></soundws-waveform>
          </div>`
        : html`<soundws-range
            label="progress"
            class="focusBgBrand px1 flex1"
            .value=${this.currentPct * 100}
            @input=${this.#handleSeeking}
            @change=${this.#debouncedHandleSeek}
          ></soundws-range>`}
      <div class="w2 truncate textXs textMuted textCenter">
        <span>${formatSeconds(this.duration)}</span>
      </div>
      <slot name="end"></slot>
    </div>`;
  }

  /**
   * @private
   */
  #onPlayClick() {
    this.dispatchEvent(new Event('controls:play', { bubbles: true }));
  }

  /**
   * @private
   */
  #onPauseClick() {
    this.dispatchEvent(new Event('controls:pause', { bubbles: true }));
  }

  /**
   * Calculates the styles for rendering the waveform
   *
   * @private
   */
  #computeWaveformStyles() {
    const styles = computeWaveformStyles(this, defaults.waveform);

    return {
      ...styles,
      waveColor: this.waveColor || styles.controlsWaveColor || styles.waveColor,
      waveProgressColor:
        this.waveProgressColor ||
        styles.controlsProgressColor ||
        styles.progressColor,
    };
  }

  /**
   * @private
   */
  #handleSeeking() {
    this.dispatchEvent(new CustomEvent('controls:seeking', { bubbles: true }));
  }

  /**
   * @private
   */
  #handleSeek(e) {
    this.dispatchEvent(
      new CustomEvent('controls:seek', {
        detail: e.detail / 100,
        bubbles: true,
      }),
    );
  }

  get waveformComponent() {
    return this.shadowRoot?.querySelector('soundws-waveform');
  }

  #toggleLoop(e) {
    this.dispatchEvent(new CustomEvent('controls:loop', { bubbles: true }));
    e.target.blur();
  }
}
