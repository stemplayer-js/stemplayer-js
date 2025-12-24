import { html, css } from 'lit';
import HLS from '@firstcoders/hls-web-audio/hls.js';
import { ResponsiveConsumerLitElement } from './ResponsiveConsumerLitElement.js';
import { WaveformHostMixin } from './mixins/WaveformHostMixin.js';
import gridStyles from './styles/grid.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import utilityStyle from './styles/utilities.js';
import { fetchOptions } from './config.js';

/**
 * A component to render a single stem
 */
export class FcStemPlayerStem extends WaveformHostMixin(
  ResponsiveConsumerLitElement,
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
    };
  }

  /**
   * @type {Number}
   * @private
   */
  #volume;

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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unload();
  }

  async load(controller) {
    if (this.src !== this.#HLS?.src)
      this.unload(); // the source has changed, unload
    else return; // the src is the same, do nothing

    if (!this.src) return; // the src was set to null do nothing

    // init the duration, this is used to render the waveform correctly
    this.duration = controller.duration;

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

  /**
   * When the src changes, trigger a request to reload the stem (in the context of the player)
   */
  requestLoad() {
    this.dispatchEvent(new Event('stem:load:request', { bubbles: true }));
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

      if (propName === 'src') {
        if (this.src) this.requestLoad();
      }
    });
  }

  render() {
    return html`<div>
      ${this.displayMode === 'lg'
        ? this.#getLargeScreenTpl()
        : this.#getSmallScreenTpl()}
    </div>`;
  }

  /**
   * @private
   */
  #getSmallScreenTpl() {
    return html`<stemplayer-js-row displayMode="sm">
      <fc-player-button
        @click=${this.solo === 'on' ? this.#onUnSoloClick : this.#onSoloClick}
        .title=${this.solo === 'on' ? 'Disable solo' : 'Solo'}
        .type=${this.solo === 'on' ? 'unsolo' : 'solo'}
        class="w2 flexNoShrink ${this.solo === 'on' ? 'bgBrand' : ''}"
      ></fc-player-button>
      <fc-player-button
        class="w2 flexNoShrink"
        @click=${this.#toggleMute}
        .title="${this.muted || this.volume === 0 ? 'Unmute' : 'Mute'}"
        .type="${this.muted || this.volume === 0 ? 'unmute' : 'mute'}"
      ></fc-player-button>
      <fc-slider
        .value=${this.volume * 100}
        label="volume"
        class="flex1 overflowHidden"
        @change=${e => this.#handleVolume(e.detail / 100)}
        >${this.label}</fc-slider
      >
      <!-- for calculating combined peaks which should still be emited in events -->
      <fc-waveform
        .src=${this.waveform}
        .scaleY=${this.volume}
        style="display: none;"
      ></fc-waveform>
    </stemplayer-js-row>`;
  }

  /**
   * @private
   */
  #getLargeScreenTpl() {
    const styles = this.getComputedWaveformStyles();

    return html`<stemplayer-js-row>
      <div slot="controls" class="dFlex h100">
        <fc-player-button
          class="w2 overflowHidden"
          @click=${this.solo === 'on' ? this.#onUnSoloClick : this.#onSoloClick}
          .title=${this.solo === 'on' ? 'Disable solo' : 'Solo'}
          .type=${this.solo === 'on' ? 'unsolo' : 'solo'}
        ></fc-player-button>
        <fc-player-button
          class="w2 overflowHidden"
          @click=${this.#toggleMute}
          .title="${this.muted || this.volume === 0 ? 'Unmute' : 'Mute'}"
          type="${this.muted || this.volume === 0 ? 'unmute' : 'mute'}"
        ></fc-player-button>
        <fc-range
          class="w2 "
          label="volume"
          @change=${e => this.#handleVolume(e.detail / 100)}
          .value=${this.volume * 100}
        ></fc-range>
        <div
          class="flex1 px4 truncate noPointerEvents textCenter flexNoShrink textSm"
        >
          ${this.label}
        </div>
      </div>
      ${styles
        ? html`
            <fc-waveform
              class="h100"
              slot="flex"
              .src=${this.waveform}
              .progress=${this.currentPct}
              .scaleY=${this.volume}
              .progressColor=${styles.waveProgressColor}
              .waveColor=${styles.waveColor}
              .barWidth=${styles.barWidth}
              .barGap=${styles.barGap}
              .pixelRatio=${styles.devicePixelRatio}
            ></fc-waveform>
          `
        : ''}
    </stemplayer-js-row>`;
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
    return this.shadowRoot?.querySelector('fc-waveform');
  }

  get row() {
    return this.shadowRoot.querySelector('stemplayer-js-row');
  }
}
