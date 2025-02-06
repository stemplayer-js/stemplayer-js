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
import { createRef, ref } from 'lit/directives/ref.js';
import Controller from '@firstcoders/hls-web-audio/controller.js';
import Peaks from '@firstcoders/waveform-element/Peaks.js';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import { FcStemPlayerControls as ControlComponent } from './StemPlayerControls.js';
import { FcStemPlayerStem as StemComponent } from './StemPlayerStem.js';
import utilitiesStyles from './styles/utilities.js';
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
 * @cssprop [--stemplayer-js-brand-color=rgb(1, 164, 179)]
 * @cssprop [--stemplayer-js-background-color=black]
 * @cssprop [--stemplayer-js-row-height=4.5rem]
 * @cssprop [--stemplayer-js-waveform-color]
 * @cssprop [--stemplayer-js-waveform-bar-width]
 * @cssprop [--stemplayer-js-waveform-bar-gap]
 * @cssprop [--stemplayer-js-waveform-pixel-ratio]
 * @cssprop [--stemplayer-js-grid-base=1.5rem]
 * @cssprop [--stemplayer-js-max-height=auto]
 * @cssprop [--stemplayer-js-progress-background-color=rgba(255, 255, 255, 1)]
 * @cssprop [--stemplayer-js-progress-mix-blend-mode=overlay]
 * @cssprop [--stemplayer-js-row-controls-background-color=black]
 * @cssprop [--stemplayer-js-row-end-background-color=black]
 */
export class FcStemPlayer extends ResponsiveLitElement {
  #workspace = createRef();

  static get styles() {
    return [
      utilitiesStyles,
      css`
        :host {
          --fc-player-button-color: var(--stemplayer-js-color, white);
          --fc-range-border-color: var(--stemplayer-js-brand-color, #01a4b3);
          --fc-player-button-focus-background-color: var(
            --stemplayer-js-brand-color
          );
          --fc-range-focus-background-color: var(--stemplayer-js-brand-color);
          --fc-slider-handle-border-right-color: var(
            --stemplayer-js-brand-color
          );

          --stemplayer-js-row-controls-width: calc(
            var(--stemplayer-js-grid-base, 1.5rem) * 16
          );

          --stemplayer-js-row-end-width: calc(
            var(--stemplayer-js-grid-base, 1.5rem) * 2
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

        .scrollWrapper {
          max-height: var(--stemplayer-js-max-height, auto);
          overflow: auto;
        }
      `,
    ];
  }

  static get properties() {
    return {
      isLoading: { state: true },

      /**
       * Whether to (attempt) autoplay
       */
      autoplay: { attribute: 'autoplay', type: Boolean },

      /**
       * overrides the duration
       */
      duration: { type: Number },

      /**
       * the offset
       */
      offset: { type: Number },

      /**
       * Allows looping (experimental)
       */
      loop: { type: Boolean },

      /**
       * Zoom waveform
       */
      zoom: { type: Number },

      /**
       * Enable region selection
       */
      regions: { type: Boolean },

      /**
       * Inject a pre instantiated AudioContext
       * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
       */
      audioContext: { type: Object },

      /**
       * Inject a pre instantiated destination for the audio context to use
       * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode
       */
      destination: { type: Object },

      /**
       * Controls the player by keyboard events (e.g. space = start/pause)
       */
      noKeyboardEvents: { type: Boolean, attribute: 'no-keyboard-events' },

      audioDuration: { state: true },
      regionOffset: { state: true },
      regionDuration: { state: true },

      collapsed: { type: Boolean },
    };
  }

  /**
   * @private
   */
  #controller;

  /**
   * @private
   */
  #debouncedMergePeaks;

  /** @private */
  #nLoading = 0;

  constructor() {
    super();

    // set default values for props
    this.autoplay = false;
    this.loop = false;
    this.noKeyboardEvents = false;
    this.#debouncedMergePeaks = debounce(this.#mergePeaks, 100);
    this.regions = false;
    this.zoom = 1;
    this.collapsed = false;
  }

