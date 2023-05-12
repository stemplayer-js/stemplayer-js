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
import { LitElement, html } from 'lit';
import debounce from 'lodash.debounce';
import defineCustomElement from '../lib/define-custom-element';
import backgroundStyles from '../styles/backgrounds';
import rangeInputStyles from '../styles/range-input';

export class SeekComponent extends LitElement {
  static get styles() {
    return [backgroundStyles, rangeInputStyles];
  }

  static get properties() {
    return {
      value: { type: Number },
    };
  }

  constructor() {
    super();
    this.debouncedSeek = debounce((e) => this.seek(e), 500);
    // this.debouncedInput = debounce((e) => this.handleInput(e), 500, true);
  }

  render() {
    return html`<input
      class="focusBgAccent"
      type="range"
      min="0"
      max="100"
      .value=${this.value || 0}
      step="1"
      @change=${this.debouncedSeek}
      @input=${this.handleInput}
    />`;
  }

  handleInput() {
    this.dispatchEvent(new CustomEvent('seeking', { bubbles: true }));
  }

  seek() {
    this.dispatchEvent(new CustomEvent('seek', { bubbles: true, detail: this.eInput.value }));
  }

  get eInput() {
    return this.shadowRoot?.querySelector('input');
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-seek', SeekComponent);
};
