import { css } from 'lit';

export default css`
  .stem-row {
    position: relative;
    line-height: var(--stemplayer-js-row-height, 4.5rem);
    height: var(--stemplayer-js-row-height, 4.5rem);
    user-select: none;
  }

  .wControls {
    width: var(--stemplayer-js-row-controls-width);
  }

  .wEnd {
    min-width: var(--stemplayer-js-row-end-width);
  }

  .bgControls {
    background-color: var(--stemplayer-js-row-controls-background-color, black);
  }

  .bgEnd {
    background-color: var(--stemplayer-js-row-end-background-color, black);
  }

  .hRow {
    line-height: var(--stemplayer-js-row-height, 4.5rem);
    height: var(--stemplayer-js-row-height, 4.5rem);
  }
`;
