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
import { Observer } from 'wavesurfer.js/src/util';
import downSample from './downsample';

/**
 * A class that represents waveform "peaks".
 *
 * It exposes an API that allows modifications of the waveform representation
 */
export default class Peaks extends Observer {
  constructor(data, { maxPeaks = 3000 } = {}) {
    super();
    this.maxPeaks = maxPeaks;
    this.data = data || [];
  }

  /**
   * Combines multiple peaks
   *
   * @param  {...Array} arrays
   * @returns {Peaks}
   */
  static combine(...arrays) {
    const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });

    const data = result.map((_, i) =>
      arrays
        .map((xs) => xs[i] || 0)
        .reduce((sum, x) => {
          const f = Math.sqrt(x * x);
          const g = Math.sqrt(sum * sum);

          return f > g ? x : sum;
        }, 0)
    );

    return new Peaks(data);
  }

  set data(data) {
    if (Array.isArray(data)) {
      this._data = data.length > this.maxPeaks ? data : downSample(data, this.maxPeaks);
      this.update();
    }
  }

  get values() {
    return this.modifiedValues || this._data || [];
  }

  set scaleY(v) {
    this._scaleY = v;
    this.update();
  }

  get scaleY() {
    return this._scaleY;
  }

  set renderedDuration(v) {
    this._renderedDuration = v;
    this.update();
  }

  get renderedDuration() {
    return this._renderedDuration;
  }

  /**
   * @param {Integer} dataDuration - the duration in seconds that is represented by the peaks data
   */
  set dataDuration(dataDuration) {
    this._dataDuration = dataDuration;
    this.update();
  }

  get dataDuration() {
    return this._dataDuration;
  }

  /**
   * @returns {Integer} - the number of peaks per second
   */
  get peaksPerSecond() {
    return Array.isArray(this._data) && this._dataDuration > 0
      ? this._data.length / this._dataDuration
      : 0;
  }

  /**
   * Update will look to modify the data depending on various properties, such as scaleY (volume scaling); duration vs data duration.
   *
   * @private
   */
  update() {
    let modifiedValues = this._data;

    if (this.scaleY !== undefined) {
      modifiedValues = modifiedValues?.map((x) => x * this.scaleY);
    }

    if (this.dataDuration < this.renderedDuration) {
      const n = this.peaksPerSecond * this.renderedDuration;
      modifiedValues = modifiedValues.concat(
        new Array(Math.floor(n - modifiedValues.length)).fill(0)
      );
    } else if (this.dataDuration > this.renderedDuration) {
      const n = this.peaksPerSecond * this.renderedDuration;
      modifiedValues = modifiedValues.slice(0, n);
    }

    if (modifiedValues?.length > this.maxPeaks) {
      modifiedValues = downSample(modifiedValues, this.maxPeaks);
    }

    this.modifiedValues = modifiedValues;

    this.fireEvent('update');
  }
}
