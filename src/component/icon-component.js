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
import defineCustomElement from '../lib/define-custom-element';
import iconLoading from '../styles/icon-loading';

export class IconComponent extends LitElement {
  static get styles() {
    return [
      css`
        .icon {
          width: 35px;
          height: 35px;
        }
      `,
      iconLoading,
    ];
  }

  render() {
    return html`<div class="icon ${this.getAttribute('icon')}"></div>`;
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-icon', IconComponent);
};
