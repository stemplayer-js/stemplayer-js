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
import Controller from '@soundws/hls-web-audio/controller.js';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import { SoundwsStemPlayerControls as ControlComponent } from './StemPlayerControls.js';
import { SoundwsStemPlayerStem as StemComponent } from './StemPlayerStem.js';
import combinePeaks from './lib/combine-peaks.js';
import debounce from './lib/debounce.js';

/**
 * A Stem Player web component
 *
 * @slot header
 * @slot - The default (body) slot
 * @slot footer
 *
 * @fires loading-start - Fires when the player starts loading data
 * @fires loading-end - Fires when the player completes loading data
 * @fires timeupdate - Fires the player progresses
 * @fires start - Fires when the player starts playing
 * @fires pause - Fires when the player pauses playback
 * @fires seek - Fires when the player seeks
 * @fires end - Fires when the player reaches the end of the playback

 * @cssprop [--stemplayer-js-font-family="'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif"]
 * @cssprop [--stemplayer-js-font-size=16px]
 * @cssprop [--stemplayer-js-color=rgb(220, 220, 220)]
 * @cssprop [--stemplayer-js-accent-color=rgb(1, 164, 179)]
 * @cssprop [--stemplayer-js-background-color=black]
 * @cssprop [--stemplayer-js-row-height=60px]
 * @cssprop [--stemplayer-js-waveform-color]
 * @cssprop [--stemplayer-js-waveform-progress-color]
 * @cssprop [--stemplayer-js-wave-pixel-ratio=2]
 * @cssprop [--stemplayer-js-grid-base=1.5rem]
 * @cssprop [--stemplayer-js-max-height=auto]
 *
 */
export class SoundwsStemPlayer extends ResponsiveLitElement {
  static get styles() {
    return css`
      :host {
        --soundws-player-button-color: var(--stemplayer-js-color, white);
        --soundws-range-border-color: var(
          --stemplayer-js-accent-color,
          #01a4b3
        );
        --soundws-player-button-focus-background-color: var(
          --stemplayer-js-accent-color
        );
        --soundws-range-focus-background-color: var(
          --stemplayer-js-accent-color
        );
        --soundws-slider-handle-border-right-color: var(
          --stemplayer-js-accent-color
        );
        display: block;
        font-family: var(
          --stemplayer-js-font-family,
          'Franklin Gothic Medium',
          'Arial Narrow',
          Arial,
          sans-serif
        );
        font-size: var(--stemplayer-js-font-size, 1rem);
        color: var(--stemplayer-js-color, white);
        background-color: var(--stemplayer-js-background-color, black);
      }

      .relative {
        position: relative;
      }

      .hide {
        position: absolute;
        left: -999%;
      }

      .relative:hover .hover {
        opacity: 1;
      }

      .hover {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;
        pointer-events: none;
        height: 100%;
        width: 0;
        mix-blend-mode: overlay;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .stemsWrapper {
        max-height: var(--stemplayer-js-max-height, auto);
        overflow: auto;
      }
    `;
  }

  static get properties() {
    return {
      isLoading: { type: Boolean },

      /**
       * Whether to (attempt) autoplay
       */
      autoplay: { attribute: 'autoplay' },

      /**
       * overrides the duration
       */
      duration: { type: Number },

      /**
       * allows looping
       */
      loop: { type: Boolean },

      /**
       * Disabled the mouseover hover effect
       */
      noHover: { type: Boolean, attribute: 'no-hover' },

      /**
       * Inject an audio context
       */
      audioContext: { type: Object },
    };
  }

