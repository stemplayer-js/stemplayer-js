import { css } from 'lit';

export default css`
  .bgBrand {
    background-color: var(--stemplayer-js-brand-color, rgb(1, 164, 179));
  }

  .focusBgBrand:focus {
    background-color: var(--stemplayer-js-brand-color, rgb(1, 164, 179));
  }

  .bgPlayer {
    background-color: var(--stemplayer-js-background-color, black);
  }
`;
