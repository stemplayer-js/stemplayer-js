import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../stemplayer.js';

describe('StemPlayerControls', () => {
  // Property setters
  it('allows setting of a label', async () => {
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

  it('allows setting of a duration', async () => {
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

  it('allows setting of the currentTime', async () => {});
  it('allows setting of the peaks', async () => {});
  it('allows setting of the currentPct', async () => {});
  it('allows setting of the play state', async () => {});
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
