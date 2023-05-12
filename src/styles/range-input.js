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
import { css } from 'lit';

export default css`
  [type='range'] {
    -webkit-appearance: none;
    background: transparent;
    margin: 11px 0;
    width: 100%;
    height: var(--sws-stemsplayer-row-height, 60px);
    margin: 0;
    padding: 5px;
    display: block;
    min-width: 0;
    padding: 0;
  }
  [type='range']::-moz-focus-outer {
    border: 0;
  }
  [type='range']:focus {
    outline: 0;
  }
  [type='range']:focus::-webkit-slider-runnable-track {
    background: #8d8d8d;
  }
  [type='range']:focus::-ms-fill-lower {
    background: grey;
  }
  [type='range']:focus::-ms-fill-upper {
    background: #8d8d8d;
  }
  [type='range']::-webkit-slider-runnable-track {
    cursor: default;
    height: 3px;
    transition: all 0.2s ease;
    width: 100%;
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0 0px rgba(13, 13, 13, 0.2);
    background: grey;
    border: 0px solid #cfd8dc;
    border-radius: 5px;
  }
  [type='range']::-webkit-slider-thumb {
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2), 0 0 3px rgba(13, 13, 13, 0.2);
    background: #ddd;
    border: 2px solid #aaa;
    border-radius: 18px;
    box-sizing: border-box;
    cursor: default;
    height: 22px;
    width: 7px;
    transition: background-color 0.2s, border-color 0.2s;
    -webkit-appearance: none;
    margin-top: -9.5px;
  }
  [type='range']::-webkit-slider-thumb:hover {
    background-color: #fff;
    border-color: var(--sws-stemsplayer-accent-color, #01a4b3);
  }
  [type='range']::-moz-range-track {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0 0px rgba(13, 13, 13, 0.2);
    cursor: default;
    height: 3px;
    transition: all 0.2s ease;
    width: 100%;
    background: grey;
    border: 0px solid #cfd8dc;
    border-radius: 5px;
    height: 1.5px;
  }
  [type='range']::-moz-range-thumb {
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2), 0 0 3px rgba(13, 13, 13, 0.2);
    background: #ddd;
    border: 2px solid #aaa;
    border-radius: 18px;
    box-sizing: border-box;
    cursor: default;
    height: 22px;
    width: 7px;
    transition: background-color 0.2s, border-color 0.2s;
  }
  [type='range']::-moz-range-thumb:hover {
    background-color: #fff;
    border-color: var(--sws-stemsplayer-accent-color, #01a4b3);
  }
  [type='range']::-ms-track {
    cursor: default;
    height: 3px;
    transition: all 0.2s ease;
    width: 100%;
    background: transparent;
    border-color: transparent;
    border-width: 11px 0;
    color: transparent;
  }
  [type='range']::-ms-fill-lower {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0 0px rgba(13, 13, 13, 0.2);
    background: #737373;
    border: 0px solid #cfd8dc;
    border-radius: 10px;
  }
  [type='range']::-ms-fill-upper {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0 0px rgba(13, 13, 13, 0.2);
    background: grey;
    border: 0px solid #cfd8dc;
    border-radius: 10px;
  }
  [type='range']::-ms-thumb {
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2), 0 0 3px rgba(13, 13, 13, 0.2);
    background: #ddd;
    border: 2px solid #aaa;
    border-radius: 18px;
    box-sizing: border-box;
    cursor: default;
    height: 22px;
    width: 7px;
    transition: background-color 0.2s, border-color 0.2s;
    margin-top: 0.75px;
  }
  [type='range']::-ms-thumb:hover {
    background-color: #fff;
    border-color: var(--sws-stemsplayer-accent-color, #01a4b3);
  }
`;
