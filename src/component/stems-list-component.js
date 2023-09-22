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
import debounce from 'lodash.debounce';
import { defineCustomElements as defineStemComponent, StemComponent } from './stem-component';
import defineCustomElement from '../lib/define-custom-element';
import Peaks from '../lib/peaks';

export class StemsListComponent extends LitElement {
  /**
   * Counter for how many stems are in a loading state
   * @private
   */
  nLoading = 0;

  constructor() {
    super();

    this.debouncedGeneratePeaks = debounce(() => this.generatePeaks(), 200);

    this.addEventListener('stem-loading-start', this.onStemLoadingStart);
    this.addEventListener('stem-loading-end', this.onStemLoadingEnd);
    this.addEventListener('peaks', this.onPeaks);
    this.addEventListener('solo', this.onSolo);
    this.addEventListener('unsolo', this.onUnSolo);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        max-height: var(--sws-stemsplayer-max-height);
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

  connectedCallback() {
    super.connectedCallback();
    this.style.setProperty('--sws-stemsplayer-max-height', `${this.getAttribute('maxHeight')}px`);

    // the total duration has changed... tell the stem controllers what it is so they can render correctly
    this.eDuration = this.controller?.on('duration', () => {
      this.stemComponents.forEach((stem) => {
        stem.renderedDuration = this.controller.duration;
      });
    });
  }

  disconnectedCallback() {
    // remove event listeners
    this.eDuration?.un();

    super.disconnectedCallback();
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
    this.stemComponents?.forEach((stem) => {
      if (!stem.controller) stem.controller = this.controller;
    });
  }

  get state() {
    return this.stemComponents.map((stemComponent) => ({
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
    const peaks = Peaks.combine(...this.stemComponents.map((node) => node.peaks));

    this.dispatchEvent(
      new CustomEvent('peaks', {
        detail: { peaks: peaks.values, target: this },
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
      ? slot.assignedElements({ flatten: true }).filter((e) => e instanceof StemComponent)
      : [];
  }

  /**
   * @private
   * @param {Event} e
   */
  onStemLoadingStart(e) {
    e.stopPropagation();

    if (this.nLoading === 0)
      this.dispatchEvent(new Event('loading-start', { bubbles: true, composed: true }));

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
      this.dispatchEvent(new Event('loading-end', { bubbles: true, composed: true }));
  }

  /**
   * Listen to peaks events emitting from the stems
   * @private
   * @param {Event} e
   */
  onPeaks(e) {
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

    this.stemComponents?.forEach((stemComponent) => {
      if (e.detail === stemComponent) {
        stemComponent.solo = 1;
      } else {
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

    this.stemComponents?.forEach((stemComponent) => {
      stemComponent.solo = undefined;
    });
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-stems-list', StemsListComponent);
  defineStemComponent();
};
