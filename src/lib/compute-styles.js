export const computeWaveformStyles = (e, defaults = {}) => {
  try {
    // EXPERIMENTAL. These properties are used by javascript when instantiating the waveform drawer.
    // This has the possibility of being unreliable.
    // get some stuff that is not styled by css from css vars anyway (for nice theming)
    const computedStyle = getComputedStyle(e);

    return {
      waveColor:
        computedStyle.getPropertyValue('--stemplayer-js-waveform-color') ||
        defaults.waveColor,
      progressColor:
        computedStyle.getPropertyValue(
          '--stemplayer-js-waveform-progress-color',
        ) || defaults.progressColor,
      barWidth:
        computedStyle.getPropertyValue('--stemplayer-js-waveform-bar-width') ||
        defaults.barWidth,
      barGap:
        computedStyle.getPropertyValue('--stemplayer-js-waveform-bar-gap') ||
        defaults.barGap,
      pixelRatio:
        computedStyle.getPropertyValue(
          '--stemplayer-js-waveform-pixel-ratio',
        ) || defaults.pixelRatio,
      controlsWaveColor:
        computedStyle.getPropertyValue(
          '--stemplayer-js-controls-waveform-color',
        ) || defaults.controlsWaveColor,
      controlsProgressColor:
        computedStyle.getPropertyValue(
          '--stemplayer-js-controls-waveform-progress-color',
        ) || defaults.controlsProgressColor,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.debug('Could not use computed waveform styles', err);
  }

  return defaults;
};
