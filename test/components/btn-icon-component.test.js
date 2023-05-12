import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { defineCustomElements, BtnIconComponent } from '../../src/component/btn-icon-component';

defineCustomElements();

describe('BtnIconComponent', () => {
  describe('construction', () => {
    it('intantiates', async () => {
      const el = await fixture(html`<soundws-btn-icon name="solo"</soundws-btn-icon>`);
      expect(el instanceof BtnIconComponent).to.equal(true);
    });
  });

  describe('rendering', () => {
    it.skip('renders a button with an svg', () => {});
  });
});
