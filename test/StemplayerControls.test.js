import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../stemplayer.js';

describe('StemPlayerControls', () => {
  // Property setters

  describe('when the label is set', () => {
    it('renders the value', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      expect(el.slottedElements[0].label).to.equal('Down by the River');
      expect(
        el.slottedElements[0].shadowRoot
          .querySelector('span')
          .innerHTML.indexOf('Down by the River') !== -1,
      ).to.not.equal(-1);
    });
  });

  describe('when the duration is set', () => {
    it('renders the value', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      el.slottedElements[0].duration = 121;

      await el.slottedElements[0].updateComplete;

      expect(
        !!Array.from(
          el.slottedElements[0].shadowRoot.querySelectorAll('span'),
        ).find(e => e.innerHTML.indexOf('02:01') !== -1),
      ).to.equal(true);
    });
  });

  describe('when the currentTime is set', () => {
    it('renders the value', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      el.slottedElements[0].currentTime = 61;

      await el.slottedElements[0].updateComplete;

      expect(
        !!Array.from(
          el.slottedElements[0].shadowRoot.querySelectorAll('span'),
        ).find(e => e.innerHTML.indexOf('01:01') !== -1),
      ).to.equal(true);
    });
  });

  describe('when the peaks are set', () => {
    it('the waveform is rendered', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      await el.slottedElements[0].updateComplete;

      const peaks = { data: [1, 2, 3] };

      el.slottedElements[0].peaks = peaks;

      const waveformEl =
        el.slottedElements[0].shadowRoot.querySelector('soundws-waveform');

      await waveformEl.updateComplete;

      expect(waveformEl.peaks).to.equal(peaks);
    });
  });

  describe('when the currentPct is set', () => {
    it('sets the progress on the waveform', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      el.slottedElements[0].currentPct = 50;

      await el.slottedElements[0].updateComplete;

      const waveformEl =
        el.slottedElements[0].shadowRoot.querySelector('soundws-waveform');

      await waveformEl.updateComplete;

      expect(waveformEl.progress).to.equal(50);
    });
  });

  describe('when #isPlaying is true', () => {
    it('renders a pause button', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      el.slottedElements[0].isPlaying = true;

      await el.slottedElements[0].updateComplete;

      expect(
        el.slottedElements[0].shadowRoot.querySelector('soundws-player-button')
          .type,
      ).to.equal('pause');
    });
  });

  describe('when #isPlaying is false', () => {
    it('renders a play button', async () => {
      const el = await fixture(
        html`<stemplayer-js
          ><stemplayer-js-controls
            label="Down by the River"
          ></stemplayer-js-controls
        ></stemplayer-js>`,
      );

      el.slottedElements[0].isPlaying = false;

      await el.slottedElements[0].updateComplete;

      expect(
        el.slottedElements[0].shadowRoot.querySelector('soundws-player-button')
          .type,
      ).to.equal('play');
    });
  });

  it('allows setting of a waveColor', async () => {});
  it('allows setting of a waveProgressColor', async () => {});

  // styling
  it('it computes the waveform styles from css vars', async () => {});

  // events
  it('dispatches a play event', async () => {});
  it('dispatches a pause event', async () => {});
  it('dispatches a seek event', async () => {});
  it('dispatches a seeking event', async () => {});

  // other
  it('passes the a11y audit', async () => {
    const el = await fixture(
      html`<stemplayer-js
        ><stemplayer-js-controls></stemplayer-js-controls
      ></stemplayer-js>`,
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
