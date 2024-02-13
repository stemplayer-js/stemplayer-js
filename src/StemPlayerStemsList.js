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
import debounce from './lib/debounce.js';
import { SoundwsStemPlayerStem as StemComponent } from './StemPlayerStem.js';
import combinePeaks from './lib/combine-peaks.js';

export class StemsListComponent extends LitElement {
  /**
   * Counter for how many stems are in a loading state
   * @private
   */
  nLoading = 0;

  constructor() {
    super();

    this.debouncedGeneratePeaks = debounce(
      () => this.generatePeaks(),
      200,
      true,
    );

    this.addEventListener('stem-loading-start', this.onStemLoadingStart);
    this.addEventListener('stem-loading-end', this.onStemLoadingEnd);
    this.addEventListener('waveform-draw', this.onWaveformDraw);
    this.addEventListener('solo', this.onSolo);
    this.addEventListener('unsolo', this.onUnSolo);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        max-height: var(--stemplayer-js-max-height, auto);
        overflow: auto;
      }
    `;
  }

  static get properties() {
    return {
      stems: { type: Array, hasChanged: () => true },
      waveOptions: { type: Object },
      controller: { type: Object },
    };
  }

  render() {
    return html`<div><slot @slotchange=${this._onSlotChange}></slot></div>`;
  }

  // https://stackoverflow.com/questions/55172223/lit-element-how-to-efficiently-share-a-property-from-parent-to-child-custom-ele
  _onSlotChange() {
    this.requestUpdate();
  }

  updated() {
    // The controller is shared between stems, so when adding a stem component to the list, we need to inject the controller
    this.stemComponents?.forEach(stem => {
      // eslint-disable-next-line no-param-reassign
      if (!stem.controller) stem.controller = this.controller;
    });
  }

  get state() {
    return this.stemComponents.map(stemComponent => ({
      id: stemComponent.id,
      src: stemComponent.src,
      waveform: stemComponent.waveform,
      volume: stemComponent.volume,
      muted: stemComponent.muted,
      solo: stemComponent.solo,
    }));
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
   * Get the stem componenents
   *
   * @returns {Array}
   */
  get stemComponents() {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot
      ? slot
          .assignedElements({ flatten: true })
          .filter(e => e instanceof StemComponent)
      : [];
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
}