  firstUpdated() {
    const controller = new Controller({
      ac: this.audioContext,
      destination: this.destination,
      acOpts: { latencyHint: 'playback', sampleRate: 44100 },
      // duration: this.duration,
      loop: this.loop,
    });

    this.#controller = controller;

    this.addEventListener('controls:play', this.#onPlay);
    this.addEventListener('controls:pause', this.#onPause);
    this.addEventListener('controls:loop', this.#onToggleLoop);
    this.addEventListener('controls:collapse', this.#onToggleCollapse);
    this.addEventListener('controls:zoom:in', () => {
      this.zoom += 0.5;
    });
    this.addEventListener('controls:zoom:out', () => {
      this.zoom -= 0.5;
      if (this.zoom < 1) this.zoom = 1;
    });
    this.addEventListener('stem:load:start', this.#onStemLoadingStart);
    this.addEventListener('stem:load:end', this.#onStemLoadingEnd);
    this.addEventListener('stem:solo', this.#onSolo);
    this.addEventListener('stem:unsolo', this.#onUnSolo);
    this.addEventListener('stem:load:request', this.#loadStem);

    this.addEventListener('waveform:draw', this.#onWaveformDraw);

    const handleSeek = e => {
      controller.pct = e.detail;
    };

    this.addEventListener('waveform:seek', e => handleSeek(e));
    this.addEventListener('region:seek', e => handleSeek(e));
    this.addEventListener('controls:seek', e => handleSeek(e));

    this.addEventListener('controls:seeking', () => {
      if (controller.state === 'running') {
        controller.pause();
        controller.once('seek', () => {
          controller.playOnceReady();
        });
      }
    });

    this.addEventListener('stem:load:end', () => {
      if (this.autoplay && !this.stemComponents.find(e => !e.isLoaded)) {
        this.play();
      }
    });

    ['timeupdate', 'end', 'seek', 'start', 'pause'].forEach(event => {
      controller.on(event, args => {
        this.dispatchEvent(
          new CustomEvent(event, { detail: args, bubbles: true }),
        );
      });
    });

    controller.on('pause-start', () => {
      // prevent showing of loader if only buffering for a short period
      setTimeout(() => {
        if (controller.isBuffering) {
          this.isLoading = true;
        }
      }, 150);

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
      requestAnimationFrame(() => {
        this.#updateChildren({
          currentTime: t,
          currentPct: pct,
        });

        this.style.setProperty('--stemplayer-progress', t);
      });
    });

    controller.on('end', () => {
      this.#updateChildren({
        currentTime: 0,
        currentPct: 0,
      });
    });

    controller.on('seek', ({ t, pct }) => {
      this.#updateChildren({
        currentTime: t,
        currentPct: pct,
      });

      this.style.setProperty('--stemplayer-progress', t);
    });

    controller.on('duration', duration => {
      this.#updateChildren({
        duration,
      });

      this.audioDuration = duration;

      this.style.setProperty('--stemplayer-duration', duration);

      this.#recalculatePixelsPerSecond();
    });

    controller.on('offset', () => {
      this.regionOffset = controller.offset;
    });

    controller.on('playDuration', () => {
      this.regionDuration = controller.playDuration;
    });

    controller.on('start', () => {
      this.#updateChildren({
        duration: controller.duration,
        isPlaying: true,
      });
    });

    controller.on('pause', () => {
      this.#updateChildren({ isPlaying: false });
    });

    this.addEventListener('resize', () => {
      // allow time to stabilise
      setTimeout(() => {
        this.#recalculatePixelsPerSecond();
      }, 50);
    });
  }

