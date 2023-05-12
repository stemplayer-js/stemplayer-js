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
  .w0 {
    width: 0;
  }

  .w1 {
    width: 25px;
  }

  .w2 {
    width: 50px;
  }

  .w3 {
    width: 75px;
  }

  .w4 {
    width: 100px;
  }

  .w5 {
    width: 125px;
  }

  .w6 {
    width: 150px;
  }

  .w7 {
    width: 175px;
  }

  .w8 {
    width: 200px;
  }

  .w9 {
    width: 225px;
  }

  .w10 {
    width: 250px;
  }

  .w100 {
    width: 100%;
  }

  .w2lg[data-size='lg'] {
    width: 50px;
  }

  .w4lg[data-size='lg'] {
    width: 100px;
  }

  .w8lg[data-size='lg'] {
    width: 200px;
  }

  .flexlg[data-size='lg'] {
    flex: 1;
  }

  .w0sm[data-size='xs'],
  .w0sm[data-size='sm'] {
    width: 0;
  }

  .w2sm[data-size='xs'],
  .w2sm[data-size='sm'] {
    width: 50px;
  }

  .w3sm[data-size='xs'],
  .w3sm[data-size='sm'] {
    width: 75px;
  }

  .w4sm[data-size='xs'],
  .w4sm[data-size='sm'] {
    width: 100px;
  }

  .w6sm[data-size='xs'],
  .w6sm[data-size='sm'] {
    width: 150px;
  }
`;
