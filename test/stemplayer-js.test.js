import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../stemplayer.js';

describe('StemPlayer', () => {
  it('allows setting of a max-height attribute', async () => {});

  // it('has a default header "Hey there" and counter 5', async () => {
  //   const el = await fixture(html`<stemplayer-js></stemplayer-js>`);

  //   expect(el.header).to.equal('Hey there');
  //   expect(el.counter).to.equal(5);
  // });

  // it('increases the counter on button click', async () => {
  //   const el = await fixture(html`<stemplayer-js></stemplayer-js>`);
  //   el.shadowRoot.querySelector('button').click();

  //   expect(el.counter).to.equal(6);
  // });

  // it('can override the header via attribute', async () => {
  //   const el = await fixture(
  //     html`<stemplayer-js header="attribute header"></stemplayer-js>`,
  //   );

  //   expect(el.header).to.equal('attribute header');
  // });

  // it('pauses when disconnected', async () => {});

  // it('loops when loop is set', async () => {})

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<stemplayer-js></stemplayer-js>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
