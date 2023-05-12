/**
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

/* eslint-disable no-restricted-globals */
import Drawer from 'wavesurfer.js/src/drawer.multicanvas';

const defaults = {
  audioContext: null,
  audioScriptProcessor: null,
  audioRate: 1,
  autoCenter: true,
  autoCenterRate: 5,
  autoCenterImmediately: false,
  backend: 'WebAudio',
  backgroundColor: null,
  barHeight: 1,
  barRadius: 0,
  barGap: null,
  barMinHeight: 1,
  container: null,
  cursorColor: '#333',
  cursorWidth: 1,
  dragSelection: true,
  drawingContextAttributes: {
    // Boolean that hints the user agent to reduce the latency
    // by desynchronizing the canvas paint cycle from the event
    // loop
    desynchronized: false,
  },
  duration: null,
  fillParent: true,
  forceDecode: false,
  height: 128,
  hideScrollbar: false,
  hideCursor: false,
  ignoreSilenceMode: false,
  interact: true,
  loopSelection: true,
  maxCanvasWidth: 4000,
  mediaContainer: null,
  mediaControls: false,
  mediaType: 'audio',
  minPxPerSec: 20,
  normalize: false,
  partialRender: false,
  pixelRatio: window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI,
  plugins: [],
  progressColor: '#555',
  removeMediaElementOnDestroy: true,
  // renderer: MultiCanvas,
  responsive: false,
  rtl: false,
  scrollParent: false,
  skipLength: 2,
  splitChannels: false,
  splitChannelsOptions: {
    overlay: false,
    channelColors: {},
    filterChannels: [],
    relativeNormalization: false,
    splitDragSelection: false,
  },
  vertical: false,
  waveColor: '#999',
  xhr: {},
};

class DrawerFactory {
  // TODO unregister listeners on destroy
  static create({ container, params }) {
    const config = { ...defaults, ...params };
    const drawer = new Drawer(container, config);

    drawer.drawPeaks = (data, duration) => {
      const nominalWidth = Math.round(duration * config.minPxPerSec * config.pixelRatio);
      const parentWidth = drawer.getWidth();
      let width = nominalWidth;
      let start = 0;
      let end = Math.max(start + parentWidth, width);

      if (config.fillParent && (!config.scrollParent || nominalWidth < parentWidth)) {
        width = parentWidth;
        start = 0;
        end = width;
      }

      // const parentWidth = drawer.getWidth();
      // const start = 0;
      // const end = Math.max(start + parentWidth, width);

      return Drawer.prototype.drawPeaks.call(drawer, data, width, start, end);
    };

    return drawer;
  }
}

export default DrawerFactory;
