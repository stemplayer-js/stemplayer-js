import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { defineCustomElements, SeekComponent } from '../../src/component/seek-component';

defineCustomElements();

describe('SeekComponent', () => {
  it('intantiates', async () => {
    const el = await fixture(html`<soundws-seek></soundws-seek>`);
    expect(el instanceof SeekComponent).to.equal(true);
  });
});
