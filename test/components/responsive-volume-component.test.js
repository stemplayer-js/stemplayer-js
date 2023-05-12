import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  defineCustomElements,
  ResponsiveVolumeComponent,
} from '../../src/component/responsive-volume-component';

defineCustomElements();

describe('ResponsiveVolumeComponent', () => {
  it('intantiates', async () => {
    const el = await fixture(html`<soundws-responsive-volume></soundws-responsive-volume>`);
    expect(el instanceof ResponsiveVolumeComponent).to.equal(true);
  });
});
