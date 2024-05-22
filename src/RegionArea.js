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
import { css, html } from 'lit';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import backgroundStyles from './styles/backgrounds.js';
import utilitiesStyles from './styles/utilities.js';
import formatSeconds from './lib/format-seconds.js';

/**
 * An area that represents the timeline providing functionality to select regions
 */
export class RegionArea extends ResponsiveLitElement {
  /**
   * A mouse event offsetX coordinate
   */
  #mouseDownX;

  /**
   * A Date representing when the mouse was clicked
   */
  #mouseDownTime;

  /**
   * How far the mouse was moved
   */
  #mouseMoveWidth;

  /**
   * Event handler
   */
  #onMouseUpHandler;

  static get styles() {
    return [
      gridStyles,
      rowStyles,
      typographyStyles,
      backgroundStyles,
      spacingStyles,
      utilitiesStyles,
      css`
        :host {
          display: block;
        }

        .mask {
          box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.85);
        }

        .dashed {
          border-width: 0 1px 0 1px;
          border-style: dashed;
          border-color: var(
            --stemplayer-js-region-selection-border-color,
            rgba(255, 255, 255, 0.75)
          );
        }

        :hover .cursor {
          opacity: 1;
        }

        .cursor {
          position: absolute;
          background-color: transparent;
          height: 100%;
          top: 0;
          width: 1px;
          padding: 0;
          margin: 0;
          border-width: 0 1px 0 0px;
          border-style: dashed;
          opacity: 0;
        }

        .ztop {
          z-index: 100;
        }
      `,
    ];
  }

  static properties = {
    totalDuration: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
    pixelsPerSecond: { state: true },
    cursorPosition: { state: true },
  };

  constructor() {
    super();
    this.addEventListener('mousedown', this.#onMouseDown);
    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('resize', () => {
      this.pixelsPerSecond = this.offsetWidth / this.totalDuration;
    });
    this.addEventListener('pointermove', this.#onHover);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#onMouseUpHandler = e => this.#onMouseUp(e);
    document.addEventListener('mouseup', this.#onMouseUpHandler); // mouse up _anywhere_ (not just in this element) will also trigger the select-end behaviour
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mouseup', this.#onMouseUpHandler);
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'totalDuration') {
        this.pixelsPerSecond = this.offsetWidth / this.totalDuration;
      }
    });
  }

  render() {
    return html`<div class="w100 h100">
      ${this.offset > 0 && this.duration < this.totalDuration
        ? html`<div
            class="h100 absolute left w2 ztop"
            style="left: calc(${this.pixelsPerSecond * this.offset}px - 50px);"
          >
            <div class="w2 hRow textCenter textXs">
              ${formatSeconds(this.offset)}
            </div>
          </div>
          <div class="h100 overflowHidden">
            <div
              class="mask dashed h100 relative"
              style="left: ${Math.round(
                this.pixelsPerSecond * this.offset,
              )}px; width: ${Math.round(
                this.pixelsPerSecond * this.duration,
              )}px;"
            ></div>
          </div>
          <div
            class="h100 absolute right w2 ztop"
            style="left: ${
              this.pixelsPerSecond * (this.offset + this.duration)
            }px; top: 0;"
          >
            <div class="w2 hRow textCenter textXs">
              ${formatSeconds(this.offset + this.duration)}
            </div>
            <soundws-player-button
              @click=${this.#onDeselectClick}
              class="hRow w2"
              type="deselect"
            ></soundws-player-button>
          </div></div>`
        : ''}
      <div class="cursor dashed w2 zTop p1">
        <div class="w2 hRow textCenter textXs">
          <span class="bgPlayer p1 muted"
            >${formatSeconds(this.cursorPosition)}</span
          >
        </div>
      </div>
    </div>`;
  }

  #onMouseDown(e) {
    this.#mouseDownX = e.offsetX;

    if (e.offsetX < 0) {
      this.#mouseDownX = 0;
    }

    if (e.offsetX > this.offsetWidth) {
      this.#mouseDownX = this.offsetWidth;
    }

    this.#mouseDownTime = new Date();
  }

  #onMouseMove(e) {
    if (
      this.#mouseDownX !== undefined &&
      e.offsetX > 0 &&
      e.offsetX < this.offsetWidth
    ) {
      this.lastOffsetX = e.offsetX;
      const distance = Math.abs(e.offsetX - this.#mouseDownX);
      this.#mouseMoveWidth = distance; // distance > 5 ? distance : undefined;

      if (this.#mouseMoveWidth) {
        this.dispatchEvent(
          new CustomEvent('region:update', {
            detail: this.state,
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  #onMouseUp() {
    // if we're dragging, dispatch and event
    if (this.#mouseMoveWidth) {
      this.dispatchEvent(
        new CustomEvent('region:change', {
          detail: this.state,
          bubbles: true,
          composed: true,
        }),
      );
    }

    // reset
    this.#mouseMoveWidth = undefined;
    this.#mouseDownX = undefined;
    this.#mouseDownTime = undefined;
  }

  #onDeselectClick(e) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent('region:change', {
        detail: { offset: undefined, duration: undefined },
      }),
    );
  }

  #handleClick(e) {
    const clickTime = new Date() - this.#mouseDownTime;
    if (clickTime < 150) {
      this.dispatchEvent(
        new CustomEvent('region:seek', {
          bubbles: true,
          composed: true,
          detail: Math.round((e.offsetX / this.clientWidth) * 100) / 100,
        }),
      );
    }
  }

  /**
   * Gets the current selection state
   *
   * @returns {{left: Number, width: Number, offset: Number, duration: Number }}
   */
  get state() {
    const { pixelsPerSecond } = this;
    const coord1 = this.#mouseDownX;
    const coord2 = this.lastOffsetX;
    const left = coord1 < coord2 ? coord1 : coord2;
    const width = this.#mouseMoveWidth;
    const offset = Math.floor((left / pixelsPerSecond) * 100) / 100;
    const duration = Math.floor((width / pixelsPerSecond) * 100) / 100;

    return { offset, duration };
  }

  /**
   *@private
   */
  #onHover(e) {
    const el = this.shadowRoot.querySelector('.cursor');
    el.style.left =
      e.offsetX <= this.offsetWidth ? `${e.offsetX}px` : this.offsetWidth;

    this.cursorPosition =
      Math.round((e.offsetX / this.offsetWidth) * this.totalDuration * 10) / 10;

    this.dispatchEvent(
      new CustomEvent('region:hover', {
        detail: this.state,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
