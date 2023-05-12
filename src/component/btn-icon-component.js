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
import { iconPlay, iconPause, iconMute, iconUnmute, iconSolo, iconUnsolo } from '../images/icons';
import defineCustomElement from '../lib/define-custom-element';

export class BtnIconComponent extends LitElement {
  _icons = {
    play: iconPlay,
    pause: iconPause,
    mute: iconMute,
    unmute: iconUnmute,
    solo: iconSolo,
    unsolo: iconUnsolo,
  };

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }

        button {
          background-color: transparent;
          background-position: center;
          background-repeat: no-repeat;
          background-size: auto;
          border: none;
          height: var(--sws-stemsplayer-row-height, 60px);
          opacity: 0.8;
          overflow: hidden;
          padding: 0;
          position: relative;
          transition: opacity 0.2s ease-in;
          white-space: nowrap;
          width: 100%;
          display: block;
          color: var(--sws-stemsplayer-color);
        }

        button:focus {
          background-color: var(--sws-stemsplayer-accent-color, rgb(1, 164, 179));
          outline: none;
        }

        button:hover {
          opacity: 1;
        }

        button svg {
          fill: var(--sws-stemsplayer-color, rgb(220, 220, 220));
        }
      `,
    ];
  }

  render() {
    const iconName = this.getAttribute('icon');

    return html`<button type="button">${this._icons[iconName]}</button>`;
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-btn-icon', BtnIconComponent);
};
