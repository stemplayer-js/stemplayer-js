import { css } from 'lit';

export default css`
  .textSm {
    font-size: 0.85rem;
  }

  .textXs {
    font-size: 0.75rem;
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

  .truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
