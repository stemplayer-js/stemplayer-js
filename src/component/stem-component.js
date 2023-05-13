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
/* eslint-disable no-param-reassign  */
import { LitElement, html, css } from 'lit';
import { HLS } from '@stemplayer-js/hls-web-audio';
import { defineCustomElements as defineWaveformComponent } from './waveform-component';
import { defineCustomElements as defineResponsiveVolumecomponent } from './responsive-volume-component';
import gridStyles from '../styles/grid';
import rowStyles from '../styles/row';
import flexStyles from '../styles/flex';
import spacingStyles from '../styles/spacing';
import typographyStyles from '../styles/typography';
import bgStyles from '../styles/backgrounds';
import rangeInputStyles from '../styles/range-input';
import onResize from '../lib/on-resize';
import config from '../config';
import defineCustomElement from '../lib/define-custom-element';

const responsiveBreakpoints = {
  xs: '600',
  sm: '800',
};

/**
 * A component to render a single stem
 *
 * @cssprop [--sws-stemsplayer-stem-bg-color=black]
 * @cssprop [--sws-stemsplayer-stem-color=rgb(220, 220, 220)]
 * @cssprop [--sws-stemsplayer-stem-wave-color=#AAA]
 * @cssprop [--sws-stemsplayer-stem-wave-progress-color=rgb(0, 206, 224)]
 * @cssprop [--sws-stemsplayer-stem-wave-pixel-ratio=2]
 */
export class StemComponent extends LitElement {
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      rangeInputStyles,