  constructor() {
    super();

    // set default values for props
    this.autoplay = false;
    this.loop = false;
    this.noHover = false;

    this.debouncedGeneratePeaks = debounce(
      () => this.generatePeaks(),
      200,
      true,
    );

    const controller = new Controller({
      ac: this.audioContext,
      acOpts: { latencyHint: 'playback', sampleRate: 44100 },
      duration: this.duration,
      loop: this.loop,
    });

    this.addEventListener('peaks', this.onPeaks);
    this.addEventListener('play-click', this.onPlay);
    this.addEventListener('pause-click', this.onPause);
    this.addEventListener('loading-start', this.onLoadingStart);
    this.addEventListener('loading-end', this.onLoadingEnd);
    if (!this.noHover) this.addEventListener('pointermove', this.onHover);
    this.addEventListener('stem-loading-start', this.onStemLoadingStart);
    this.addEventListener('stem-loading-end', this.onStemLoadingEnd);
    this.addEventListener('waveform-draw', this.onWaveformDraw);
    this.addEventListener('solo', this.onSolo);
    this.addEventListener('unsolo', this.onUnSolo);

    this.addEventListener('seek', e => {
      if (
        e.target instanceof StemComponent ||
        e.target instanceof ControlComponent
      ) {
        controller.pct = e.detail;
      }
    });

    this.addEventListener('seeking', () => {
      // stop playback while seeking (using the range slider)
      const { state } = controller;
      if (state === 'running') {
        controller.pause();
        controller.once('seek', () => {
          controller.playOnceReady();
        });
      }
    });

    if (this.autoplay) {
      this.addEventListener('loading-end', this.play, { once: true });
    }

    ['timeupdate', 'end', 'seek', 'start', 'pause'].forEach(event => {
      controller.on(event, args => {
        this.dispatchEvent(
          new CustomEvent(event, { detail: args, bubbles: true }),
        );
      });
    });

    controller.on('pause-start', () => {
      this.isLoading = true;
      this.dispatchEvent(new Event('loading-start'));
    });

    controller.on('pause-end', () => {
      this.isLoading = false;
      this.dispatchEvent(new Event('loading-end'));
    });

    controller.on('error', err =>
      this.dispatchEvent(new ErrorEvent('error', err)),
    );

    controller.on('timeupdate', ({ t, pct }) => {
      this.updateChildren({
        currentTime: t,
        currentPct: pct,
      });
    });

    controller.on('end', () => {
      this.updateChildren({
        currentTime: 0,
        currentPct: 0,
      });
    });

    controller.on('seek', ({ t, pct }) => {
      this.updateChildren({
        currentTime: t,
        currentPct: pct,
      });
    });

    controller.on('duration', duration => {
      this.updateChildren({
        duration,
      });
    });

    controller.on('start', () => {
      this.updateChildren({
        duration: controller.duration,
        isPlaying: true,
      });
    });

    controller.on('pause', () => {
      this.updateChildren({ isPlaying: false });
    });

    // store a reference
    this.controller = controller;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.controller.pause();
  }

  onSlotChange(e) {
    // inject the controller when an element is added to a slot
    e.target.assignedNodes().forEach(el => {
      if (el instanceof ControlComponent) {
        // eslint-disable-next-line no-param-reassign
        el.controller = this.controller;
      }

      // load the stem if the stem is added to the player
      if (el instanceof StemComponent) {
        el.load(this.controller);
      }
    });
  }

  render() {
    return html`<div class="relative">
      <slot name="header" @slotchange=${this.onSlotChange}></slot>
      <div class="stemsWrapper">
        <slot class="default" @slotchange=${this.onSlotChange}></slot>
      </div>
      <slot name="footer" @slotchange=${this.onSlotChange}></slot>
      ${this.isLoading
        ? html`<soundws-mask>
            <soundws-loader></soundws-icon>
          </soundws-mask>`
        : ''}
      ${this.displayMode === 'lg' && !this.noHover
        ? html`<div class="hover"></div>`
        : ''}
    </div>`;
  }

  /**
   * @private
   * @param {Event} e
   */
  onPeaks(e) {
    const { peaks } = e.detail;
    if (peaks && this.controls) {
      this.controls.peaks = peaks;
    }
  }

  /**
   * @private
   */
  onPlay() {
    this.controller.play();
  }

  /**
   * @private
   */
  onPause() {
    this.controller.pause();
  }

  /**
   * @private
   */
  onLoadingStart() {
    this.isLoading = true;
  }

  /**
   * @private
   */
  onLoadingEnd() {
    this.isLoading = false;
  }

  /**
   * Exports the current state of the player
   */
  get state() {
    const { state, currentTime } = this.controller;

    return {
      state,
      currentTime,
      stems: this.stemComponents.map(c => ({
        id: c.id,
        src: c.src,
        waveform: c.waveform,
        volume: c.volume,
        muted: c.muted,
        solo: c.solo,
      })),
    };
  }

