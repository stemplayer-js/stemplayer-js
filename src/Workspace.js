import { css, html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import gridStyles from './styles/grid.js';
import backgroundStyles from './styles/backgrounds.js';
import utilitiesStyles from './styles/utilities.js';
import formatSeconds from './lib/format-seconds.js';

/**
 * An area that represents the timeline providing functionality to select regions
 */
export class Workspace extends ResponsiveLitElement {
  #horizonEl = createRef();

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

  #wheelEventHandler;

  static get styles() {
    return [
      gridStyles,
      typographyStyles,
      backgroundStyles,
      spacingStyles,
      utilitiesStyles,
      css`
        :host {
          display: block;
          width: var(--stemplayer-js-workspace-width, fit-content);
          min-width: 100%;
          position: relative;
        }

        .mask {
          box-shadow: 0 0 0 50000px rgba(0, 0, 0, 0.75);
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
          margin-left: var(--stemplayer-js-row-controls-width);
        }

        .progress {
          left: var(--stemplayer-js-row-controls-width);
          right: var(--stemplayer-js-row-end-width);
          background-color: var(
            --stemplayer-js-progress-background-color,
            rgba(255, 255, 255, 1)
          );
          mix-blend-mode: var(--stemplayer-js-progress-mix-blend-mode, overlay);
          width: calc(
            (1px * var(--stemplayer-progress, 0)) *
              var(--fc-waveform-pixels-per-second)
          );
        }

        .regionArea {
          margin-left: var(--stemplayer-js-row-controls-width);
          margin-right: var(--stemplayer-js-row-end-width);
          left: calc(
            var(--fc-waveform-pixels-per-second) * var(--offset) * 1px
          );
          width: calc(
            var(--fc-waveform-pixels-per-second) * var(--duration) * 1px
          );
        }

        .rRowEnd {
          right: var(--stemplayer-js-row-end-width);
        }

        .lRowControls {
          left: var(--stemplayer-js-row-controls-width);
        }
      `,
    ];
  }

  static properties = {
    totalDuration: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
    regions: { type: Boolean },
    cursorPosition: { state: true },
  };

  constructor() {
    super();

    setTimeout(() => {
      this.addEventListener('mousedown', e => this.#onMouseDown(e));
      this.addEventListener('mousemove', e => this.#onMouseMove(e));
      this.addEventListener('click', e => this.#handleClick(e));
      this.addEventListener('pointermove', e => this.#onHover(e));
      this.addEventListener('mouseout', e => this.#onMouseOut(e));
      this.#wheelEventHandler = e => this.#onHover(e);
      this.addEventListener('wheel', this.#wheelEventHandler);
    }, 0);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#onMouseUpHandler = e => this.#onMouseUp(e);
    document.addEventListener('mouseup', this.#onMouseUpHandler); // mouse up _anywhere_ (not just in this element) will also trigger the select-end behaviour
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mouseup', this.#onMouseUpHandler);
    this.removeEventListener('wheel', this.#wheelEventHandler);
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'offset') {
        this.style.setProperty('--offset', this.offset);
      }
      if (propName === 'duration') {
        this.style.setProperty('--duration', this.duration);
      }
    });
  }

  render() {
    return html`<div>
      <div class="z99 progress noPointerEvents h100 absolute"></div>
      ${this.regions && this.offset > 0 && this.duration > 0
        ? html`
        <div class="absolute h100 z999 mask dashed regionArea">
          <div
            class="h100 absolute left w2 z99 left-2"
          >
            <div class="w2 hRow textCenter textXs">
              ${formatSeconds(this.offset)}
            </div>
          </div>
          <div class="h100 overflowHidden">
          </div>
          <div
            class="h100 absolute right w2 z99 top right-2"

          >
            <div class="w2 hRow textCenter textXs">
              ${formatSeconds(this.offset + this.duration)}
            </div>
            <fc-player-button
              @click=${this.#onDeselectClick}
              class="hRow w2"
              type="deselect"
            ></fc-player-button>
          </div></div></div>`
        : ''}
      <div
        class="cursor dashed w2 z999 noPointerEvents"
        style="${!this.cursorPosition ? 'visibility:hidden' : ''}"
      >
        <div class="w2 hRow textCenter textXs">
          <span class="bgPlayer p1 muted"
            >${formatSeconds(this.cursorPosition)}</span
          >
        </div>
      </div>
      <slot></slot>
      <div class="lRowControls rRowEnd absolute" ${ref(this.#horizonEl)}></div>
    </div>`;
  }

  #onMouseDown(e) {
    const { offsetX, offsetWidth } = this.resolveOffsets(e);

    this.#mouseDownX = offsetX;

    if (offsetX < 0) {
      this.#mouseDownX = 0;
    }

    if (offsetX > offsetWidth) {
      this.#mouseDownX = offsetWidth;
    }

    this.#mouseDownTime = new Date();
  }

  #onMouseMove(e) {
    if (!this.regions) return;

    const { offsetX, offsetWidth } = this.resolveOffsets(e);

    if (
      this.#mouseDownX !== undefined &&
      offsetX > 0 &&
      offsetX < offsetWidth
    ) {
      this.lastOffsetX = offsetX;

      const distance = Math.abs(offsetX - this.#mouseDownX);
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

  #onMouseOut() {
    this.shadowRoot.querySelector('.cursor').style.left = `-10000px`;
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

    // NOTE: mouseDownTime is unset as part of the click handler as we need it there and click is fired after mousedown/up
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
    const { offsetX, offsetXRelativeToParent, offsetWidth } =
      this.resolveOffsets(e);

    if (offsetXRelativeToParent < 0) return;

    const clickTime = new Date() - this.#mouseDownTime;

    if (clickTime < 150) {
      this.dispatchEvent(
        new CustomEvent('region:seek', {
          bubbles: true,
          composed: true,
          detail: Math.round((offsetX / offsetWidth) * 100) / 100,
        }),
      );
    }

    this.#mouseDownTime = undefined;
  }

  /**
   * Gets the current selection state
   *
   * @returns {{left: Number, width: Number, offset: Number, duration: Number }}
   */
  get state() {
    const pixelsPerSecond = this.#pixelsPerSecond;
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
  // eslint-disable-next-line consistent-return
  #onHover(e) {
    const { offsetX, offsetWidth } = this.resolveOffsets(e);
    const el = this.shadowRoot.querySelector('.cursor');

    if (offsetX < 0 || offsetX > offsetWidth) {
      el.style.left = `-10000px`;
      return undefined;
    }

    el.style.left = `${offsetX}px`;

    this.cursorPosition =
      Math.round((offsetX / offsetWidth) * this.totalDuration * 10) / 10;

    this.dispatchEvent(
      new CustomEvent('region:hover', {
        detail: this.state,
        bubbles: true,
        composed: true,
      }),
    );
  }

  resolveOffsets(e) {
    return {
      offsetX: e.offsetX - this.horizon.left,
      offsetWidth: this.offsetWidth - this.horizon.left - this.horizon.right,
      offsetXRelativeToParent:
        e.offsetX - this.horizon.left - this.parentNode.scrollLeft,
    };
  }

  /**
   * How many pixels are used to represent a second in the container that overlays the area where waveforms are drawn
   */
  get #pixelsPerSecond() {
    return (
      (this.clientWidth - this.horizon.left - this.horizon.right) /
      this.totalDuration
    );
  }

  /**
   * The horizon represents the limit in which mouse events matter. It coincides with the area where the waveforms are rendered
   * We do not simply render an absolutely positioned overlay and listen to events on that element, since this would disrupt the normal
   * event paths, and would prevent us from e.g. listening to click events on a inner element such as a stem.
   */
  get horizon() {
    const el = this.#horizonEl.value;

    return {
      left: el.offsetLeft,
      right: this.offsetWidth - el.offsetLeft - el.offsetWidth,
    };
  }
}
