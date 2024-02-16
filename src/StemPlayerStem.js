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
 *
 * @cssprop [--stemplayer-js-waveform-color=#AAA]
 * @cssprop [--stemplayer-js-waveform-progress-color=rgb(0, 206, 224)]
 */
export class SoundwsStemPlayerStem extends ResponsiveLitElement {
  /**
   * Safari does not like inherit for css variables
   * https://stackoverflow.com/questions/48079541/css-variables-inheritance-and-fallback
   */
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
      label: { type: String },
      src: { type: String },
      waveform: { type: String },
      solo: { type: Boolean },
      muted: { type: Boolean },
      currentPct: { type: Number },
      volume: { type: Number },
      duration: { type: Number },
      /** @private */
      controller: { type: Object },
      /** @private */
      waveColor: { type: String },
      /** @private */
      waveProgressColor: { type: String },
      /** @private */
      rowHeight: { attribute: false },
      /** @private */
      clientHeight: { type: Number },
    };
  }

  constructor() {
    super();
    this._volume = 1;

    // this is also handled by the player-component - but the stem element should also emit an error event
    this.addEventListener('waveform-loading-error', ({ detail }) =>
      this.dispatchEvent(new ErrorEvent('error', { error: detail })),
    );

    this.addEventListener('stem-loading-end', () => {
      this.duration = this.HLS.duration;
    });
  }

  connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      this.computedWaveformStyles = this.computeWaveformStyles();

      // get the rowHeight so we know the height for the waveform
      this.rowHeight = this.shadowRoot.firstElementChild.clientHeight;
    }, 100);

    this.attemptToLoad();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.eTimeupdate?.un();
    this.eEnd?.un();
    this.eSeek?.un();
    this.HLS?.destroy();
    this.HLS = null;
    this.controller = null;
  }

  /**
   * The loading of the actual HLS track can happen when both the src is set, and the controller.
   * So we attempt to load the HLS track when certain things happen:
   * - the src is updated
   * - the controller is updated
   * The controller is updated as soon as the stemcomponent is placed in the parent stemslist component.
   * We cannot simply do constructor injection, or set the property manual, since we also want to be able
   * to instantiate this component via html, in which case the controller needs to be retrieved from the parent.
   *
   * @private
   */
  attemptToLoad() {
    if (!this.HLS && this.controller && this.src) {
      this.HLS = new HLS({
        controller: this.controller,
        volume: this.volume,
        fetchOptions,
      });

      this.dispatchEvent(
        new Event('stem-loading-start', { bubbles: true, composed: true }),
      );

      this.HLS.load(this.src)
        .promise.then(() => {
          this.dispatchEvent(
            new Event('stem-loading-end', { bubbles: true, composed: true }),
          );
        })
        .catch(error => {
          // dispatch error event on element (doesnt bubble)
          this.dispatchEvent(new ErrorEvent('error', { error }));

          // dispatch bubbling event so that the player-component can respond to it
          this.dispatchEvent(
            new CustomEvent('stem-loading-error', {
              detail: error,
              bubbles: true,
              composed: true,
            }),
          );
        });
    }
  }

  /**
   * The controller is injected into this component as soon as it is added in the parent.
   *
   * @private
   */
  set controller(controller) {
    // TODO currently we're assuming we're not reusing the same component for another track
    // so we do not update either controller and src
    if (controller && !this._controller) {
      this.eTimeupdate = controller.on('timeupdate', ({ pct }) => {
        this.currentPct = pct;
      });

      this.eEnd = controller.on('end', () => {
        this.currentTime = 0;
        this.currentPct = 0;
      });

      this.eSeek = controller.on('seek', ({ t, pct }) => {
        this.currentTime = t;
        this.currentPct = pct;
      });

      this.eDuration = controller?.on('duration', () => {
        this.calculateWaveformWidth();
      });

      this._controller = controller;

      this.attemptToLoad();
    }
  }

  get controller() {
    return this._controller;
  }

  /**
   * The way the waveform is rendered depends on the duration of the other stems.
   * In the case where one stem is of (e.g.) shorted duration, the waveform has to
   * be adjusted so that the rendering is consistent with the other waveforms;
   *
   * @private
   */
  calculateWaveformWidth() {
    if (this.controller && this.waveformComponent) {
      this.waveformComponent.duration = this.controller.duration;
    }
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (['volume', 'muted', 'solo'].indexOf(propName) !== -1) {
        if (this.HLS) this.HLS.volume = this.volume;
        if (this.waveformComponent) this.waveformComponent.scaleY = this.volume;
      }
      if (propName === 'src') this.attemptToLoad();
    });
  }

  render() {
    return html`<div class="row">
      ${this.displayMode === 'lg'
        ? this.getLargeScreenTpl()
        : this.getSmallScreenTpl()}
    </div>`;
  }

  /**
   * @private
   */
  getSmallScreenTpl() {
    return html`<div class="dFlex flexRow showSm">
      <div class="w2 flexNoShrink">
        ${this.solo === 1
          ? html`<soundws-player-button
              @click=${this.handleUnSolo}
              title="Disable solo"
              type="unsolo"
              class="bgAccent"
            ></soundws-player-button>`
          : html`<soundws-player-button
              @click=${this.handleSolo}
              title="Solo"
              type="solo"
            ></soundws-player-button>`}
      </div>
      <div class="w2 flexNoShrink">
        ${this.muted || this.volume === 0
          ? html`<soundws-player-button
              @click=${this.handleUnmute}
              title="Unmute"
              type="unmute"
            ></soundws-player-button>`
          : html`<soundws-player-button
              @click=${this.handleMute}
              title="Mute"
              type="mute"
            ></soundws-player-button>`}
      </div>
      <soundws-slider
        .value=${this.volume * 100}
        label="volume"
        class="flex1"
        @change=${e => this.handleVolume(e.detail / 100)}
        >${this.label}</soundws-slider
      >
      <!-- for calculating combined peaks which should still be emited in events -->
      <soundws-waveform
        .src=${this.waveform}
        .scaleY=${this.volume}
        @draw=${this.handlePeaks}
        style="display: none;"
        @load=${this.calculateWaveformWidth}
      ></soundws-waveform>
    </div>`;
  }

  /**
   * @private
   */
  getLargeScreenTpl() {
    const styles = this.computedWaveformStyles;

    return html`<div class="dFlex flexRow row">
      <div class="w2 pr1 flexNoShrink">
        ${
          this.solo === 1
            ? html`<soundws-player-button
                @click=${this.handleUnSolo}
                title="Disable solo"
                type="unsolo"
                class="bgAccent"
              ></soundws-player-button>`
            : html`<soundws-player-button
                @click=${this.handleSolo}
                title="Solo"
                type="solo"
              ></soundws-player-button>`
        }
      </div>
      <div class="w5 hoverMenuAnchor dFlex flexAlignStretch">
        ${
          this.muted || this.volume === 0
            ? html`<soundws-player-button
                class="w2 flexNoShrink pr1"
                @click=${this.handleUnmute}
                title="Unmute"
                type="unmute"
              ></soundws-player-button>`
            : html`<soundws-player-button
                class="w2 flexNoShrink pr1"
                @click=${this.handleMute}
                title="Mute"
                type="mute"
              ></soundws-player-button>`
        }
            <soundws-range
            label="volume"
            class="focusBgAccent px1"
            @change=${e => this.handleVolume(e.detail / 100)}
            .value=${this.volume * 100}
            ></sounws-range>
      </div>
      <div class="w6 pr1 alignRight truncate noPointerEvents textCenter">
        <span class="truncate textSm">${this.label}</span>
      </div>
        ${
          this.rowHeight
            ? html`<soundws-waveform
                class="flex1"
                .height=${this.rowHeight}
                .src=${this.waveform}
                .progress=${this.currentPct}
                .scaleY=${this.volume}
                .progressColor=${styles.waveProgressColor}
                .waveColor=${styles.waveColor}
                .barWidth=${styles.barWidth}
                .barGap=${styles.barGap}
                .pixelRatio=${styles.devicePixelRatio}
                @click=${e => this.handleSeek(e)}
                @load=${this.calculateWaveformWidth}
              ></soundws-waveform>`
            : ''
        }
      <div class="w2 flexNoShrink"></div>
    </div>`;
  }

  /**
   * @private
   */
  handleMute() {
    this.muted = true;
  }

  /**
   * @private
   */
  handleUnmute() {
    this.muted = false;
  }

  /**
   * @private
   */
  handleSolo() {
    this.dispatchEvent(
      new CustomEvent('solo', { detail: this, bubbles: true }),
    );
  }

  /**
   * @private
   */
  handleUnSolo() {
    this.dispatchEvent(
      new CustomEvent('unsolo', { detail: this, bubbles: true }),
    );
  }

  /**
   * @private
   */
  handlePeaks(e) {
    this.dispatchEvent(new CustomEvent('peaks', { detail: e, bubbles: true }));
  }

  /**
   * @private
   */
  handleVolume(v) {
    this.volume = v;
  }

  /**
   * @private
   */
  handleSeek(e) {
    this.controller.pct =
      Math.round((e.offsetX / e.target.clientWidth) * 100) / 100;
  }

  /**
   * Set the volume
   */
  set volume(v) {
    const oldValue = this._volume;

    this._volume = v;

    if (v > 0) {
      // When changing the volume to > 0, unmute
      this.muted = false;

      // when changing the volume on a track that is muted due to solo, un-solo-mute it
      if (this.solo === -1) this.solo = undefined;
    }

    this.requestUpdate('volume', oldValue);
  }

  /**
   * Get the current volume, while taking into consideration the values for `muted` and `solo`.
   */
  get volume() {
    if (this.muted || this.solo === -1) return 0;

    return this._volume;
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
  computeWaveformStyles() {
    const styles = computeWaveformStyles(this, defaults.waveform);

    return {
      ...styles,
      waveColor: this.waveColor || styles.waveColor,
      waveProgressColor: this.waveProgressColor || styles.progressColor,
    };
  }
}
