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

/**
 * A Stem Player web component
 *
 * @slot header - The slot names "header"
 * @slot - The default slot
 * @slot footer - The default slot
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
    `;
  }

  constructor() {
    super();

    // set default values for props
    this.autoplay = false;
    this.loop = false;
    this.noHover = false;

    this.addEventListener('peaks', this.onPeaks);
    this.addEventListener('play-click', this.onPlay);
    this.addEventListener('pause-click', this.onPause);

    // these events bubble up
    this.addEventListener('loading-start', this.onLoadingStart);
    this.addEventListener('loading-end', this.onLoadingEnd);

    if (!this.noHover) this.addEventListener('pointermove', this.onHover);
  }

  connectedCallback() {
    super.connectedCallback();

    this.controller = this.createController();

    if (this.rowHeight) {
      this.style.setProperty('--stemplayer-js-row-height', this.rowHeight);
    }

    if (this.maxHeight) {
      this.style.setProperty('--stemplayer-js-max-height', this.maxHeight);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.controller.destroy();
    this.controller = null;
  }

  firstUpdated() {
    setTimeout(() => {
      if (this.controls) this.controls.controller = this.controller;

      this.stems?.forEach(stemComponent => {
        // eslint-disable-next-line no-param-reassign
        stemComponent.controller = this.controller;
      });
    }, 0);
  }

  static get properties() {
    return {
      isLoading: { type: Boolean },

      /**
       * Limits the height of the "body" slot, making that section scrollable
       * @type {string}
       */
      maxHeight: { attribute: 'max-height' },

      /**
       * The height of each row Each stem will occupy one row.
       */
      rowHeight: { attribute: 'row-height' },

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

  render() {
    return html`<div
      class="relative"
      aria-label="Stem Player powered by sound.ws"
      role="region"
    >
      <slot name="header"></slot>
      <stemplayer-js-stemslist
        .controller=${this.controller}
        ><slot></slot
      ><stemplayer-js-stemslist>
      <slot name="footer"></slot>
      ${
        this.isLoading
          ? html`<soundws-mask>
            <soundws-loader></soundws-icon>
          </soundws-mask>`
          : ''
      }
      ${
        this.displayMode === 'lg' && !this.noHover
          ? html`<div class="hover"></div>`
          : ''
      }
    </div>`;
  }

  /**
   * @private
   * @param {Event} e
   */
  onPeaks(e) {
    this.setControlsComponentPeaks(e.detail.peaks);
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
      stems: this.shadowRoot?.querySelector('stemplayer-js-stemslist').state,
    };
  }

  /**
   * @private
   */
  setControlsComponentPeaks(peaks) {
    if (peaks && this.controls) {
      this.controls.peaks = peaks;
    }
  }

  /**
   * @private
   * @returns {Controller}
   */
  createController() {
    const controller = new Controller({
      ac: this.audioContext,
      acOpts: { latencyHint: 'playback', sampleRate: 44100 },
      duration: this.duration,
      loop: this.loop,
    });

    const exposeEvent = (event, exposeAs) => {
      controller.on(event, args => {
        this.dispatchEvent(
          new CustomEvent(exposeAs || event, { detail: args, bubbles: true }),
        );
      });
    };

    controller.on('pause-start', () => {
      this.isLoading = true;
      this.dispatchEvent(new Event('loading-start'));
    });

    controller.on('pause-end', () => {
      this.isLoading = false;
      this.dispatchEvent(new Event('loading-end'));
    });

    exposeEvent('timeupdate');
    exposeEvent('end');
    exposeEvent('seek');
    exposeEvent('start');
    exposeEvent('pause');

    controller.on('error', err =>
      this.dispatchEvent(new ErrorEvent('error', err)),
    );

    if (this.autoplay)
      this.addEventListener('loading-end', this.play, { once: true });

    return controller;
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
}
