/**
 * @license
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
