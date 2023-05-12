import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { defineCustomElements, PlayerComponent } from '../../src/component/player-component';

defineCustomElements();

describe('PlayerComponent', () => {
  it('intantiates', async () => {
    const el = await fixture(html`<soundws-stem-player></soundws-stem-player>`);
    expect(el instanceof PlayerComponent).to.equal(true);
  });
});
