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
export default (...arrays) => {
  const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
  const result = Array.from({ length: n });

  const data = result.map((_, i) =>
    arrays
      .map(xs => xs[i] || 0)
      .reduce((sum, x) => {
        const f = Math.sqrt(x * x);
        const g = Math.sqrt(sum * sum);

        return f > g ? x : sum;
      }, 0),
  );

  return { data };
};
