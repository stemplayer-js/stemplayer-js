import { html, css } from 'lit';
import { StemPlayerBaseRow } from './StemPlayerBaseRow.js';
import formatSeconds from './lib/format-seconds.js';
import debounce from './lib/debounce.js';

/**
 * A component to render a single stem
 *
 * @cssprop [--stemplayer-js-controls-color]
 * @cssprop [--stemplayer-js-controls-background-color]
 */
export class FcStemPlayerControls extends StemPlayerBaseRow {
  static get styles() {
    return [
      ...super.styles,
      css`
        :host {
          --fc-player-button-color: var(
            --stemplayer-js-controls-color,
            var(--stemplayer-js-color, white)
          );
          display: block;
          color: var(--stemplayer-js-controls-color, inherit);
          background-color: var(
            --stemplayer-js-controls-background-color,
            transparent
          );
          --stemplayer-js-row-controls-background-color: transparent;
          --stemplayer-js-row-end-background-color: transparent;
        }
      `,
    ];
  }

  static get properties() {
    return {
      /**
       * The current time of playback
       */
      currentTime: { type: Number, hasChanged: () => false },

      /**
       * The peaks data that are to be used for displaying the waveform
       */
      peaks: { type: Object },

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

  set currentTime(val) {
    this._currentTime = val;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('.js-currentTime').forEach(el => {
        el.textContent = formatSeconds(val || 0);
      });
    }
  }

  get currentTime() {
    return this._currentTime;
  }

  updateProgress(val) {
    super.updateProgress(val);
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('fc-range.js-progress').forEach(el => {
        el.value = val * 100;
      });
    }
  }

  constructor() {
    super();
    this.#debouncedHandleSeek = debounce(this.#handleSeek, 100);
    this.controls = ['playpause', 'loop', 'progress', 'duration', 'time'];
  }