  destroy() {
    this.#controller.destroy();
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.noKeyboardEvents) {
      this.keyDownlistener = e => this.#handleKeypress(e);
      window.addEventListener('keydown', this.keyDownlistener);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.pause();

    if (!this.noKeyboardEvents) {
      window.removeEventListener('keydown', this.keyDownlistener);
    }
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (['loop'].indexOf(propName) !== -1) {
        this.#controller.loop = this.loop;

        // notify the controls component of the change
        this.#updateChildren({
          loop: this.loop,
        });
      }
      if (['offset'].indexOf(propName) !== -1) {
        this.#controller.offset = parseFloat(this.offset); // for some reason, the value is sometimes reflected as a string
      }
      if (['duration'].indexOf(propName) !== -1) {
        this.#controller.playDuration = parseFloat(this.duration); // for some reason, the value is sometimes reflected as a string
      }
      if (propName === 'zoom') {
        if (this.zoom < 1) this.zoom = 1; // zomming to smaller than 1 is pointless
        this.#recalculatePixelsPerSecond();
      }
    });
  }

  /**
   * @private
   */
  #onSlotChange(e) {
    // inject the controller when an element is added to a slot
    e.target.assignedNodes().forEach(el => {
      if (el instanceof StemComponent) {
        el.load(this.#controller);
      }
    });

    this.#debouncedMergePeaks();
  }

  #loadStem(e) {
    const el = e.target;
    if (el.src) {
      el.load(this.#controller);
    }
  }

  render() {
    return html`<div>
      ${this.displayMode === 'lg'
        ? this.#getLargeScreenTpl()
        : this.#getSmallScreenTpl()}
    </div>`;
  }

  #getLargeScreenTpl() {
    return html`<div class="relative overflowHidden noSelect">
      <slot name="header" @slotchange=${this.#onSlotChange}></slot>
      <div
        class="scrollWrapper relative"
        style="${this.zoom === 1 ? 'overflow-x:hidden' : ''}"
      >
        <stemplayer-js-workspace
          ${ref(this.#workspace)}
          .totalDuration=${this.audioDuration}
          .offset=${this.regionOffset}
          .duration=${this.regionDuration}
          .regions=${this.regions}
          @region:update=${this.#onRegionUpdate}
          @region:change=${this.#onRegionChange}
          class=${this.collapsed ? 'hidden h0' : ''}
        >
          <slot class="default" @slotchange=${this.#onSlotChange}></slot>
        </stemplayer-js-workspace>
      </div>
      <slot name="footer" @slotchange=${this.#onSlotChange}></slot>
      ${this.isLoading
        ? html`<fc-mask>
            <fc-loader></fc-loader></fc-icon>
          </fc-mask>`
        : ''}
    </div>`;
  }

  #getSmallScreenTpl() {
    return html`<div class="relative overflowHidden noSelect">
      ${this.isLoading
        ? html`<fc-mask>
            <fc-loader></fc-loader></fc-icon>
          </fc-mask>`
        : ''}
      <div class="scrollWrapper">
        <slot name="header" @slotchange=${this.#onSlotChange}></slot>
        <slot class="default" @slotchange=${this.#onSlotChange}></slot>
        <slot name="footer" @slotchange=${this.#onSlotChange}></slot>
      </div>
    </div>`;
  }

  /**
   * @private
   */
  #onPlay() {
    this.#controller.play();
  }

  /**
   * @private
   */
  #onPause() {
    this.#controller.pause();
  }

  #onToggleLoop() {
    this.#controller.loop = !this.#controller.loop;
    this.loop = !this.loop;
  }

  #onToggleCollapse() {
    this.collapsed = !this.collapsed;
    this.#updateChildren({ collapsed: this.collapsed });
  }

  /**
   * Exports the current state of the player
   */
  get state() {
    const { state, currentTime } = this.#controller;

    return {
      state,
      currentTime,
      offset: this.#controller.offset,
      duration: this.#controller.playDuration,
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
    return this.#controller.play();
  }

  /**
   * Pause playback
   */
  pause() {
    return this.#controller.pause();
  }

  /**
   * Gets the duration
   * @type {number}
   */
  // get duration() {
  //   return this.#controller?.duration || this._duration;
  // }

  // set duration(duration) {
  //   this._duration = duration;

  //   if (this.#controller) {
  //     this.#controller.duration = duration;
  //   }
  // }

  /**
   * Sets the currentTime to a pct of total duration, seeking to that time
   * @type {number}
   */
  set pct(pct) {
    this.#controller.pct = pct;
  }

  /**
   * Set the curentTime of playback, seeking to that time.
   * @type {number}
   */
  set currentTime(t) {
    this.#controller.currentTime = t;
  }

  /**
   * Calculates the "combined" peaks
   *
   * @private
   */
  #mergePeaks() {
    const peaks = Peaks.combine(
      ...this.stemComponents.map(c => c.peaks).filter(e => !!e),
    );

    // pass the combined peaks to the controls component
    this.slottedElements
      .filter(el => el instanceof ControlComponent)
      .forEach(el => {
        el.peaks = peaks;
      });

    this.dispatchEvent(
      new CustomEvent('peaks', {
        detail: { peaks },
        bubbles: true,
      }),
    );
  }

  /**
   * @private
   * @param {Event} e
   */
  #onStemLoadingStart(e) {
    e.stopPropagation();

    if (this.#nLoading === 0) {
      this.isLoading = true;
      this.dispatchEvent(
        new Event('loading-start', { bubbles: true, composed: true }),
      );
    }

    this.#nLoading += 1;
  }

  /**
   * @private
   * @param {Event} e
   */
  #onStemLoadingEnd(e) {
    e.stopPropagation();

    this.#nLoading -= 1;

    if (this.#nLoading === 0) {
      this.isLoading = false;
      this.dispatchEvent(
        new Event('loading-end', { bubbles: true, composed: true }),
      );
    }
  }

  /**
   * Listen to peaks events emitting from the stems
   *
   * @private
   * @param {Event} e
   */
  #onWaveformDraw(e) {
    e.stopPropagation();

    if (e.target instanceof StemComponent) {
      this.#debouncedMergePeaks(e);
    }
  }

  /**
   * @private
   * @param {Event} e
   */
  #onSolo(e) {
    e.stopPropagation();

    this.stemComponents?.forEach(el => {
      if (e.detail === el) {
        el.solo = 'on';
      } else {
        el.solo = 'muted';
      }
    });
  }

  /**
   * @private
   * @param {Event} e
   */
  #onUnSolo(e) {
    e.stopPropagation();

    this.stemComponents?.forEach(el => {
      el.solo = 'off';
    });
  }

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

  /**
   * @private
   */
  #updateChildren(props) {
    this.slottedElements.forEach(el => {
      if (el instanceof StemComponent || el instanceof ControlComponent)
        Object.keys(props).forEach(key => {
          el[key] = props[key];
        });
    });
  }

  #onRegionChange(e) {
    const { offset, duration } = e.detail;
    this.#controller.offset = offset;
    this.#controller.playDuration = duration;
  }

  #onRegionUpdate(e) {
    const { offset, duration } = e.detail;
    this.regionOffset = offset;
    this.regionDuration = duration;
  }

  #recalculatePixelsPerSecond() {
    if (this.stemComponents[0]?.row) {
      const pps =
        ((this.clientWidth - this.stemComponents[0].row.nonFlexWidth) /
          this.#controller.duration) *
        this.zoom;

      if (pps) this.style.setProperty('--fc-waveform-pixels-per-second', pps);
    }
  }

  // keypress event
  #handleKeypress(e) {
    if (e.defaultPrevented) {
      return; // Should do nothing if the default action has been cancelled
    }

    const [target] = e.composedPath();

    // control player on spacebar
    if (e.code.toLowerCase() === 'space') {
      // ignore form input events
      if (
        ['INPUT', 'TEXTAREA', 'BUTTON'].indexOf(
          target.tagName.toUpperCase(),
        ) !== -1
      )
        return;

      if (this.#controller.state !== 'running') this.play();
      else this.pause();
      e.preventDefault();
    }

    if (e.code.toLowerCase() === 'escape') {
      target.blur();
    }
  }
}
