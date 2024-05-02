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
import '@soundws/loader-element/soundws-loader.js';
import '@soundws/mask-element/soundws-mask.js';
import '@soundws/player-button-element/soundws-player-button.js';
import '@soundws/slider-element/soundws-slider.js';
import '@soundws/range-element/soundws-range.js';
import '@soundws/waveform-element/soundws-waveform.js';
import { SoundwsStemPlayer } from './src/StemPlayer.js';
import { SoundwsStemPlayerControls } from './src/StemPlayerControls.js';
import { SoundwsStemPlayerStem } from './src/StemPlayerStem.js';
import { RegionArea } from './src/RegionArea.js';

export { default as config } from './src/config.js';

window.customElements.define('stemplayer-js', SoundwsStemPlayer);
window.customElements.define(
  'stemplayer-js-controls',
  SoundwsStemPlayerControls,
);
window.customElements.define('stemplayer-js-stem', SoundwsStemPlayerStem);
window.customElements.define('stemplayer-js-region', RegionArea);
