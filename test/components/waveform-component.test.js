import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { defineCustomElements, WaveformComponent } from '../../src/component/waveform-component';

defineCustomElements();

describe('WaveformComponent', () => {
  describe('construction', () => {
    it('intantiates', async () => {
      const el = await fixture(html`<soundws-waveform></soundws-waveform>`);
      expect(el instanceof WaveformComponent).to.equal(true);
    });

    it('hides if the property hidden is #true', async () => {
      const el = await fixture(html`<soundws-waveform hidden="true"></soundws-waveform>`);
      expect(el.style.display).to.equal('none');
    });
  });

  describe('styling', () => {
    it.skip('gets certain waveform params from computed css vars', () => {});
  });

  describe('property changes', () => {
    it.skip('loads the waveform when #src changes', () => {});
    it.skip('draws the waveform when #peaks changes', () => {});
    it.skip('sets the progress when #pct changes', () => {});
    it.skip('sets the progress when #pct changes', () => {});
    it.skip('draws adjusted peaks when #modifier changes', () => {});
    it.skip('scales the peaks when #duration changes', () => {});
    it.skip('scales the peaks when #totalDuration changes', () => {});
  });

  describe('public API', () => {
    it.skip('draws the peaks', () => {});
    it.skip('moves the progress', () => {});
  });

  describe('destruction', () => {
    it.skip('destroys the drawer', () => {});
    it.skip('unregisters listeners', () => {});
  });
});
