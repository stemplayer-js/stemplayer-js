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
import Peaks from '@soundws/waveform-element/Peaks.js';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import { SoundwsStemPlayerControls as ControlComponent } from './StemPlayerControls.js';
import { SoundwsStemPlayerStem as StemComponent } from './StemPlayerStem.js';
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
 * @cssprop [--stemplayer-js-waveform-progress-color]
 * @cssprop [--stemplayer-js-waveform-bar-width]
 * @cssprop [--stemplayer-js-waveform-bar-gap]
 * @cssprop [--stemplayer-js-waveform-pixel-ratio]
 * @cssprop [--stemplayer-js-grid-base=1.5rem]
 * @cssprop [--stemplayer-js-max-height=auto]
 * @cssprop [--stemplayer-hover-mix-blend-mode=overlay]
 * @cssprop [--stemplayer-hover-background-color=rgba(255, 255, 255, 0.5)]
 */
export class SoundwsStemPlayer extends ResponsiveLitElement {
  static get styles() {
    return [
      utilitiesStyles,
      css`
        :host {
          --soundws-player-button-color: var(--stemplayer-js-color, white);
          --soundws-range-border-color: var(
            --stemplayer-js-brand-color,
            #01a4b3
          );
          --soundws-player-button-focus-background-color: var(
            --stemplayer-js-brand-color
          );
          --soundws-range-focus-background-color: var(
            --stemplayer-js-brand-color
          );
          --soundws-slider-handle-border-right-color: var(
            --stemplayer-js-brand-color
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
          mix-blend-mode: var(--stemplayer-hover-mix-blend-mode, overlay);
          background: var(
            --stemplayer-hover-background-color,
            rgba(255, 255, 255, 0.75)
          );
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .stemsWrapper {
          max-height: var(--stemplayer-js-max-height, auto);
          overflow: auto;
        }

        stemplayer-js-region {
          position: absolute;
          height: 100%;
          z-index: 9999;
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
       * Disabled the mouseover hover effect
       */
      noHover: { type: Boolean, attribute: 'no-hover' },

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
       * Controls the player by keyboard events (e.g. space = start/pause)
       */
      noKeyboardEvents: { type: Boolean, attribute: 'no-keyboard-events' },

      regionLeft: { state: true },
      regionWidth: { state: true },
      audioDuration: { state: true },
      regionOffset: { state: true },
      regionDuration: { state: true },
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

  /**
   * @private
   */
  #handleKeypress;

  /** @private */
  #nLoading = 0;

  constructor() {
    super();

    // set default values for props
    this.autoplay = false;
    this.loop = false;
    this.noHover = false;
    this.noKeyboardEvents = false;
    this.#debouncedMergePeaks = debounce(this.#mergePeaks, 100);
    this.regions = false;

    const controller = new Controller({
      ac: this.audioContext,
      acOpts: { latencyHint: 'playback', sampleRate: 44100 },
      // duration: this.duration,
      loop: this.loop,
    });

    this.#controller = controller;

    this.addEventListener('controls:play', this.#onPlay);
    this.addEventListener('controls:pause', this.#onPause);
    this.addEventListener('controls:loop', this.#onToggleLoop);
    // this.addEventListener('peaks', this.onPeaks);
    this.addEventListener('stem:load:start', this.#onStemLoadingStart);
    this.addEventListener('stem:load:end', this.#onStemLoadingEnd);
    this.addEventListener('stem:solo', this.#onSolo);
    this.addEventListener('stem:unsolo', this.#onUnSolo);
    this.addEventListener('waveform:draw', this.#onWaveformDraw);
    if (!this.noHover) this.addEventListener('pointermove', this.#onHover);

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
      this.#updateChildren({
        currentTime: t,
        currentPct: pct,
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
    });

    controller.on('duration', duration => {
      this.#updateChildren({
        duration,
      });

      this.audioDuration = duration;
    });

    controller.on('offset', () => {
      this.regionOffset = controller.offset;
      this.offset = controller.offset;
    });

    controller.on('playDuration', () => {
      this.regionDuration = controller.playDuration;
      // this.duration = controller.playDuration;
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

    // keypress event
    this.#handleKeypress = e => {
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
    };
  }

  destroy() {
    this.#controller.destroy();
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.noKeyboardEvents) {
      window.addEventListener('keydown', this.#handleKeypress);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.pause();

    if (!this.noKeyboardEvents) {
      window.removeEventListener('keydown', this.#handleKeypress);
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
        this.#controller.offset = this.offset;
      }
      if (['duration'].indexOf(propName) !== -1) {
        this.#controller.playDuration = this.duration;
      }
    });
  }

  /**
   * @private
   */
  #onSlotChange(e) {
    // inject the controller when an element is added to a slot
    e.target.assignedNodes().forEach(el => {
      // load the stem when the stem is added to the player
      if (el instanceof StemComponent) {
        el.load(this.#controller);
      }
    });

    this.#debouncedMergePeaks();
  }

  render() {
    return html`<div class="relative overflowHidden">
      ${this.displayMode === 'lg' &&
      this.regions &&
      this.regionLeft &&
      this.regionWidth
        ? html`<stemplayer-js-region
            .totalDuration=${this.audioDuration}
            .offset=${this.regionOffset}
            .duration=${this.regionDuration}
            @region:update=${this.#onRegionUpdate}
            @region:change=${this.#onRegionChange}
            style="left: ${this.regionLeft}; width: ${this.regionWidth}"
          ></stemplayer-js-region>`
        : ''}
      <slot name="header" @slotchange=${this.#onSlotChange}></slot>
      <div class="stemsWrapper">
        <slot class="default" @slotchange=${this.#onSlotChange}></slot>
      </div>
      <slot name="footer" @slotchange=${this.#onSlotChange}></slot>
      ${this.isLoading
        ? html`<soundws-mask>
            <soundws-loader></soundws-loader></soundws-icon>
          </soundws-mask>`
        : ''}
      ${this.displayMode === 'lg' && !this.noHover
        ? html`<div class="hover"></div>`
        : ''}
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
   *@private
   */
  #onHover(e) {
    // see if are hovering over the correct elements
    const targetEl = e
      .composedPath()
      .find(
        el =>
          ['SOUNDWS-WAVEFORM', 'STEMPLAYER-JS-REGION'].indexOf(el.tagName) !==
          -1,
      );

    // over element
    const el = this.shadowRoot.querySelector('.hover');

    if (el && targetEl) {
      const left = targetEl.offsetLeft;
      let width = e.offsetX - left > 0 ? e.offsetX - left : 0;
      if (width > targetEl.offsetWidth) width = targetEl.offsetWidth;

      el.style.left = `${left}px`;
      el.style.width = `${width}px`;
    }
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
      this.#debouncedMergePeaks();
    }

    // calculate the positioning of the region element
    // @todo Not sure why but offsetLeft leaves 1 pixel of the underlying waveform visible
    const padding = 1;
    this.regionLeft = `${e.detail.offsetLeft - padding}px`;
    this.regionWidth = `${e.detail.offsetWidth + padding}px`;
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
}
