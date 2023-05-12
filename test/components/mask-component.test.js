import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { defineCustomElements, MaskComponent } from '../../src/component/mask-component';

defineCustomElements();

describe('MaskComponent', () => {
  it('intantiates', async () => {
    const el = await fixture(html`<soundws-mask></soundws-mask>`);
    expect(el instanceof MaskComponent).to.equal(true);
  });
});
