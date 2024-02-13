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
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import formatSeconds from './lib/format-seconds.js';
import { defaults } from './config.js';
import { computeWaveformStyles } from './lib/compute-styles.js';

export class SoundwsStemPlayerControls extends ResponsiveLitElement {
  /**
   * Safari does not like inherit for css variables
   * https://stackoverflow.com/questions/48079541/css-variables-inheritance-and-fallback
   */
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      css`
        :host {
          --soundws-player-button-color: var(
            --stemplayer-js-controls-color,
            var(--stemplayer-js-color, white)
          );
          display: block;
          color: var(--stemplayer-js-controls-color, inherit);
          background-color: var(
            --stemplayer-js-controls-background-color,
            inherit
          );
        }
      `,
    ];
  }

  static get properties() {
    return {
      ...ResponsiveLitElement.properties,
      label: { type: String },
      controller: { type: Object },
      duration: { type: Number },
      currentTime: { type: Number },
      currentPct: { type: Number },
      peaks: { type: Object },
      isPlaying: { type: Boolean },
      isLoading: { type: Boolean },
      rowHeight: { attribute: false },
      waveColor: { type: String },
      waveProgressColor: { type: String },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      this.computedWaveformStyles = this.computeWaveformStyles();

      // get the rowHeight so we know the height for the waveform
      this.rowHeight = this.shadowRoot.firstElementChild.clientHeight;
    }, 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.onResizeCallback?.un();
    this.onResizeCallback = null;
    this._controller = null;
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

  render() {
    const styles = this.computedWaveformStyles;

    return html`<div class="row">
      <div class="dFlex flexRow">
        <div class="w2 pr1">
          ${this.isPlaying
            ? html`<soundws-player-button
                @click=${this.pause}
                title="Pause"
                type="pause"
              ></soundws-player-button>`
            : html`<soundws-player-button
                @click=${this.play}
                title="Play"
                type="play"
              ></soundws-player-button>`}
        </div>
        ${this.displayMode !== 'xs'
          ? html`<div class="w9 truncate hideXs pr1 textCenter">
              <span>${this.label}</span>
            </div>`
          : ''}
        <div class="w2 textXs textMuted textCenter">
          <span>${formatSeconds(this.currentTime || 0)}</span>
        </div>
        ${this.displayMode === 'lg' && this.rowHeight
          ? html`<div class="flex1">
              <soundws-waveform
                .height=${this.rowHeight}
                .peaks=${this.peaks}
                .progress=${this.currentPct}
                .progressColor=${styles.waveProgressColor}
                .waveColor=${styles.waveColor}
                .barWidth=${styles.barWidth}
                .barGap=${styles.barGap}
                .pixelRatio=${styles.devicePixelRatio}
                @click=${e =>
                  this.handleSeek(
                    Math.round((e.offsetX / e.target.clientWidth) * 100) / 100,
                  )}
              ></soundws-waveform>
            </div>`
          : html`<soundws-range
              label="progress"
              class="focusBgAccent px1 flex1"
              .value=${this.currentPct * 100}
              @input=${this.handleSeeking}
              @change=${e => this.handleSeek(e.detail / 100)}
            ></soundws-range>`}
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

  /**
   * Calculates the styles for rendering the waveform
   */
  computeWaveformStyles() {
    const styles = computeWaveformStyles(this, defaults.waveform);

    return {
      ...styles,
      waveColor: this.waveColor || styles.controlsWaveColor || styles.waveColor,
      waveProgressColor:
        this.waveProgressColor ||
        styles.controlsProgressColor ||
        styles.progressColor,
    };
  }
}
