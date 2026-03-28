import { html } from 'lit';
import { ResponsiveConsumerLitElement } from './ResponsiveConsumerLitElement.js';
import { WaveformHostMixin } from './mixins/WaveformHostMixin.js';
import gridStyles from './styles/grid.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import utilityStyle from './styles/utilities.js';
import rowStyles from './styles/row.js';

/**
 * Base row component that provides shared styles, structure, and lifecycle
 * for StemPlayerStem and StemPlayerControls.
 */
export class StemPlayerBaseRow extends WaveformHostMixin(
  ResponsiveConsumerLitElement,
) {
  static get styles() {
    return [
      gridStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      utilityStyle,
      rowStyles,
    ];
  }

  static get properties() {
    return {
      /**
       * The label to display
       */
      label: { type: String },

      /**
       * The duration of the track
       */
      duration: { type: Number },

      /**
       * The percentage of the current time
       */
      currentPct: { type: Number, hasChanged: () => false },
    };
  }

  set currentPct(val) {
    this._currentPct = val;
    this.updateProgress(val);
  }

  get currentPct() {
    return this._currentPct;
  }

  /**
   * Called when currentPct is updated so that subclasses can directly update
   * their UI controls without triggering a Lit re-render.
   */
  updateProgress(val) {
    const el = this.shadowRoot?.querySelector('fc-waveform');
    if (el) el.progress = val;
  }

  render() {
    return html`<div>
      ${this.displayMode === 'lg'
        ? this.renderLargeScreen()
        : this.renderSmallScreen()}
    </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  renderLargeScreen() {
    return html``;
  }

  // eslint-disable-next-line class-methods-use-this
  renderSmallScreen() {
    return html``;
  }
}
