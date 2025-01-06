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
  .relative {
    position: relative;
  }

  .dInline {
    display: inline;
  }

  .hAuto {
    height: max-content;
    line-height: normal;
  }

  .absolute {
    position: absolute;
  }

  .overflowHidden {
    overflow: hidden;
  }

  .w100 {
    width: 100%;
  }

  .h100 {
    height: 100%;
  }

  .noSelect {
    user-select: none;
    -webkit-user-select: none;
  }

  .stickLeft {
    position: sticky;
    left: 0;
  }

  .stickRight {
    position: sticky;
    right: 0;
  }

  .z99 {
    z-index: 99;
  }

  .z999 {
    z-index: 990;
  }

  .op75 {
    opacity: 0.75;
  }

  .op0 {
    opacity: 0;
  }

  .top {
    top: 0;
  }

  .bottom {
    bottom: 0;
  }

  .right {
    right: 0;
  }

  .noPointerEvents {
    pointer-events: none;
  }

  .hRow {
    line-height: var(--stemplayer-js-row-height, 4.5rem);
    height: var(--stemplayer-js-row-height, 4.5rem);
  }

  .left-2 {
    left: calc(-1 * var(--stemplayer-js-grid-base, 1.5rem) * 2);
  }

  .right-2 {
    right: calc(-1 * var(--stemplayer-js-grid-base, 1.5rem) * 2);
  }

  .dBlock {
    display: block;
  }
`;
