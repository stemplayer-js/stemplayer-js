import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import { fromRollup } from '@web/dev-server-rollup';
import commonjs from '@rollup/plugin-commonjs';
import puppeteer from 'puppeteer';

const filteredLogs = ['Running in dev mode', 'lit-html is in dev mode', 'Lit is in dev mode'];

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: ['test/**/*.test.js'],

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some((l) => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   // playwrightLauncher({ product: 'firefox' }),
  //   // playwrightLauncher({ product: 'webkit' }),
  // ],

  browsers: [
    puppeteerLauncher({
      concurrency: 1,
      launchOptions: {
        executablePath: puppeteer.executablePath(),
        headless: true,
      },
    }),
  ],

  mimeTypes: {
    '**/*.svg': 'js',
  },

  plugins: [
    fromRollup(commonjs)(),
    // The svg plugin does not work, so we mock any old svg
    // https://modern-web.dev/docs/dev-server/writing-plugins/examples/
    {
      name: 'my-plugin',
      serve(context) {
        if (context.path.indexOf('.svg') !== -1) {
          return `
          export default '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>';
          `;
        }
      },
    },
  ],

  // See documentation for all available options
});
