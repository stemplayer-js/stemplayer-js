/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import licence from 'rollup-plugin-license';
import svg from 'rollup-plugin-svg';

const filesizeConfig = {
  showGzippedSize: true,
  showBrotliSize: false,
  showMinifiedSize: false,
};

//  const copyConfig = {
//    targets: [
//      { src: 'node_modules/@webcomponents', dest: 'build-modern/node_modules' },
//      { src: 'images', dest: 'build-modern' },
//      { src: 'data', dest: 'build-modern' },
//      { src: 'index.html', dest: 'build-modern', rename: 'index.html' },
//    ],
//  };

// The main JavaScript bundle for modern browsers that support
// JavaScript modules and other ES2015+ features.
const config = {
  input: 'index.js',
  // moduleContext: '',
  watch: {
    include: 'src/**',
  },
  output: [
    {
      file: `dist/soundws-stem-player.es.js`,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['lit'],
  preserveSymlinks: true,
  plugins: [
    resolve(),
    commonjs({
      include: /node_modules/,
    }),
    babel({
      babelHelpers: 'bundled', //TODO should be runtime? https://www.npmjs.com/package/@rollup/plugin-babel
      rootMode: 'upward',
      include: [
        'src/**',
        // 'node_modules/lit/**',
        // 'node_modules/lit-element/**',
        // 'node_modules/lit-html/**',
      ],
    }),
    minifyHTML.default(),
    //  copy(copyConfig),
    filesize(filesizeConfig),
    postcss({
      inject: false,
    }),
    postcssLit(),
    svg(),
    licence({
      banner: {
        content: `Copyright (C) 2019-2023 First Coders LTD

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program. If not, see <https://www.gnu.org/licenses/>.`,
        commentStyle: 'ignored',
      },
      thirdParty: {
        output: path.join('dist', 'THIRD-PARTY-LICENSES.txt'),
      },
    }),
  ],
  preserveEntrySignatures: 'strict',
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(
    terser({
      // ecma: 2020,
      // module: true,
      warnings: true,
    })
  );
}

export default config;
