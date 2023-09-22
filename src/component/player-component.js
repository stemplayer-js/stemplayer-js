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
import { Controller } from '@soundws/hls-web-audio';
import {
  defineCustomElements as defineControlComponent,
  ControlComponent,
} from './control-component';
import { defineCustomElements as defineStemsListComponent } from './stems-list-component';
import { defineCustomElements as defineMaskComponent } from './mask-component';
import { defineCustomElements as defineIconComponent } from './icon-component';
import config from '../config';
import defineCustomElement from '../lib/define-custom-element';

/**
 * The main stem player web-component.
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

 * @cssprop [--sws-stemsplayer-font-family="'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif"]
 * @cssprop [--sws-stemsplayer-font-size=16px]
 * @cssprop [--sws-stemsplayer-color=rgb(220, 220, 220)]
 * @cssprop [--sws-stemsplayer-accent-color=rgb(1, 164, 179)]
 * @cssprop [--sws-stemsplayer-bg-color=black]
 * @cssprop [--sws-stemsplayer-row-height=60px]
 * @cssprop [--sws-stemsplayer-wave-color]
 * @cssprop [--sws-stemsplayer-wave-progress-color]
 * @cssprop [--sws-stemsplayer-wave-pixel-ratio=2]
 */
export class PlayerComponent extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(
          --sws-stemsplayer-font-family,
          'Franklin Gothic Medium',
          'Arial Narrow',
          Arial,
          sans-serif
        );
        font-size: var(--sws-stemsplayer-font-size, 16px);
        color: var(--sws-stemsplayer-color, rgb(220, 220, 220));
        background-color: var(--sws-stemsplayer-bg-color, black);
      }
      .relative {
        position: relative;
      }
      .hide {
        position: absolute;
        left: -999%;
      }
    `;
  }

  constructor() {
    super();

    // set default values for props
    this.loadingIcon = 'loading';
    this.sampleRate = 22050;
    this.autoplay = false;
    this.loop = false;

    // Add event listeners
    this.addEventListener('peaks', this.onPeaks);
    this.addEventListener('play-click', this.onPlay);
    this.addEventListener('pause-click', this.onPause);

    // these events bubble up
    this.addEventListener('loading-start', this.onLoadingStart);
    this.addEventListener('loading-end', this.onLoadingEnd);
    this.addEventListener('stem-loading-error', ({ detail }) =>
      this.dispatchEvent(new ErrorEvent('error', { error: detail }))
    );
    this.addEventListener('waveform-loading-error', ({ detail }) =>
      this.dispatchEvent(new ErrorEvent('error', { error: detail }))
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.controller = this.createController();

    if (this.fontFamily) this.style.setProperty('--sws-stemsplayer-font-family', this.fontFamily);
    if (this.fontSize) this.style.setProperty('--sws-stemsplayer-font-size', this.fontSize);
    if (this.color) this.style.setProperty('--sws-stemsplayer-color', this.color);
    if (this.accentColor)
      this.style.setProperty('--sws-stemsplayer-accent-color', this.accentColor);
    if (this.backgroundColor)
      this.style.setProperty('--sws-stemsplayer-bg-color', this.backgroundColor);
    if (this.rowHeight) this.style.setProperty('--sws-stemsplayer-row-height', this.rowHeight);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.controller.destroy();
    this.controller = null;
  }

  firstUpdated() {
    setTimeout(() => {
      if (this.controls) this.controls.controller = this.controller;

      this.stems?.forEach((stemComponent) => {
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
       * The CSS font family
       */
      fontFamily: { attribute: 'font-family' },

      /**
       * The text color of the component
       */
      color: { attribute: 'color' },

      /**
       * The font-size of the component
       */
      fontSize: { attribute: 'font-size' },

      /**
       * The accent color of the component. Accent color determines for example the "hover" background of buttons.
       */
      accentColor: { attribute: 'accent-color' },

      /**
       * The background color of the component
       */
      backgroundColor: { attribute: 'background-color' },

      /**
       * The height of each row Each stem will occupy one row.
       */
      rowHeight: { attribute: 'row-height' },

      /**
       * The loading to use when the player goes into a "loading" state.
       * @type {"loading"|""}
       */
      loadingIcon: { attribute: 'loading-icon' },

      /**
       * The sample rate used for instantiating the audioContext
       * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
       */
      sampleRate: { attribute: 'sample-rate', type: Number },

      /**
       * Whether to (attempt) autoplay
       */
      autoplay: { attribute: 'autoplay' },

      /**
       * overrides the duration
       */
      duration: { type: Number },

      /**
       * overrides the duration
       */
      loop: { type: Boolean },
    };
  }

  render() {
    return html`<div class="relative" aria-label="Stem Player powered by sound.ws" role="region">
      <slot name="header"></slot>
      <soundws-stems-list maxHeight=${this.maxHeight} .controller=${this.controller}
        ><slot></slot
      ></soundws-stems-list>
      <slot name="footer"></slot>
      ${this.isLoading
        ? html`<soundws-mask>
            <soundws-icon icon="${this.loadingIcon}"></soundws-icon>
          </soundws-mask>`
        : ''}
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
      stems: this.shadowRoot?.querySelector('soundws-stems-list').state,
    };
  }

  /**
   * @private
   */
  setControlsComponentPeaks(peaks) {
    if (this.controls) {
      this.controls.peaks = peaks;
    }
  }

  /**
   * @private
   * @returns {Controller}
   */
  createController() {
    const controller = new Controller({
      ac: config.ac || this.ac,
      acOpts: { latencyHint: 'playback', sampleRate: this.sampleRate },
      duration: this.duration,
      loop: this.loop,
    });

    const exposeEvent = (event, exposeAs) => {
      controller.on(event, (args) => {
        this.dispatchEvent(new CustomEvent(exposeAs || event, { detail: args, bubbles: true }));
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

    controller.on('error', (err) => this.dispatchEvent(new ErrorEvent('error', err)));

    if (this.autoplay) this.addEventListener('loading-end', this.play, { once: true });

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
    if (this.controller) this.controller.duration = duration;
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
      .map((slot) => slot.assignedElements().find((e) => e instanceof ControlComponent))
      .find((e) => !!e);
  }

  get stems() {
    return this.stemListComponent?.stems;
  }

  /**
   *@private
   */
  get stemListComponent() {
    return this.shadowRoot?.querySelector('soundws-stems-list');
  }
}

/**
 * Export side-effects separately
 * @see https://open-wc.org/guides/developing-components/publishing/#do-export-side-effects-separately
 */
export const defineCustomElements = () => {
  defineCustomElement('soundws-stem-player', PlayerComponent);
  defineStemsListComponent();
  defineMaskComponent();
  defineIconComponent();
  defineControlComponent();
};
