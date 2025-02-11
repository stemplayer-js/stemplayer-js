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

  /**
   * Edge handles
   */
  #isDraggingLeftHandle = false;

  #isDraggingRightHandle = false;

  #handleDragStartX;

  #initialOffset;

  #initialDuration;

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

        .handle {
          cursor: ew-resize;
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
        ? html` <div class="absolute h100 z999 mask dashed regionArea">
            <div
              class="h100 absolute left w2 z99 left-2 ${this.lockRegions
                ? 'noPointerEvents'
                : 'handle'}"
              @mousedown=${this.#onLeftHandleMouseDown}
            >
              <div class="w2 hRow textCenter textXs">
                ${formatSeconds(this.offset)}
              </div>
            </div>
            <div class="h100 overflowHidden"></div>

            <div
              class="h100 absolute right w2 z99 top right-2 ${this.lockRegions
                ? 'noPointerEvents'
                : 'handle'}"
              @mousedown=${this.#onRightHandleMouseDown}
            >
              <div class="w2 hRow textCenter textXs">
                ${formatSeconds(this.offset + this.duration)}
              </div>
              <fc-player-button
                @click=${this.#onDeselectClick}
                @mousedown=${e => e.stopPropagation()}
                class="hRow w2"
                type="deselect"
                style="${this.lockRegions ? 'display:none' : ''}"
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
    if (this.lockRegions) return;

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
    if (this.lockRegions) return;
    this.shadowRoot.querySelector('.cursor').style.left = `-10000px`;
  }

  #onMouseUp() {
    // Only handle regular region selection if we weren't dragging handles
    if (!this.#isDraggingLeftHandle && !this.#isDraggingRightHandle) {
      // If we're finishing a normal region selection drag, dispatch an event.
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
          detail: Math.round((offsetX / offsetWidth) * 100) / 100,
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
  get state() {
    if (this.#isDraggingLeftHandle || this.#isDraggingRightHandle) {
      return { offset: this.offset, duration: this.duration };
    }
    const pixelsPerSecond = this.#pixelsPerSecond;
    const coord1 = this.#mouseDownX || 0;
    const coord2 = this.lastOffsetX || 0;
    const left = Math.min(coord1, coord2);
    const width = this.#mouseMoveWidth || 0;
    return {
      offset: Math.floor((left / pixelsPerSecond) * 100) / 100,
      duration: Math.floor((width / pixelsPerSecond) * 100) / 100,
    };
  }

  /**
   *@private
   */
  // eslint-disable-next-line consistent-return
  #onHover(e) {
    if (this.lockRegions) return undefined;
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

  /* ================================
     Handle Dragging for Region Edges
     ================================ */

  // Left Handle
  #onLeftHandleMouseDown(e) {
    if (this.lockRegions) return;
    e.stopPropagation();
    e.preventDefault();
    this.#isDraggingLeftHandle = true;
    this.#handleDragStartX = e.clientX;
    // Save current region boundaries.
    this.#initialOffset = this.offset;
    this.#initialDuration = this.duration;
    document.addEventListener('mousemove', this.#onLeftHandleMouseMove);
    document.addEventListener('mouseup', this.#onLeftHandleMouseUp);
  }

  #onLeftHandleMouseMove = e => {
    if (this.lockRegions) return;
    if (!this.#isDraggingLeftHandle) return;
    const deltaX = e.clientX - this.#handleDragStartX;
    const secondsDelta = deltaX / this.#pixelsPerSecond;
    let newOffset = this.#initialOffset + secondsDelta;
    // Clamp: newOffset cannot exceed the current right edge.
    const rightEdge = this.#initialOffset + this.#initialDuration;
    if (newOffset > rightEdge) {
      newOffset = rightEdge;
    }
    if (newOffset < 0) {
      newOffset = 0;
    }
    const newDuration = rightEdge - newOffset;
    this.offset = newOffset;
    this.duration = newDuration;
    this.dispatchEvent(
      new CustomEvent('region:update', {
        detail: this.state,
        bubbles: true,
        composed: true,
      }),
    );
  };

  #onLeftHandleMouseUp = () => {
    if (this.lockRegions) return;
    if (this.#isDraggingLeftHandle) {
      // Dispatch while still in dragging mode so that state returns the updated values.
      this.dispatchEvent(
        new CustomEvent('region:change', {
          detail: this.state,
          bubbles: true,
          composed: true,
        }),
      );
      // Now clear the dragging flag.
      this.#isDraggingLeftHandle = false;
      document.removeEventListener('mousemove', this.#onLeftHandleMouseMove);
      document.removeEventListener('mouseup', this.#onLeftHandleMouseUp);
    }
  };

  // Right Handle
  #onRightHandleMouseDown(e) {
    if (this.lockRegions) return;
    e.stopPropagation();
    e.preventDefault();
    this.#isDraggingRightHandle = true;
    this.#handleDragStartX = e.clientX;
    // Save current region boundaries.
    this.#initialOffset = this.offset;
    this.#initialDuration = this.duration;
    document.addEventListener('mousemove', this.#onRightHandleMouseMove);
    document.addEventListener('mouseup', this.#onRightHandleMouseUp);
  }

  #onRightHandleMouseMove = e => {
    if (this.lockRegions) return;
    if (!this.#isDraggingRightHandle) return;
    const deltaX = e.clientX - this.#handleDragStartX;
    const secondsDelta = deltaX / this.#pixelsPerSecond;
    let newDuration = this.#initialDuration + secondsDelta;
    if (newDuration < 0) {
      newDuration = 0;
    }
    this.duration = newDuration;
    this.dispatchEvent(
      new CustomEvent('region:update', {
        detail: this.state,
        bubbles: true,
        composed: true,
      }),
    );
  };

  #onRightHandleMouseUp = () => {
    if (this.lockRegions) return;
    if (this.#isDraggingRightHandle) {
      // Dispatch while still in dragging mode so that state returns the updated values.
      this.dispatchEvent(
        new CustomEvent('region:change', {
          detail: this.state,
          bubbles: true,
          composed: true,
        }),
      );
      // Now clear the dragging flag.
      this.#isDraggingRightHandle = false;
      document.removeEventListener('mousemove', this.#onRightHandleMouseMove);
      document.removeEventListener('mouseup', this.#onRightHandleMouseUp);
    }
  };
}
