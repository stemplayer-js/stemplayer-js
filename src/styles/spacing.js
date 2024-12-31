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
  .pr1 {
    padding-right: 0.15rem;
  }

  .p1 {
    padding: 0.15rem;
  }

  .p2 {
    padding: 0.3rem;
  }

  .px1 {
    padding-left: 0.15rem;
    padding-right: 0.15rem;
  }

  .px4 {
    padding-left: 0.6rem;
    padding-right: 0.6rem;
  }

  .pr5 {
    padding-right: 0.75rem;
  }

  .p4 {
    padding: 0.6rem;
  }

  .pr2 {
    padding-right: 0.3rem;
  }

  .pr3 {
    padding-right: 0.3rem;
  }

  .ml--2 {
    margin-left: calc(var(--stemplayer-js-grid-base, 1.5rem) * -1);
  }
`;
