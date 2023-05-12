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
import flexStyles from '../styles/flex';
import typographyStyles from '../styles/typography';
import backgroundStyles from '../styles/backgrounds';
import utilitiesStyles from '../styles/utilities';
import defineCustomElement from '../lib/define-custom-element';

export class ResponsiveVolumeComponent extends LitElement {
  static get styles() {
    return [
      flexStyles,
      typographyStyles,
      backgroundStyles,
      utilitiesStyles,
      css`
        :host {
          flex: 1;
          text-align: center;
        }
        .handle {
          position: absolute;
          height: 100%;
          border-right: 3px solid var(--sws-stemsplayer-accent-color, rgb(1, 164, 179));
          transition: width 0.2s ease-in-out;
          box-sizing: border-box;
          width: var(--handle-width);
        }
        .noPointerEvents {
          pointer-events: none;
        }

        .animate-enter .handle {
          width: 0!imporant;
        }
      `,
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', 0);
    this.setAttribute('role', 'slider');
    this.setAttribute('aria-valuetext', 'Volume');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-valuemin', '0');
  }

  firstUpdated() {
    this.style.setProperty('--handle-width', '0%');

    setTimeout(() => {
      this.style.setProperty('--handle-width', `${this.volume}%`);
    }, 500);
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      // if oldValue is undefined, that means we're doing the first initialisation
      // in which case it is handled by firstUpdated (so that we can do some animation)
      if (propName === 'volume' && oldValue !== undefined)
        this.style.setProperty('--handle-width', `${this.volume}%`);
    });
  }

  static get properties() {
    return {
      label: { type: String },
      volume: { type: Number },
    };
  }

  render() {
    return html`<div class="w100 relative hoverBgAccent focusBgAccent" @click=${this.handleClick}>
      <div class="handle bgOp3 noPointerEvents"></div>
      <span class="truncate noPointerEvents">${this.label}</span>
    </div>`;
  }

  handleClick(e) {
    const perc = Math.floor((e.offsetX / e.target.offsetWidth) * 100);
    this.dispatchEvent(new CustomEvent('change', { detail: perc }));
  }
}

export const defineCustomElements = () => {
  defineCustomElement('soundws-responsive-volume', ResponsiveVolumeComponent);
};
