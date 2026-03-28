import { html, css } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { ContextProvider } from '@lit/context';
import Controller from '@firstcoders/hls-web-audio/core/AudioController.js';
import Peaks from '@firstcoders/waveform-element/Peaks.js';
import { playerStateContext } from './contexts.js';
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
            --stemplayer-js-brand-color,
            #01a4b3
          );
          --fc-range-focus-background-color: var(
            --stemplayer-js-brand-color,
            #01a4b3
          );
          --fc-slider-handle-border-right-color: var(
            --stemplayer-js-brand-color,
            #01a4b3
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

      /**
       * Enable locking for the region selection
       */
      lockRegions: { type: Boolean },

      /**
       * How often the UI should update during playback, in milliseconds.
       * Defaults to 250ms (approximately 4 times per second). Controls both the
       * player state updates and the timeupdate event emission rate.
       */
      uiUpdateInterval: { type: Number, attribute: 'ui-update-interval' },

      /**
       * Pixels per second for waveform rendering (calculated)
       */

      pixelsPerSecond: { state: true },
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
  #debouncedRecalculatePixelsPerSecond;

  /** @private */
  #nLoading = 0;

  /** @private */
  #playerStateProvider;

  /** @private */
  #lastPeaksData = [];

  constructor() {
    super();

    // set default values for props
    this.autoplay = false;
    this.loop = false;
    this.noKeyboardEvents = false;
    this.#debouncedMergePeaks = debounce(this.#mergePeaks, 100);
    this.#debouncedRecalculatePixelsPerSecond = debounce(
      this.#recalculatePixelsPerSecond,
      100,
    );
    this.regions = false;
    this.zoom = 1;
    this.collapsed = false;
    this.lockRegions = false;
    this.uiUpdateInterval = 250;
    this.pixelsPerSecond = 0;

    this.playerState = {
      currentTime: 0,
      currentPct: 0,
      duration: 0,
      isPlaying: false,
      loop: false,
      collapsed: false,
      peaks: null,
    };

    // Set up context provider
    this.#playerStateProvider = new ContextProvider(this, {
      context: playerStateContext,
      initialValue: this.playerState,
    });
  }

  /**
   * Updates multiple player state properties at once and provides them to consumers
   * @param {Object} props
   * @private
   */
  #updatePlayerState(props) {
    this.playerState = { ...this.playerState, ...props };
    this.#playerStateProvider.setValue(this.playerState);
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

    ['end', 'seek', 'start', 'pause', 'pause-end'].forEach(event => {
      controller.on(event, args => {
        this.dispatchEvent(
          new CustomEvent(event, { detail: args, bubbles: true }),
        );
      });
    });

    let tUiNext;
    let lastTickTime = 0;
    const uiTick = timestamp => {
      const currentTimestamp = timestamp || performance.now();

      if (currentTimestamp - lastTickTime >= this.uiUpdateInterval) {
        lastTickTime = currentTimestamp;

        const { currentTime: t, pct } = controller;

        // Push clock values directly to children — bypassing ContextProvider entirely
        // avoids triggering the ContextConsumer cascade (12+ microtasks per tick)
        this.stemComponents.forEach(el => {
          el.currentPct = pct;
        });
        this.controlsComponents.forEach(el => {
          el.currentTime = t;
          el.currentPct = pct;
        });

        this.dispatchEvent(
          new CustomEvent('timeupdate', {
            detail: {
              t,
              pct,
              remaining: controller.remaining,
              act: controller.ac?.currentTime,
            },
            bubbles: true,
          }),
        );
      }

      if (
        controller.desiredState === 'resumed' ||
        controller.state === 'running' ||
        controller.isBuffering
      ) {
        tUiNext = requestAnimationFrame(uiTick);
      } else {
        tUiNext = undefined;
      }
    };

    controller.on('start', () => {
      if (tUiNext) cancelAnimationFrame(tUiNext);
      lastTickTime = 0; // force immediate update on start
      tUiNext = requestAnimationFrame(uiTick);
    });

    controller.on('pause-end', () => {
      if (
        (controller.desiredState === 'resumed' ||
          controller.state === 'running') &&
        !tUiNext
      ) {
        tUiNext = requestAnimationFrame(uiTick);
      }
      this.isLoading = false;
      this.dispatchEvent(new Event('loading-end'));
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

    controller.on('error', err => {
      if (tUiNext) cancelAnimationFrame(tUiNext);
      this.dispatchEvent(new ErrorEvent('error', err));
    });

    controller.on('end', () => {
      if (tUiNext) cancelAnimationFrame(tUiNext);
      tUiNext = undefined;
      this.#updatePlayerState({
        currentTime: 0,
        currentPct: 0,
      });
    });

    controller.on('pause', () => {
      if (tUiNext) cancelAnimationFrame(tUiNext);
      tUiNext = undefined;
    });

    controller.on('seek', ({ t, pct }) => {
      this.#updatePlayerState({
        currentTime: t,
        currentPct: pct,
      });
      // Ensure we fire a single timeupdate on seek so UI renders exactly the seeked position immediately
      this.dispatchEvent(
        new CustomEvent('timeupdate', {
          detail: {
            t,
            pct,
            remaining: controller.remaining,
            act: controller.ac?.currentTime,
          },
          bubbles: true,
        }),
      );
    });

    controller.on('duration', duration => {
      this.#updatePlayerState({
        duration,
      });

      this.audioDuration = duration;

      this.style.setProperty('--stemplayer-duration', duration);

      this.#debouncedRecalculatePixelsPerSecond();
    });

    controller.on('offset', () => {
      this.regionOffset = controller.offset;
    });

    controller.on('playDuration', () => {
      this.regionDuration = controller.playDuration;
    });

    controller.on('start', () => {
      this.#updatePlayerState({
        duration: controller.duration,
        isPlaying: true,
      });
    });

    controller.on('pause', () => {
      this.#updatePlayerState({
        isPlaying: false,
        currentTime: controller.currentTime,
        currentPct: controller.pct,
      });
    });

    this.addEventListener('resize', () => {
      this.#debouncedRecalculatePixelsPerSecond();
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
    let offsetChanged = false;
    let durationChanged = false;

    changedProperties.forEach((oldValue, propName) => {
      if (['loop'].indexOf(propName) !== -1) {
        this.#controller.loop = this.loop;

        // notify the controls component of the change
        this.#updatePlayerState({
          loop: this.loop,
        });
      }
      if (['offset'].indexOf(propName) !== -1) {
        offsetChanged = true;
      }
      if (['duration'].indexOf(propName) !== -1) {
        durationChanged = true;
      }
      if (propName === 'zoom') {
        if (this.zoom < 1) this.zoom = 1; // zomming to smaller than 1 is pointless
        this.#debouncedRecalculatePixelsPerSecond();
      }
    });

    if (offsetChanged || durationChanged) {
      const parsedOffset = parseFloat(this.offset);
      const parsedDuration = parseFloat(this.duration);
      this.#controller.setRegion(
        Number.isNaN(parsedOffset) ? 0 : parsedOffset,
        Number.isNaN(parsedDuration) ? undefined : parsedDuration,
      );
    }
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
    return html`<div
      class="relative overflowHidden noSelect"
      role="region"
      aria-label="Audio Player"
    >
      <slot name="header" @slotchange=${this.#onSlotChange}></slot>
      <div
        class="scrollWrapper relative"
        style="${this.zoom === 1 ? 'overflow-x:hidden' : ''}"
      >
        <slot class="default" @slotchange=${this.#onSlotChange}></slot>

        <stemplayer-js-workspace
          ${ref(this.#workspace)}
          .totalDuration=${this.audioDuration}
          .offset=${this.regionOffset}
          .regionDuration=${this.regionDuration}
          .regions=${this.regions}
          .lockRegions=${this.lockRegions}
          .pixelsPerSecond=${this.pixelsPerSecond}
          @region:update=${this.#onRegionUpdate}
          @region:change=${this.#onRegionChange}
          class=${this.collapsed ? 'hidden h0' : ''}
        ></stemplayer-js-workspace>
      </div>
      <slot name="footer" @slotchange=${this.#onSlotChange}></slot>
      ${this.isLoading
        ? html`<fc-mask>
            <fc-loader></fc-loader>
          </fc-mask>`
        : ''}
    </div>`;
  }

  #getSmallScreenTpl() {
    return html`<div
      class="relative overflowHidden noSelect"
      role="region"
      aria-label="Audio Player"
    >
      ${this.isLoading
        ? html`<fc-mask>
            <fc-loader></fc-loader>
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
    this.#updatePlayerState({ collapsed: this.collapsed });
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
    const childPeaks = this.stemComponents.map(c => c.peaks).filter(e => !!e);

    // Check if the underlying peak data has actually changed
    const currentData = childPeaks.map(p => p.data);
    let changed = currentData.length !== this.#lastPeaksData.length;

    if (!changed) {
      for (let i = 0; i < currentData.length; i += 1) {
        if (currentData[i] !== this.#lastPeaksData[i]) {
          changed = true;
          break;
        }
      }
    }

    if (!changed) {
      return; // Skip expensive combine & re-render cycle
    }

    this.#lastPeaksData = currentData;

    const peaks = Peaks.combine(...childPeaks);

    // Provide the combined peaks to all consumers
    this.#updatePlayerState({ peaks });

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

  get controlsComponents() {
    return this.slottedElements.filter(e => e instanceof ControlComponent);
  }

  /**
   * @private
   */

  #onRegionChange(e) {
    const { offset, duration } = e.detail;
    this.#controller.setRegion(
      Number.isNaN(parseFloat(offset)) ? 0 : parseFloat(offset),
      Number.isNaN(parseFloat(duration)) ? undefined : parseFloat(duration),
    );
  }

  #onRegionUpdate(e) {
    const { offset, duration } = e.detail;
    this.regionOffset = offset;
    this.regionDuration = duration;
  }

  #recalculatePixelsPerSecond() {
    requestAnimationFrame(() => {
      const waveformWidth = this.#workspace.value?.waveformWidth;

      if (waveformWidth > 0 && this.#controller.duration > 0) {
        const pps = (waveformWidth / this.#controller.duration) * this.zoom;

        if (pps) {
          this.pixelsPerSecond = pps;
          // Keep CSS custom property for backwards compatibility
          this.style.setProperty('--fc-waveform-pixels-per-second', pps);
        }
      }
    });
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
