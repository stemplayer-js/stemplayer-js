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
import HLS from '@soundws/hls-web-audio/hls.js';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import { defaults, fetchOptions } from './config.js';
import { computeWaveformStyles } from './lib/compute-styles.js';

/**
 * A component to render a single stem
 */
export class SoundwsStemPlayerStem extends ResponsiveLitElement {
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
            --stemplayer-js-stem-color,
            var(--stemplayer-js-color, white)
          );
          display: block;
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
       * The url of the audio file
       */
      src: { type: String },

      /**
       * The url of the waveform file
       */
      waveform: { type: String },

      /**
       * @param {('off'|'on'|'muted')} solo - The solo state. 'on' = solo this stem; 'muted' = another stem is soloed, mute this one
       */
      solo: { type: String },
      muted: { type: Boolean },
      currentPct: { type: Number },
      volume: { type: Number },

      /**
       * Override the duration of the track
       */
      duration: { type: Number },

      /**
       * The colour of the waveform
       */
      waveColor: { type: String },

      /**
       * The wave progress colour
       */
      waveProgressColor: { type: String },

      /**
       * Used to determine whether the DOM has been initialised
       */
      _rowHeight: { state: true },
    };
  }

  /**
   * @type {Number}
   * @private
   */
  #volume;

  /**
   * @type {Object}
   * @private
   */
  #computedWaveformStyles;

  /**
   * @type {HLS}
   * @private
   */
  #HLS;

  constructor() {
    super();
    this.#volume = 1;
    this.solo = 'off';
  }

  firstUpdated() {
    this.#computedWaveformStyles = this.#computeWaveformStyles();

    // get the _rowHeight so we know the height for the waveform
    this._rowHeight = this.shadowRoot.firstElementChild.clientHeight;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unload();
  }

  async load(controller) {
    if (!this.src || this.#HLS) return;

    this.#HLS = new HLS({
      controller,
      volume: this.volume,
      fetchOptions,
    });

    this.dispatchEvent(
      new Event('stem:load:start', { bubbles: true, composed: true }),
    );

    try {
      await this.#HLS.load(this.src).promise;

      this.isLoaded = true;

      this.dispatchEvent(
        new Event('stem:load:end', { bubbles: true, composed: true }),
      );
    } catch (error) {
      // dispatch error event on element (doesnt bubble)
      this.dispatchEvent(new ErrorEvent('error', { error }));

      // dispatch bubbling event so that the player-component can respond to it
      this.dispatchEvent(
        new CustomEvent('stem:load:error', {
          detail: error,
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  unload() {
    if (this.#HLS) {
      this.#HLS.destroy();
      this.#HLS = null;
    }
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (['volume', 'muted', 'solo'].indexOf(propName) !== -1) {
        if (this.#HLS) this.#HLS.volume = this.volume;
        if (this.waveformComponent) this.waveformComponent.scaleY = this.volume;

        if (propName === 'solo' && this.solo !== oldValue) {
          // When setting via the external API we want to also trigger the event that causes the handing of the solo states of other stems
          if (this.solo === true) this.solo = 'on'; // convert: true is an alias of 'on'
          if (this.solo === false) this.solo = 'off'; // convert: false is an alias of 'off'
          this.#dispatchSoloEvent();
        }
      }
    });
  }

  render() {
    return html`<div class="row">
      ${this.displayMode === 'lg'
        ? this.#getLargeScreenTpl()
        : this.#getSmallScreenTpl()}
    </div>`;
  }

  /**
   * @private
   */
  #getSmallScreenTpl() {
    return html`<div class="dFlex flexRow showSm">
      <div class="w2 flexNoShrink">
        <soundws-player-button
          @click=${this.solo === 'on' ? this.#onUnSoloClick : this.#onSoloClick}
          .title=${this.solo === 'on' ? 'Disable solo' : 'Solo'}
          .type=${this.solo === 'on' ? 'unsolo' : 'solo'}
          class=${this.solo === 'on' ? 'bgBrand' : ''}
        ></soundws-player-button>
      </div>
      <div class="w2 flexNoShrink">
        <soundws-player-button
          @click=${this.#toggleMute}
          .title="${this.muted || this.volume === 0 ? 'Unmute' : 'Mute'}"
          .type="${this.muted || this.volume === 0 ? 'unmute' : 'mute'}"
        ></soundws-player-button>
      </div>
      <soundws-slider
        .value=${this.volume * 100}
        label="volume"
        class="flex1"
        @change=${e => this.#handleVolume(e.detail / 100)}
        >${this.label}</soundws-slider
      >
      <!-- for calculating combined peaks which should still be emited in events -->
      <soundws-waveform
        .src=${this.waveform}
        .scaleY=${this.volume}
        style="display: none;"
      ></soundws-waveform>
    </div>`;
  }

  /**
   * @private
   */
  #getLargeScreenTpl() {
    const styles = this.#computedWaveformStyles;

    return html`<div class="dFlex flexRow row">
      <div class="w2 flexNoShrink">
        <soundws-player-button
          @click=${this.solo === 'on' ? this.#onUnSoloClick : this.#onSoloClick}
          .title=${this.solo === 'on' ? 'Disable solo' : 'Solo'}
          .type=${this.solo === 'on' ? 'unsolo' : 'solo'}
        ></soundws-player-button>
      </div>
      <div class="w5 hoverMenuAnchor dFlex flexAlignStretch pr1">
        <soundws-player-button
          class="w2 flexNoShrink pr1"
          @click=${this.#toggleMute}
          .title="${this.muted || this.volume === 0 ? 'Unmute' : 'Mute'}"
          type="${this.muted || this.volume === 0 ? 'unmute' : 'mute'}"
        ></soundws-player-button>
        <soundws-range
          label="volume"
          class="focusbgBrand px1"
          @change=${e => this.#handleVolume(e.detail / 100)}
          .value=${this.volume * 100}
        ></soundws-range>
      </div>
      <div class="w8 px4 alignRight truncate noPointerEvents textCenter">
        <span class="truncate textSm">${this.label}</span>
      </div>
      ${this._rowHeight
        ? html`<soundws-waveform
            class="flex1"
            .src=${this.waveform}
            .progress=${this.currentPct}
            .scaleY=${this.volume}
            .progressColor=${styles.waveProgressColor}
            .waveColor=${styles.waveColor}
            .barWidth=${styles.barWidth}
            .barGap=${styles.barGap}
            .pixelRatio=${styles.devicePixelRatio}
          ></soundws-waveform>`
        : ''}
      <div class="w2 flexNoShrink"></div>
      <slot name="end"></slot>
    </div>`;
  }

  /**
   * @private
   */
  #toggleMute() {
    this.muted = !(this.muted || this.volume === 0);
  }

  /**
   * @private
   */
  #onSoloClick() {
    this.solo = 'on';
  }

  /**
   * Dispatch event so that the solo state of other stems can be modified
   *
   * @private
   */
  #dispatchSoloEvent() {
    if (this.solo === 'on' || this.solo === 'off') {
      const event = this.solo === 'on' ? 'stem:solo' : 'stem:unsolo';
      this.dispatchEvent(
        new CustomEvent(event, { detail: this, bubbles: true }),
      );
    }
  }

  /**
   * @private
   */
  #onUnSoloClick() {
    this.solo = 'off';
  }

  /**
   * @private
   */
  #handleVolume(v) {
    this.volume = v;
  }

  /**
   * Set the volume
   */
  set volume(v) {
    const oldValue = this.#volume;

    this.#volume = v;

    if (v > 0) {
      // When changing the volume to > 0, unmute
      this.muted = false;

      // when changing the volume on a track that is muted due to solo, un-solo-mute it
      if (this.solo === 'muted') {
        this.solo = 'unmuted';
      }
    }

    this.requestUpdate('volume', oldValue);
  }

  /**
   * Get the current volume, while taking into consideration the values for `muted` and `solo`.
   */
  get volume() {
    if (this.muted || this.solo === 'muted') return 0;

    return this.#volume;
  }

  /**
   * @returns {Array} - An array of peaks modified by volume
   */
  get peaks() {
    return this.waveformComponent?.adjustedPeaks;
  }

  /**
   * @private
   */
  get waveformComponent() {
    return this.shadowRoot?.querySelector('soundws-waveform');
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
      waveColor: this.waveColor || styles.waveColor,
      waveProgressColor: this.waveProgressColor || styles.progressColor,
    };
  }
}