  /**
   * Start playback
   */
  play() {
    return this.controller.play();
  }

  /**
   * Pause playback
   */
  pause() {
    return this.controller.pause();
  }

  /**
   * Gets the duration
   * @type {number}
   */
  get duration() {
    return this.controller?.duration || this._duration;
  }

  set duration(duration) {
    this._duration = duration;

    if (this.controller) {
      this.controller.duration = duration;
    }
  }

  /**
   * Sets the currentTime to a pct of total duration, seeking to that time
   * @type {number}
   */
  set pct(pct) {
    this.controller.pct = pct;
  }

  /**
   * Set the curentTime of playback, seeking to that time.
   * @type {number}
   */
  set currentTime(t) {
    this.controller.currentTime = t;
  }

  /**
   * Gets the controls component
   */
  get controls() {
    const slots = Array.from(this.shadowRoot.querySelectorAll('slot'));

    return slots
      .map(slot =>
        slot.assignedElements().find(e => e instanceof ControlComponent),
      )
      .find(e => !!e);
  }

  get stems() {
    return this.stemListComponent?.stems;
  }

  /**
   *@private
   */
  get stemListComponent() {
    return this.shadowRoot?.querySelector('stemplayer-js-stemslist');
  }

  onHover(e) {
    const el = this.shadowRoot.querySelector('.hover');

    // calculate left of waveforms
    const left =
      this.stemListComponent?.stemComponents[0]?.waveformComponent?.offsetLeft;

    if (el) {
      el.style.left = `${left}px`;
      el.style.width = `${e.offsetX - left}px`;
    }
  }

  /**
   * Calculates the "combined" peaks
   *
   * @private
   */
  generatePeaks() {
    const peaks = combinePeaks(
      ...this.stemComponents
        .map(c => c.peaks)
        .filter(e => !!e)
        .map(e => e.data),
    );

    this.dispatchEvent(
      new CustomEvent('peaks', {
        detail: { peaks, target: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * @private
   * @param {Event} e
   */
  onStemLoadingStart(e) {
    e.stopPropagation();

    if (this.nLoading === 0)
      this.dispatchEvent(
        new Event('loading-start', { bubbles: true, composed: true }),
      );

    this.nLoading += 1;
  }

  /**
   * @private
   * @param {Event} e
   */
  onStemLoadingEnd(e) {
    e.stopPropagation();

    this.nLoading -= 1;

    if (this.nLoading === 0)
      this.dispatchEvent(
        new Event('loading-end', { bubbles: true, composed: true }),
      );
  }

  /**
   * Listen to peaks events emitting from the stems
   * @private
   * @param {Event} e
   */
  onWaveformDraw(e) {
    if (e.target instanceof StemComponent) {
      e.stopPropagation();
      this.debouncedGeneratePeaks();
    }
  }

  /**
   * @private
   * @param {Event} e
   */
  onSolo(e) {
    e.stopPropagation();

    this.stemComponents?.forEach(stemComponent => {
      if (e.detail === stemComponent) {
        // eslint-disable-next-line no-param-reassign
        stemComponent.solo = 1;
      } else {
        // eslint-disable-next-line no-param-reassign
        stemComponent.solo = -1;
      }
    });
  }

  /**
   * @private
   * @param {Event} e
   */
  onUnSolo(e) {
    e.stopPropagation();

    this.stemComponents?.forEach(stemComponent => {
      // eslint-disable-next-line no-param-reassign
      stemComponent.solo = undefined;
    });
  }

  /**
   * @private
   */
  get slottedElements() {
    const slots = this.shadowRoot?.querySelectorAll('slot');

    return Array.from(slots)
      .map(slot => slot.assignedElements({ flatten: true }))
      .flat();
  }

  /**
   * Get the stem componenents
   *
   * @returns {Array}
   */
  get stemComponents() {
    return this.slottedElements.filter(e => e instanceof StemComponent);
  }

  updateChildren(props) {
    this.slottedElements.forEach(el => {
      if (el instanceof StemComponent || el instanceof ControlComponent)
        Object.keys(props).forEach(key => {
          // eslint-disable-next-line no-param-reassign
          el[key] = props[key];
        });
    });
  }
}
