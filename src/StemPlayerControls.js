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
import { WaveformHostMixin } from './mixins/WaveformHostMixin.js';
import gridStyles from './styles/grid.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import utilityStyle from './styles/utilities.js';
import formatSeconds from './lib/format-seconds.js';
import debounce from './lib/debounce.js';

/**
 * A component to render a single stem
 *
 * @cssprop [--stemplayer-js-controls-color]
 * @cssprop [--stemplayer-js-controls-background-color]
 */
export class FcStemPlayerControls extends WaveformHostMixin(
  ResponsiveLitElement,
) {
  static get styles() {
    return [
      gridStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      utilityStyle,
      css`
        :host {
          --fc-player-button-color: var(
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
       * Whether the loop is toggled on or off
       */
      loop: { type: Boolean },

      /**
       * The controls that are enables
       */
      controls: {
        type: String,
        converter: {
          fromAttribute: value => {
            if (typeof value === 'string') return value.split(' ');
            return value;
          },
        },
      },
    };
  }

  /**
   * @private
   */
  #debouncedHandleSeek;

  constructor() {
    super();
    this.#debouncedHandleSeek = debounce(this.#handleSeek, 100);
    this.controls = ['playpause', 'loop', 'progress', 'duration', 'time'];
  }

  render() {
    return html`<div>
      ${this.displayMode === 'lg'
        ? this.#getLargeScreenTpl()
        : this.#getSmallScreenTpl()}
    </div>`;
  }

  #getLargeScreenTpl() {
    return html`<stemplayer-js-row>
      <div slot="controls" class="dFlex h100">
        ${this.#renderControl('playpause', true)} ${this.#renderControl('loop')}
        ${this.#renderControl('zoom')}
        ${this.#renderControl('label', this.label)}
        ${this.#renderControl('time', true)}
      </div>
      <div slot="flex" class="h100">
        ${this.#renderControl('waveform') ||
        this.#renderControl('progress', true)}
      </div>
      <div slot="end" class="h100 dFlex">
        ${this.#renderControl('duration', true)}
        ${this.#renderControl('end:loop')} ${this.#renderControl('end:zoom')}
      </div>
    </stemplayer-js-row>`;
  }

  #getSmallScreenTpl() {
    return html`<stemplayer-js-row displayMode="sm">
      <fc-player-button
        class="w2 flexNoShrink"
        .disabled=${!this.duration}
        @click=${this.isPlaying ? this.#onPauseClick : this.#onPlayClick}
        .title=${this.isPlaying ? 'Pause' : 'Play'}
        .type=${this.isPlaying ? 'pause' : 'play'}
      ></fc-player-button>
      <fc-player-button
        class="w2 flexNoShrink ${this.loop ? '' : 'textMuted'}"
        @click=${this.#toggleLoop}
        .title=${this.loop ? 'Disable loop' : 'Enable Loop'}
        type="loop"
      ></fc-player-button>
      ${this.displayMode !== 'xs'
        ? html`<div
            class="flex1 truncate hideXs px4 pr5 textCenter flexNoShrink"
          >
            ${this.label}
          </div>`
        : ''}
      <div
        class="w2 truncate textCenter flexNoShrink z99 op75 top right textXs"
      >
        ${formatSeconds(this.currentTime || 0)}
      </div>
      <fc-range
        label="progress"
        class="focusBgBrand px1 flex1 flexNoShrink"
        .value=${this.currentPct * 100}
        @input=${this.#handleSeeking}
        @change=${this.#debouncedHandleSeek}
      ></fc-range>
      <div class="w2 op75 textCenter textXs">
        <span class="p2">${formatSeconds(this.duration)}</span>
      </div>
    </stemplayer-js-row>`;
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

  #toggleLoop(e) {
    this.dispatchEvent(new CustomEvent('controls:loop', { bubbles: true }));
    e.target.blur();
  }

  #onZoominClick() {
    this.dispatchEvent(new Event('controls:zoom:in', { bubbles: true }));
  }

  #onZoomoutClick() {
    this.dispatchEvent(new Event('controls:zoom:out', { bubbles: true }));
  }

  isControlEnabled(value) {
    return this.controls.indexOf(value) !== -1;
  }

  #renderControl(value, mandatory) {
    if (!mandatory && this.controls.indexOf(value) === -1) return '';

    if (value === 'playpause')
      return html`<fc-player-button
        class="w2 flexNoShrink"
        .disabled=${!this.duration}
        @click=${this.isPlaying ? this.#onPauseClick : this.#onPlayClick}
        .title=${this.isPlaying ? 'Pause' : 'Play'}
        .type=${this.isPlaying ? 'pause' : 'play'}
      ></fc-player-button>`;

    if (value === 'loop' || value === 'end:loop')
      return html`<fc-player-button
        class="w2 flexNoShrink ${this.loop ? '' : 'textMuted'}"
        @click=${this.#toggleLoop}
        .title=${this.loop ? 'Disable loop' : 'Enable Loop'}
        type="loop"
      ></fc-player-button>`;

    if (value === 'zoom' || value === 'end:zoom')
      return html`<fc-player-button
          class="w2 flexNoShrink"
          title="zoom in"
          type="zoomin"
          @click=${this.#onZoominClick}
        ></fc-player-button
        ><fc-player-button
          class="w2 flexNoShrink"
          title="zoom out"
          type="zoomout"
          @click=${this.#onZoomoutClick}
        ></fc-player-button>`;

    if (value === 'progress')
      return html`<fc-range
        label="progress"
        .value=${this.currentPct * 100}
        @input=${this.#handleSeeking}
        @change=${this.#debouncedHandleSeek}
      ></fc-range>`;

    if (value === 'waveform') {
      const styles = this.getComputedWaveformStyles();

      return html`
        <fc-waveform
          .peaks=${this.peaks}
          .duration=${this.duration}
          .progress=${this.currentPct}
          .progressColor=${styles.waveProgressColor}
          .waveColor=${styles.waveColor}
          .barWidth=${styles.barWidth}
          .barGap=${styles.barGap}
          .pixelRatio=${styles.devicePixelRatio}
        ></fc-waveform>
      `;
    }

    if (value === 'loop')
      return html`<fc-player-button
        class="w2 flexNoShrink ${this.loop ? '' : 'textMuted'}"
        @click=${this.#toggleLoop}
        .title=${this.loop ? 'Disable loop' : 'Enable Loop'}
        type="loop"
      ></fc-player-button>`;

    if (value === 'label')
      return html`<div
        class="flex1 w100 truncate hideXs px4 pr5 textCenter flexNoShrink"
      >
        ${this.label}
      </div>`;

    if (value === 'duration')
      return html`<div class="textCenter">
        <span class="p2 textXs">${formatSeconds(this.duration)}</span>
      </div>`;

    if (value === 'time')
      return html`<div class="w2 textCenter flexNoShrink z99 op75 top right">
        <span class="p2 textXs">${formatSeconds(this.currentTime || 0)}</span>
      </div>`;

    return '';
  }
}
