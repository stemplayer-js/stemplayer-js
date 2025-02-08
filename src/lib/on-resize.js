import debounce from './debounce.js';

export default (el, fn) => {
  const onResize = debounce(fn, 200);
  // most browsers support resizeobserver
  if (ResizeObserver) {
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(el);
    // return function to stop observing
    return {
      un: () => {
        // onResize.cancel();
        resizeObserver.unobserve(el);
      },
    };
  }
  // if not, listen on window change
  window.addEventListener('resize', onResize, true);
  window.addEventListener('orientationchange', onResize, true);
  // return function to stop observing
  return {
    un: () => {
      onResize.cancel();
      window.removeEventListener('resize', onResize, true);
      window.removeEventListener('orientationchange', onResize, true);
    },
  };
};
