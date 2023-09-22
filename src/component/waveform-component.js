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
import DrawerFactory from '../factory/drawer-factory';
import onResize from '../lib/on-resize';
import config from '../config';
import defineCustomElement from '../lib/define-custom-element';
import Peaks from '../lib/peaks';

const PADDING = 6;

export class WaveformComponent extends LitElement {
  static get styles() {
    return css`
      .container {
        padding-top: ${PADDING / 2}px;
        padding-bottom: ${PADDING / 2}px;
      }
    `;
  }

  static get properties() {
    return {
      src: { type: String },
      peaks: { type: Array },
      scaleY: { type: Number },
      pct: { type: Number },
      hidden: { type: Boolean },
      barGap: { type: Number },
      barWidth: { type: Number },
      audioDuration: { type: Number },
      renderedDuration: { type: Number },
      options: { type: Object },
    };
  }

  constructor() {
    super();

    this._peaks = new Peaks();
  }

  render() {
    return html`<div class="container"></div>`;
  }

  connectedCallback() {
    super.connectedCallback();

    // we can hide the component if we only want to use its functionality to emit modified peaks
    if (this.hidden) this.style.setProperty('display', 'none');

    // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer. This has the possibility of being unreliable.
    const computedStyle = getComputedStyle(this);
    this.barGap = computedStyle.getPropertyValue('--sws-stemsplayer-wave-bar-gap') || undefined;
    this.barWidth = computedStyle.getPropertyValue('--sws-stemsplayer-wave-bar-width') || undefined;

    setTimeout(() => {
      const container = this.shadowRoot.firstElementChild;

      // respond to resize events
      if (!this.onResizeCallback)
        this.onResizeCallback = onResize(container, () => {
          this.drawPeaks();
        });
    }, 0);

    this.ePeaksUpdate = this._peaks.on('update', () => this.drawPeaks());
  }

  disconnectedCallback() {
    // destroy and remove references
    this.drawer?.destroy();
    this.drawer = null;

    // unregister events
    this.onResizeCallback?.un();
    this.onResizeCallback = null;
    this.ePeaksUpdate?.un();

    super.disconnectedCallback();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'src') this.loadPeaks();
      else if (propName === 'peaks') this.drawPeaks();
      else if (propName === 'pct') this.progress();
      else if (propName === 'scaleY') this._peaks.scaleY = this.scaleY;
      else if (propName === 'audioDuration') this._peaks.dataDuration = this.audioDuration;
      else if (propName === 'renderedDuration')
        this._peaks.renderedDuration = this.renderedDuration;
    });
  }

  /**
   * Loads the waveform from src
   * @private
   * @returns {Promise}
   */
  loadPeaks() {
    return fetch(this.src, config.fetchOptions)
      .then((r) => {
        if (!r.ok) {
          const error = new Error('Waveform Fetch failed');
          error.name = 'WaveformFetchError';
          error.response = r;
          throw error;
        }
        return r;
      })
      .then((res) => res.json())
      .then((res) => {
        this.peaks = Array.isArray(res) ? res : res.data;

        this.dispatchEvent(
          new CustomEvent('waveform-load', {
            detail: this.peaks.values,
            bubbles: true,
            composed: true,
          }),
        );
      })
      .catch((error) => {
        // dispatch error event on element (doesnt bubble)
        this.dispatchEvent(new ErrorEvent('error', { error }));

        // dispatch bubbling event so that the player-component can respond to it
        this.dispatchEvent(
          new CustomEvent('waveform-loading-error', {
            detail: error,
            bubbles: true,
            composed: true,
          }),
        );
      });
  }

  /**
   * Creates the waveform drawer
   * @private
   */
  createDrawer() {
    const container = this.shadowRoot.firstElementChild;

    this.drawer = DrawerFactory.create({
      container,
      params: {
        barGap: this.barGap,
        barWidth: this.barWidth,
        ...this.options,
        height: this.options.height - PADDING,
      },
    });

    this.drawer.on('click', (e, pct) =>
      this.dispatchEvent(new CustomEvent('seek', { detail: { pct } })),
    );

    this.drawer.init();

    this.progress();
  }

  /**
   * (re)-draw the waveform
   */
  drawPeaks() {
    // dont draw if we're hiding the waveform
    if (!this.hidden) {
      // create a drawer if we dont already have one
      if (!this.drawer) this.createDrawer();

      requestAnimationFrame(() => {
        this.drawer?.drawPeaks(this._peaks.values);
      });
    }

    this.dispatchEvent(new CustomEvent('draw', { detail: { peaks: this.peaks.values } }));
  }

  /**
   * Move the progress
   */
  progress() {
    // dont draw if we're hiding the waveform
    if (!this.hidden) {
      requestAnimationFrame(() => {
        // hack to ensure that when calling progress immediately after initialisation, it seeks properly.
        setTimeout(() => {
          this.drawer?.progress(this.pct || 0);
        }, 0);
      });
    }
  }

  set peaks(peaks) {
    this._peaks.data = peaks;
  }

  get peaks() {
    return this._peaks?.values;
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-waveform', WaveformComponent);
};
