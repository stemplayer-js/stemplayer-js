import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { StemComponent } from '../../src/component/stem-component';
import { defineCustomElements, StemsListComponent } from '../../src/component/stems-list-component';

defineCustomElements();

describe('StemsListComponent', () => {
  describe('construction', () => {
    it('intantiates', async () => {
      const el = await fixture(html`<soundws-stems-list>
        <soundws-stem
          id="stem-drums-b"
          label="Drums B"
          src="http://localhost:8000/assets/audio/106%20DRUMS%20B_01.5.m3u8"
          waveform="http://localhost:8000/assets/waveforms/106%20DRUMS%20B_01.5.json"
          muted="true"
          volume="0.2"
          wave-color="red"
        ></soundws-stem>
      </soundws-stems-list>`);

      expect(el instanceof StemsListComponent).to.equal(true);
      expect(el.stemComponents[0] instanceof StemComponent).to.equal(true);
    });
  });

  describe('styling', () => {
    it.skip('sets the maxHeight css var', () => {});
  });

  describe('rendering', () => {
    it.skip('renders a slot', () => {});
  });

  describe('public API', () => {});

  describe('events', () => {
    it.skip('calculates combined peaks when data changes', () => {});
    it.skip('solos a stem and mutes others', () => {});
    it.skip('solos stems', () => {});
    it.skip('emits a loading-start event when at least one stem is loading', () => {});
    it.skip('emits a loading-end event when the last stem finishes loading', () => {});
  });

  describe('slot changes', () => {
    it.skip('shares the controller on any stemComponent', () => {});
  });

  // describe('destruction', () => {});
});
