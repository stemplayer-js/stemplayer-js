import { html, css, LitElement } from 'lit';
import gridStyles from './styles/grid.js';
import flexStyles from './styles/flex.js';
import bgStyles from './styles/backgrounds.js';
import utilityStyle from './styles/utilities.js';

/**
 * A component to render a single stem
 */
export class Row extends LitElement {
  static get styles() {
    return [
      gridStyles,
      flexStyles,
      bgStyles,
      utilityStyle,
      css`
        :host {
          display: block;
          position: relative;
          line-height: var(--stemplayer-js-row-height, 4.5rem);
          height: var(--stemplayer-js-row-height, 4.5rem);
          user-select: none;
        }

        .wControls {
          width: var(--stemplayer-js-row-controls-width);
        }

        .wEnd {
          min-width: var(--stemplayer-js-row-end-width);
        }

        .bgControls {
          background-color: var(
            --stemplayer-js-row-controls-background-color,
            black
          );
        }

        .bgEnd {
          background-color: var(
            --stemplayer-js-row-end-background-color,
            black
          );
        }
      `,
    ];
  }

  static get properties() {
    return {
      displayMode: { type: String },
    };
  }

  render() {
    return this.displayMode === 'sm'
      ? this.#getSmallScreenTpl()
      : this.#getLargeScreenTpl();
  }

  /**
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #getSmallScreenTpl() {
    return html`<div class="dFlex h100 overflowHidden"><slot></slot></div>`;
  }

  /**
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #getLargeScreenTpl() {
    return html`<div class="dFlex h100">
      <div class="wControls stickLeft bgControls z999">
        <slot name="controls"></slot>
      </div>
      <div class="flex1">
        <slot name="flex"></slot>
      </div>
      <div class="wEnd stickRight bgEnd z99 dFlex">
        <slot name="end"></slot>
      </div>
    </div>`;
  }

  /**
   * Returns the combined width of the non fluid (flex) containers
   */
  get nonFlexWidth() {
    try {
      return (
        this.shadowRoot.querySelector('div.wControls').clientWidth +
        this.shadowRoot.querySelector('div.wEnd').clientWidth
      );
    } catch (err) {
      return undefined;
    }
  }
}
