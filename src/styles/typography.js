import { css } from 'lit';

export default css`
  .textSm {
    font-size: 0.85em;
  }

  .textXs {
    font-size: 0.75em;
  }

  .textMuted {
    opacity: 0.5;
  }

  .textCenter {
    text-align: center;
  }

  .textLeft {
    text-align: left;
  }

  .textRight {
    text-align: right;
  }

  .truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