  renderLargeScreen() {
    return html`<div class="stem-row dFlex h100">
      <div class="wControls stickLeft bgControls z999 dFlex h100 flexNoShrink">
        ${this.#renderControl('playpause', true)} ${this.#renderControl('loop')}
        ${this.#renderControl('label', this.label) ||
        html`<div class="flex1"></div>`}
        ${this.#renderControl(
          'time',
          this.#renderControl('waveform') || this.#renderControl('progress'),
        )}
      </div>
      <div class="flex1 h100">
        ${this.#renderControl('waveform') || this.#renderControl('progress')}
      </div>
      <div class="wEnd stickRight bgEnd z99 dFlex h100">
        ${this.#renderControl(
          'duration',
          this.#renderControl('waveform') || this.#renderControl('progress'),
        )}
        ${!this.#renderControl('waveform')
          ? html`${this.#renderControl('zoom')}
            ${this.#renderControl('download')}${this.#renderControl('collapse')}`
          : ''}
      </div>
    </div>`;
  }

  renderSmallScreen() {
    return html`<div class="stem-row dFlex h100 overflowHidden">
      ${this.#renderControl('playpause', true)} ${this.#renderControl('loop')}
      ${this.displayMode !== 'xs'
        ? html`<div
            class="flex1 truncate hideXs px4 pr5 textCenter flexNoShrink"
          >
            ${this.label}
          </div>`
        : ''}
      <div
        class="w2 truncate textCenter flexNoShrink z99 op75 top right textXs js-currentTime"
        role="timer"
        aria-label="Current time"
        aria-live="off"
      >
        0:00
      </div>
      <fc-range
        label="progress"
        class="focusBgBrand px1 flex1 flexNoShrink js-progress"
        .value=${0}
        .step=${0.001}
        @input=${this.#handleSeeking}
        @change=${this.#debouncedHandleSeek}
      ></fc-range>
      <div class="w2 op75 textCenter textXs">
        <span class="p2" role="timer" aria-label="Duration"
          >${formatSeconds(this.duration)}</span
        >
      </div>
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
   * @private
   */
  #onDownloadClick() {
    this.dispatchEvent(new Event('controls:download', { bubbles: true }));
  }

  /**
   * @private
   */
  #onToggleCollapseClick() {
    this.dispatchEvent(new Event('controls:collapse', { bubbles: true }));
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
    const activeControls = this.controls.map(control => control.split(':')[0]);
    if (!mandatory && activeControls.indexOf(value) === -1) return '';

    const controls = {};
    this.controls.forEach(control => {
      const [name, qualifier] = control.split(':');
      controls[name] = {
        disabled: qualifier === 'disabled',
        toggled: qualifier === 'toggled',
      };
    });

    if (value === 'playpause')
      return html`<fc-player-button
        class="w2 flexNoShrink"
        .disabled=${!this.duration}
        @click=${this.isPlaying ? this.#onPauseClick : this.#onPlayClick}
        .label=${this.isPlaying ? 'Pause' : 'Play'}
        .type=${this.isPlaying ? 'pause' : 'play'}
      ></fc-player-button>`;

    if (value === 'loop')
      return html`<fc-player-button
        class="w2 flexNoShrink ${this.loop ? '' : 'textMuted'}"
        @click=${this.#toggleLoop}
        .label=${this.loop ? 'Disable loop' : 'Enable Loop'}
        .disabled=${controls.loop?.disabled}
        type="loop"
      ></fc-player-button>`;

    if (value === 'zoom')
      return html`<fc-player-button
          class="w2 flexNoShrink"
          label="zoom in"
          type="zoomin"
          .disabled=${controls.zoom.disabled}
          @click=${this.#onZoominClick}
        ></fc-player-button
        ><fc-player-button
          class="w2 flexNoShrink"
          label="zoom out"
          type="zoomout"
          .disabled=${controls.zoom.disabled}
          @click=${this.#onZoomoutClick}
        ></fc-player-button>`;

    if (value === 'progress')
      return html`<fc-range
        label="progress"
        class="focusBgBrand px1 dBlock h100 js-progress"
        .value=${0}
        .step=${0.001}
        @input=${this.#handleSeeking}
        @change=${this.#debouncedHandleSeek}
      ></fc-range>`;

    if (value === 'waveform') {
      const styles = this.getComputedWaveformStyles();

      return html`
        <fc-waveform
          class="dBlock h100 w100"
          .peaks=${this.peaks}
          .duration=${this.duration}
          .progress=${this.currentPct || 0}
          .progressColor=${styles.waveProgressColor}
          .waveColor=${styles.waveColor}
          .barWidth=${styles.barWidth}
          .barGap=${styles.barGap}
          .pixelRatio=${styles.devicePixelRatio}
        ></fc-waveform>
      `;
    }

    if (value === 'label')
      return html`<div
        class="flex1 w100 truncate hideXs px4 pr5 textCenter flexNoShrink textSm"
        label=${this.label}
      >
        ${this.label}
      </div>`;

    if (value === 'duration')
      return html`<div class="textCenter w2">
        <span class="p2 textXs" role="timer" aria-label="Duration"
          >${formatSeconds(this.duration)}</span
        >
      </div>`;

    if (value === 'time')
      return html`<div class="w2 textCenter flexNoShrink z99 top right">
        <span
          class="p2 textXs js-currentTime"
          role="timer"
          aria-label="Current time"
          aria-live="off"
          >0:00</span
        >
      </div>`;

    if (value === 'download')
      return html`<fc-player-button
        class="w2 flexNoShrink"
        label="download"
        type="download"
        .disabled=${controls.download.disabled}
        @click=${this.#onDownloadClick}
      ></fc-player-button>`;

    if (value === 'collapse')
      return html`<fc-player-button
        class="w2 flexNoShrink"
        @click=${this.#onToggleCollapseClick}
        label="toggle"
        type="${controls.collapse.toggled ? 'unfoldmore' : 'unfoldless'}"
      ></fc-player-button>`;

    return '';
  }

  set collapsed(v) {
    const from = v ? 'collapse' : 'collapse:toggled';
    const to = v ? 'collapse:toggled' : 'collapse';
    this.controls = this.controls.join(' ').replace(from, to).split(' ');
  }
}