      // NOTE: children of this component (such as btnIcon component) use the main css var --sws-stemsplayer-color
      // in order to be able to override color on a stemcomponent level, we re-initialise this global css var (--sws-stemsplayer-color)
      // with the component level css var (--sws-stemsplayer-stem-color)
      css`
        :host {
          --sws-stemsplayer-color: var(--sws-stemsplayer-stem-color, rgb(220, 220, 220));
          --sws-stemsplayer-bg-color: var(--sws-stemsplayer-stem-bg-color, black);

          display: block;
          color: var(--sws-stemsplayer-color);
          background-color: var(--sws-stemsplayer-bg-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      label: { type: String },
      src: { type: String },
      audioSrc: { Type: String, attribute: 'audio-src' },
      waveform: { type: String },
      solo: { type: Boolean },
      muted: { type: Boolean },
      currentPct: { type: Number },
      controller: { type: Object },
      displayMode: { type: String },
      volume: { type: Number },
      clientHeight: { type: Number },
      // allows padding the number of peaks - this will cause automatic padding of zeroes so that we can accurately display waveforms of stems of different lengths
      // padPeaks: { type: Number },
      duration: { type: Number },
      renderedDuration: { type: Number },

      /**
       * The text color of the component
       */
      color: { attribute: 'color' },

      /**
       * The background color of the component
       */
      backgroundColor: { attribute: 'background-color' },

      /**
       * The fill color of the waveform after the cursor.
       */
      waveColor: { attribute: 'wave-color', type: String },

      /**
       * The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all.
       */
      waveProgressColor: { attribute: 'wave-progress-color', type: String },

      /**
       * The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all.
       */
      wavePixelRatio: { attribute: 'wave-pixel-ratio', type: Number },

      /**
       * The rowHeight
       */
      rowHeight: { attribute: false },
    };
  }

  constructor() {
    super();
    this._volume = 1;

    // this is also handled by the player-component - but the stem element should also emit an error event
    this.addEventListener('waveform-loading-error', ({ detail }) =>
      this.dispatchEvent(new ErrorEvent('error', detail))
    );

    this.addEventListener('stem-loading-end', () => {
      this.duration = this.HLS.duration;
    });
  }

  connectedCallback() {
    super.connectedCallback();

    // default values
    this.displayMode = 'lg';

    if (this.color) this.style.setProperty('--sws-stemsplayer-stem-color', this.color);
    if (this.backgroundColor)
      this.style.setProperty('--sws-stemsplayer-stem-bg-color', this.backgroundColor);

    // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer. This has the possibility of being unreliable.
    // get some stuff that is not styled by css from css vars anyway (for nice theming)
    // NOTE: we add a delay to allow the browser to sort itself out.
    setTimeout(() => {
      const computedStyle = getComputedStyle(this);

      if (!this.waveColor)
        this.waveColor =
          computedStyle.getPropertyValue('--sws-stemsplayer-stem-wave-color') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-color') ||
          '#AAA';

      if (!this.waveProgressColor)
        this.waveProgressColor =
          computedStyle.getPropertyValue('--sws-stemsplayer-stem-wave-progress-color') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-progress-color') ||
          'rgb(0, 206, 224)';

      if (!this.wavePixelRatio)
        this.wavePixelRatio =
          computedStyle.getPropertyValue('--sws-stemsplayer-stem-wave-pixel-ratio') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-pixel-ratio') ||
          2;

      const container = this.shadowRoot.firstElementChild;

      // respond to resize events
      this.onResizeCallback = onResize(container, () => this.recalculateDisplayMode());

      // get the rowHeight so we know the height for the waveform
      this.rowHeight = container.clientHeight;
    }, 100);

    this.attemptToLoad();
  }

  disconnectedCallback() {
    this.onResizeCallback?.un();
    this.onResizeCallback = null;

    // remove event listeners
    this.eTimeupdate?.un();
    this.eEnd?.un();
    this.eSeek?.un();

    this.HLS?.destroy();
    this.HLS = null;

    this.controller = null;

    super.disconnectedCallback();
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
        fetchOptions: config.fetchOptions,
      });

      this.dispatchEvent(new Event('stem-loading-start', { bubbles: true, composed: true }));

      this.HLS.load(this.src)
        .promise.then(() => {
          this.dispatchEvent(new Event('stem-loading-end', { bubbles: true, composed: true }));
        })
        .catch((err) => {
          // dispatch error event on element (doesnt bubble)
          this.dispatchEvent(new ErrorEvent('error', err));

          // dispatch bubbling event so that the player-component can respond to it
          this.dispatchEvent(
            new CustomEvent('stem-loading-error', { detail: err, bubbles: true, composed: true })
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

      this._controller = controller;

      this.attemptToLoad();
    }
  }

  get controller() {
    return this._controller;
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
      ${this.displayMode === 'lg' ? this.getLargeScreenTpl() : this.getSmallScreenTpl()}
    </div>`;
  }

  /**
   * @private
   */
  getSmallScreenTpl() {
    return html`<div class="dFlex flexRow showSm">
      <div class="w2 flexNoShrink">
        ${this.solo === 1
          ? html`<soundws-btn-icon
              @click=${this.handleUnSolo}
              title="Disable solo"
              icon="unsolo"
              class="bgAccent"
            ></soundws-btn-icon>`
          : html`<soundws-btn-icon
              @click=${this.handleSolo}
              title="Solo"
              icon="solo"
            ></soundws-btn-icon>`}
      </div>
      <div class="w2 flexNoShrink">
        ${this.muted || this.volume === 0
          ? html`<soundws-btn-icon
              @click=${this.handleUnmute}
              title="Unmute"
              icon="unmute"
            ></soundws-btn-icon>`
          : html`<soundws-btn-icon
              @click=${this.handleMute}
              title="Mute"
              icon="mute"
            ></soundws-btn-icon>`}
      </div>
      <soundws-responsive-volume
        .label=${this.label}
        .volume=${this.volume * 100}
        class="flex1"
        @change=${(e) => this.handleVolume(e.detail / 100)}
      ></soundws-responsive-volume>
      <!-- for calculating combined peaks which should still be emited in events -->
      <soundws-waveform
        .src=${this.waveform}
        .scaleY=${this.volume}
        .audioDuration=${this.duration}
        .renderedDuration=${this.renderedDuration}
        @draw=${this.handlePeaks}
        hidden="true"
      ></soundws-waveform>
    </div>`;
  }

  /**
   * @private
   */
  getLargeScreenTpl() {
    return html`<div class="dFlex flexRow">
      <div class="w2 flexNoShrink">
        ${this.solo === 1
          ? html`<soundws-btn-icon
              @click=${this.handleUnSolo}
              title="Disable solo"
              icon="unsolo"
              class="bgAccent"
            ></soundws-btn-icon>`
          : html`<soundws-btn-icon
              @click=${this.handleSolo}
              title="Solo"
              icon="solo"
            ></soundws-btn-icon>`}
      </div>
      <div class="w5 hoverMenuAnchor flexNoShrink">
        <div class="p3 dFlex flexAlignStretch">
          <div class="w2 flexNoShrink">
            ${this.muted || this.volume === 0
              ? html`<soundws-btn-icon
                  @click=${this.handleUnmute}
                  title="Unmute"
                  icon="unmute"
                ></soundws-btn-icon>`
              : html`<soundws-btn-icon
                  @click=${this.handleMute}
                  title="Mute"
                  icon="mute"
                ></soundws-btn-icon>`}
          </div>
          <input
            class="focusBgAccent"
            @change=${(e) => this.handleVolume(e.target.value / 100)}
            type="range"
            min="0"
            max="100"
            .value=${this.volume * 100}
            step="1"
          />
        </div>
      </div>
      <div class="w6 p2 alignRight truncate noPointerEvents textCenter">
        <span class="truncate textSm">${this.label}</span>
      </div>
      <div class="flex1">
        ${this.rowHeight
          ? html`<soundws-waveform
              .options=${{
                waveColor: this.waveColor,
                progressColor: this.waveProgressColor,
                pixelRatio: this.wavePixelRatio,
                height: this.rowHeight,
              }}
              .src=${this.waveform}
              .pct=${this.currentPct}
              .scaleY=${this.volume}
              .audioDuration=${this.duration}
              .renderedDuration=${this.renderedDuration}
              @seek=${(e) => this.handleSeek(e.detail)}
              @draw=${this.handlePeaks}
            ></soundws-waveform>`
          : ''}
      </div>
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
    this.dispatchEvent(new CustomEvent('solo', { detail: this, bubbles: true }));
  }

  /**
   * @private
   */
  handleUnSolo() {
    this.dispatchEvent(new CustomEvent('unsolo', { detail: this, bubbles: true }));
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
  handleSeek({ pct }) {
    this.controller.pct = pct;
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
    return this.waveformComponent?.peaks || [];
  }

  /**
   * Set using raw audio url, which will automatically set the hls and waveform endpoints
   */
  set audioSrc(src) {
    if (!config.apiEndpoint)
      throw new Error('Cannot set audioUrl since config.apiEndpoint must be set');
    this.src = `${config.apiEndpoint.replace(/\/$/, '')}/hls?sourceUrl=${encodeURIComponent(src)}`;
    this.waveform = `${config.apiEndpoint.replace(
      /\/$/,
      ''
    )}/waveform?sourceUrl=${encodeURIComponent(src)}`;
  }

  // get duration() {
  //   return this.HLS?.duration;
  // }

  /**
   * @private
   */
  get waveformComponent() {
    return this.shadowRoot?.querySelector('soundws-waveform');
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-stem', StemComponent);
  defineWaveformComponent();
  defineResponsiveVolumecomponent();
};
