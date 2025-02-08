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

  .h0 {
    height: 0;
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

  .hidden {
    visibility: hidden;
  }
`;
