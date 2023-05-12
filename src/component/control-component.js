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
import { LitElement, html, css } from 'lit';
import gridStyles from '../styles/grid';
import rowStyles from '../styles/row';
import flexStyles from '../styles/flex';
import spacingStyles from '../styles/spacing';
import typographyStyles from '../styles/typography';
import { defineCustomElements as defineBtnIconComponent } from './btn-icon-component';
import { defineCustomElements as defineWaveformComponent } from './waveform-component';
import { defineCustomElements as defineSeekComponent } from './seek-component';
import formatSeconds from '../lib/format-seconds';
import onResize from '../lib/on-resize';
import defineCustomElement from '../lib/define-custom-element';

const responsiveBreakpoints = {
  xs: '600',
  sm: '800',
};

export class ControlComponent extends LitElement {
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,

      // NOTE: children of this component (such as btnIcon component) use the main css var --sws-stemsplayer-color
      // in order to be able to override color on a stemcomponent level, we re-initialise this global css var (--sws-stemsplayer-color)
      // with the component level css var (--sws-stemsplayer-controls-color)
      css`
        :host {
          --sws-stemsplayer-color: var(--sws-stemsplayer-controls-color, rgb(220, 220, 220));
          --sws-stemsplayer-bg-color: var(--sws-stemsplayer-controls-bg-color, rgb(35, 35, 35));

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
      controller: { type: Object },
      duration: { type: Number },
      currentTime: { type: Number },
      currentPct: { type: Number },
      peaks: { type: Array },
      isPlaying: { type: Boolean },
      isLoading: { type: Boolean },

      /**
       * The displayMode determines normal or small screen rendering
       */
      displayMode: { type: String },

      /**
       * The rowHeight
       */
      rowHeight: { attribute: false },

      /**
       * Text color
       */
      color: { attribute: 'color' },

      /**
       * The elements background color
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
    };
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.color) this.style.setProperty('--sws-stemsplayer-controls-color', this.color);
    if (this.backgroundColor)
      this.style.setProperty('--sws-stemsplayer-controls-bg-color', this.backgroundColor);

    // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer. This has the possibility of being unreliable.
    // get some stuff that is not styled by css from css vars anyway (for nice theming)
    // NOTE: we add a delay to allow the browser to sort itself out.
    setTimeout(() => {
      const computedStyle = getComputedStyle(this);

      if (!this.waveColor)
        this.waveColor =
          computedStyle.getPropertyValue('--sws-stemsplayer-controls-wave-color') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-color') ||
          'white';

      if (!this.waveProgressColor)
        this.waveProgressColor =
          computedStyle.getPropertyValue('--sws-stemsplayer-controls-wave-progress-color') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-progress-color') ||
          'rgb(0, 206, 224)';

      if (!this.wavePixelRatio) {
        this.wavePixelRatio =
          computedStyle.getPropertyValue('--sws-stemsplayer-controls-wave-pixel-ratio') ||
          computedStyle.getPropertyValue('--sws-stemsplayer-wave-pixel-ratio') ||
          2;
      }

      const container = this.shadowRoot.firstElementChild;

      // respond to resize events
      this.onResizeCallback = onResize(container, () => this.recalculateDisplayMode());

      // get the rowHeight so we know the height for the waveform
      this.rowHeight = container.clientHeight;
    }, 100);
  }

  set controller(controller) {
    if (controller) {
      controller.on('start', () => {
        this.duration = controller.duration;
        this.isPlaying = true;
      });

      controller.on('pause', () => {
        this.isPlaying = false;
      });

      controller.on('duration', () => {
        this.duration = controller.duration;
      });

      controller.on('timeupdate', ({ t, pct }) => {
        this.currentTime = t;
        this.currentPct = pct;
      });

      controller.on('seek', ({ t, pct }) => {
        this.currentTime = t;
        this.currentPct = pct;
      });

      controller.on('end', () => {
        this.currentTime = 0;
        this.currentPct = 0;
      });

      this._controller = controller;
    }
  }

  get controller() {
    return this._controller;
  }

  disconnectedCallback() {
    this.onResizeCallback?.un();
    this.onResizeCallback = null;

    this._controller = null;

    super.disconnectedCallback();
  }

  recalculateDisplayMode() {
    const { xs, sm } = responsiveBreakpoints;
    let size = 'lg';

    if (this.clientWidth < sm) size = 'sm';
    if (this.clientWidth < xs) size = 'xs';

    this.displayMode = size;
  }

  render() {
    return html` <div class="row">
      <div class="dFlex flexRow">
        <div class="w2 w3sm p1">
          ${this.isPlaying
            ? html`<soundws-btn-icon
                @click=${this.pause}
                title="Pause"
                icon="pause"
              ></soundws-btn-icon>`
            : html`<soundws-btn-icon
                @click=${this.play}
                title="Play"
                icon="play"
              ></soundws-btn-icon>`}
        </div>
        ${this.displayMode !== 'xs'
          ? html`<div class="w9 truncate hideXs p1 textCenter">
              <span>${this.label}</span>
            </div>`
          : ''}
        <div class="w2 textXs textMuted textCenter">
          <span>${formatSeconds(this.currentTime)}</span>
        </div>
        <div class="flex1">
          ${this.displayMode === 'lg' && this.rowHeight
            ? html`<soundws-waveform
                .options=${{
                  waveColor: this.waveColor,
                  progressColor: this.waveProgressColor,
                  height: this.rowHeight,
                  pixelRatio: this.wavePixelRatio,
                }}
                .peaks=${this.peaks}
                .pct=${this.currentPct}
                @seek=${(e) => this.handleSeek(e.detail.pct)}
              ></soundws-waveform>`
            : html`<soundws-seek
                .value=${this.currentPct * 100}
                @seeking=${this.handleSeeking}
                @seek=${(e) => this.handleSeek(e.detail / 100)}
              ></soundws-seek>`}
        </div>
        <div class="w2 truncate textXs textMuted textCenter">
          <span>${formatSeconds(this.duration)}</span>
        </div>
      </div>
    </div>`;
  }

  play() {
    this.dispatchEvent(new Event('play-click', { bubbles: true }));
  }

  pause() {
    this.dispatchEvent(new Event('pause-click', { bubbles: true }));
  }

  async handleSeeking() {
    const { state } = this.controller;

    // Seeking occurs when moving the seek slider using the keyboard. Repeated events are fired and we want to
    // pause the clock for a while when seeking so that the running clock doesnt compete with the input value.
    if (state === 'running') {
      this.controller.pause();
      this.controller.once('seek', () => {
        this.controller.playOnceReady();
      });
    }
  }

  handleSeek(pct) {
    this.controller.pct = pct;
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-stem-player-controls', ControlComponent);
  defineBtnIconComponent();
  defineWaveformComponent();
  defineSeekComponent();
};
