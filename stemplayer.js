import '@soundws/loader-element/soundws-loader.js';
import '@soundws/mask-element/soundws-mask.js';
import '@soundws/player-button-element/soundws-player-button.js';
import '@soundws/slider-element/soundws-slider.js';
import '@soundws/range-element/soundws-range.js';
import '@soundws/waveform-element/soundws-waveform.js';
import { SoundwsStemPlayer } from './src/StemPlayer.js';
import { SoundwsStemPlayerControls } from './src/StemPlayerControls.js';
import { SoundwsStemPlayerStem } from './src/StemPlayerStem.js';
import { StemsListComponent } from './src/StemPlayerStemsList.js';

export { default as config } from './src/config.js';

window.customElements.define('stemplayer-js', SoundwsStemPlayer);
window.customElements.define(
  'stemplayer-js-controls',
  SoundwsStemPlayerControls,
);
window.customElements.define('stemplayer-js-stem', SoundwsStemPlayerStem);
window.customElements.define('stemplayer-js-stemslist', StemsListComponent);
