import '@firstcoders/loader-element/fc-loader.js';
import '@firstcoders/mask-element/fc-mask.js';
import '@firstcoders/player-button-element/fc-player-button.js';
import '@firstcoders/slider-element/fc-slider.js';
import '@firstcoders/range-element/fc-range.js';
import '@firstcoders/waveform-element/fc-waveform.js';
import { FcStemPlayer } from './src/StemPlayer.js';
import { FcStemPlayerControls } from './src/StemPlayerControls.js';
import { FcStemPlayerStem } from './src/StemPlayerStem.js';
import { Workspace } from './src/Workspace.js';
import { Row } from './src/Row.js';

export { default as config } from './src/config.js';

window.customElements.define('stemplayer-js', FcStemPlayer);
window.customElements.define('stemplayer-js-controls', FcStemPlayerControls);
window.customElements.define('stemplayer-js-stem', FcStemPlayerStem);
window.customElements.define('stemplayer-js-workspace', Workspace);
window.customElements.define('stemplayer-js-row', Row);
