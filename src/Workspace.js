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

        .handle {
          cursor: ew-resize;
          position: absolute;
          height: 100%;
          top: 0;
          width: 10px;
        }

        fc-player-button[type='deselect'] {
          display: var(--stemplayer-js-region-btn-deselect-display, block);
        }

        .pointerMove {
          cursor: grab;
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
    lockRegions: { type: Boolean },
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

      // hide the deselect button if we are in a locked state
      if (this.lockRegions) {
        this.style.setProperty(
          '--stemplayer-js-region-btn-deselect-display',
          'none',
        );
      }
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
        this.style.setProperty(
          '--offset',
          Math.floor(this.offset * 1000) / 1000,
        );
      }
      if (propName === 'duration') {
        this.style.setProperty(
          '--duration',
          Math.floor(this.duration * 1000) / 1000,
        );
      }
    });
  }

  render() {
    return html`<div>
      <div class="z99 noPointerEvents h100 absolute"></div>
      ${this.regions && this.offset > 0 && this.duration > 0
        ? html` <div
            class="absolute h100 z999 mask dashed regionArea"
            @mousedown=${this.#onRegionMouseDown}
          >
            <div
              class="h100 absolute left w2 z99 left-2 ${this.lockRegions
                ? 'noPointerEvents'
                : ''}"
            >
              <div class="w2 hRow textCenter textXs">
                ${formatSeconds(this.offset)}
              </div>
              <div class="handle right"></div>
            </div>
            <div class="h100 overflowHidden pointerMove"></div>

            <div
              class="h100 absolute right w2 z99 top right-2 ${this.lockRegions
                ? 'noPointerEvents'
                : ''}"
            >
              <div class="handle left"></div>
              <div class="w2 hRow textCenter textXs">
                ${formatSeconds(this.offset + this.duration)}
              </div>
              <fc-player-button
                @click=${this.#onDeselectClick}
                @mousedown=${e => e.stopPropagation()}
                class="hRow w2"
                type="deselect"
              ></fc-player-button>
            </div>
          </div>`
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
    if (this.lockRegions) return;
    const { offsetX, offsetWidth } = this.resolveOffsets(e);

    if (this.isDraggingRegion) {
      this.#mouseDownX = offsetX;
    }

    if (!this.isDraggingHandle) {
      this.#mouseDownX = offsetX;

      if (offsetX < 0) {
        this.#mouseDownX = 0;
      }

      if (offsetX > offsetWidth) {
        this.#mouseDownX = offsetWidth;
      }
    }

    this.#mouseDownTime = new Date();
  }

  #onMouseMove(e) {
    if (!this.regions) return;
    if (this.lockRegions) return;

    const { offsetX, offsetWidth } = this.resolveOffsets(e);

    if (
      this.#mouseDownX !== undefined &&
      offsetX > 0 &&
      offsetX < offsetWidth
    ) {
      // store pre-change values for rollback
      const oldMouseMoveWidth = this.#mouseMoveWidth;
      const oldOffsetX = this.lastOffsetX;

      // is dragging a region
      if (this.isDraggingRegion) {
        const distance = offsetX - this.#mouseDownX;
        let newOffset = this.offset + distance / this.#pixelsPerSecond;

        if (newOffset <= 0) {
          newOffset = 0.0001; // nearly 0, due to a check offset > 0 above in render
        }

        if (newOffset + this.duration > this.totalDuration) {
          // prevent dragging past the end
          newOffset = this.totalDuration - this.duration;
        }

        this.offset = newOffset;
        this.#mouseDownX = offsetX;
      }
      // is dragging a handle or creating new region
      else {
        this.lastOffsetX = offsetX;
        this.#mouseMoveWidth = Math.abs(offsetX - this.#mouseDownX);
      }

      // emit pre-update event
      const preUpdateEvent = new CustomEvent('region:pre-update', {
        detail: this.dragState,
        bubbles: true,
        composed: true,
        cancelable: true,
      });

      this.dispatchEvent(preUpdateEvent);

      // if pre-update event default is prevented, revert to previous state
      if (preUpdateEvent.defaultPrevented) {
        this.#mouseMoveWidth = oldMouseMoveWidth;
        this.lastOffsetX = oldOffsetX;
      }

      if (this.#mouseMoveWidth) {
        this.dispatchEvent(
          new CustomEvent('region:update', {
            detail: this.dragState,
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  #onMouseOut() {
    if (this.lockRegions) return;
    this.shadowRoot.querySelector('.cursor').style.left = `-10000px`;
  }

  #onMouseUp() {
    // Only handle regular region selection if we weren't dragging handles
    // If we're finishing a normal region selection drag, dispatch an event.
    if (this.#mouseMoveWidth) {
      this.dispatchEvent(
        new CustomEvent('region:change', {
          detail: this.dragState,
          bubbles: true,
          composed: true,
        }),
      );
    }

    // If we were dragging a handle, dispatch an event with the new offset and duration, which were set explicitly
    // in the mousemove handler. This is to allow the parent to update the region state.
    if (this.isDraggingRegion) {
      this.dispatchEvent(
        new CustomEvent('region:change', {
          detail: {
            offset: this.offset,
            duration: this.duration,
            region: this,
          },
          bubbles: true,
          composed: true,
        }),
      );
    }

    // reset
    this.#mouseMoveWidth = undefined;
    this.#mouseDownX = undefined;
    this.isDraggingHandle = undefined;
    this.isDraggingRegion = undefined;
    // NOTE: mouseDownTime is unset as part of the click handler as we need it there and click is fired after mousedown/up
  }

  #onDeselectClick(e) {
    e.stopPropagation();
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('region:change', {
        detail: { offset: undefined, duration: undefined },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleClick(e) {
    if (this.lockRegions) return;

    const { offsetX, offsetXRelativeToParent, offsetWidth } =
      this.resolveOffsets(e);

    if (offsetXRelativeToParent < 0) return;

    const clickTime = new Date() - this.#mouseDownTime;

    if (clickTime < 150) {
      this.dispatchEvent(
        new CustomEvent('region:seek', {
          bubbles: true,
          composed: true,
          detail: offsetX / offsetWidth,
        }),
      );
    }

    this.#mouseDownTime = undefined;
  }

  /**
   * Gets the current selection state.
   *
   * When a handle is being dragged, we return the public properties
   * (which are updated by the handle-drag code). Otherwise, we compute
   * the state from the normal region drag selection.
   *
   * @returns {{offset: Number, duration: Number}}
   */
  get dragState() {
    const pixelsPerSecond = this.#pixelsPerSecond;
    const coord1 = this.#mouseDownX || 0;
    const coord2 = this.lastOffsetX || 0;
    const left = Math.min(coord1, coord2);
    const width = this.#mouseMoveWidth || 0;

    return {
      offset: Math.round((left / pixelsPerSecond) * 100) / 100,
      duration: Math.round((width / pixelsPerSecond) * 100) / 100,
      direction: coord1 > coord2 ? 'left' : 'right', // left = dragging from right to left and vice versa
      region: this,
    };
  }

  /**
   *@private
   */
  // eslint-disable-next-line consistent-return
  #onHover(e) {
    if (this.lockRegions) return;

    const { offsetX, offsetWidth } = this.resolveOffsets(e);
    const el = this.shadowRoot.querySelector('.cursor');

    if (offsetX < 0 || offsetX > offsetWidth) {
      el.style.left = `-10000px`;
      return;
    }

    el.style.left = `${Math.floor(offsetX)}px`;

    this.cursorPosition =
      Math.floor((offsetX / offsetWidth) * this.totalDuration * 1000) / 1000;

    this.dispatchEvent(
      new CustomEvent('region:hover', {
        detail: this.dragState,
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

  #onRegionMouseDown(e) {
    this.isDraggingHandle = e.target.classList.contains('handle');
    this.isDraggingRegion = e.target.classList.contains('pointerMove');

    // if we are dragging a handle, we need to set the mouseDownX to the current offset
    // so that we can calculate the new offset when the mouse moves
    if (this.isDraggingHandle) {
      const isRightHandle = e.target.classList.contains('left');

      const pps = this.#pixelsPerSecond;
      const left = Math.round(pps * this.offset * 1000) / 1000;
      const width = Math.round(pps * this.duration * 1000) / 1000;
      const right2 = left + width;

      if (isRightHandle) {
        this.#mouseDownX = left;
      } else {
        this.#mouseDownX = right2;
      }
    }
  }
}
