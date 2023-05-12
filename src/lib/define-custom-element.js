/*
 * Copyright (c) 2018 Alexufo . Original code 2013 by Sveinn Steinarsson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * @see https://github.com/Alexufo/Responsive-waveform/blob/master/largestTriangleThreeBuckets.js
 */

/**
 * Convenience function to define custom elements - if not exists
 *
 * @param {String} name - the tagname
 * @param {Object} element - the element
 */
export default (name, element) => {
  if (!window.customElements.get(name)) window.customElements.define(name, element);
};
