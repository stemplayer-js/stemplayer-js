# \<stemplayer-js>

A streaming, low latency Stem Player Web-Component

![A Stem Player](./assets/stem-player.png 'Stem Player')

[See this live example of our stem player](https://stemplayer-js.com)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Contributing

> This repo is a subtree split of our monorepo which will be made public in due course. We cannot process any pull-requests to this repo. Please contact us for help.

## Installation

```bash
npm i @stemplayer-js/stemplayer-js
```

## Usage

```html
<script type="module">
  import '@stemplayer-js/stemplayer-js/element.js';
</script>

<stemplayer-js>
  <stemplayer-js-controls label="A label"></stemplayer-js-controls>
  <stemplayer-js-stem
    label="Drums A"
    src="https://your-cdn-com/drums.m3u8"
    waveform="https://your-cdn-com/drums.json"
    volume="0.1"
  >
  </stemplayer-js-stem>
  <stemplayer-js-stem
    label="Vocals"
    src="https://your-cdn-com/vocals.m3u8"
    waveform="https://your-cdn-com/vocals.json"
    muted="true"
    volume="0.2"
  ></stemplayer-js-stem>
</stemplayer-js>
```

See [here for further options, events and CSS variables](./docs/stemplayer-js.md)

# Browser Support

The Player works in [browsers supporting the Web Audio API](https://caniuse.com/#feat=audio-api). This includes most modern browsers.

The stem player is built as a [web-component](https://caniuse.com/?search=web%20components) which is supported natively by most modern browsers.

For targeting older browsers, you can utilise your own build system.

[Polyfills for web-components](https://www.jsdelivr.com/package/npm/@webcomponents/webcomponentsjs) exist for support for older browsers.

# Audio

The player consumes m3u8 playlist files known from the [HLS protocol](https://en.wikipedia.org/wiki/HTTP_Live_Streaming).

The audio is split up into chunks and served (over simple HTTP) separately.

**Why HLS and not just download whole files?**
Downloading and decoding, for example, 10 5minute audio files will consume bandwith and bloat memory: each minute of every audio file worth of mp3 data is decoded into 44k PCM data and will consume roughly 100mb. By using live streaming we not only speed up playback, we also reduce the memory footprint.

**Why not progressive download?**
We need to use the web audio API to achieve precise synchronized playback.

See also

- [https://ffmpeg.org/ffmpeg-formats.html#toc-hls-1](https://ffmpeg.org/ffmpeg-formats.html#toc-hls-1)
- [https://ffmpeg.org/ffmpeg-formats.html#toc-segment_002c-stream_005fsegment_002c-ssegment](https://ffmpeg.org/ffmpeg-formats.html#toc-segment_002c-stream_005fsegment_002c-ssegment)

See also this [Docker image](https://github.com/sound-ws/docker-segment-audio) to help you segment your audio.

If you have an AWS environment, we have also created [a Serverless Backend](https://github.com/stemplayer-js/api) that will do this for you.

# Waveforms

Because we don't download the entire audio file, we cannot analyse the audio so that we can display a nice waveform. So unfortunately these also need to be pre-generated. Although inconvenient, it is probably good practice anyway as a waveform in json format is very small in size; there is no need to re-compute it time and time again.

[See here for info on how to generate compatible waveforms](https://github.com/bbc/audiowaveform). Make sure you limit the `--pixels-per-second` to around `20`, since by default the library will output that contains too much detail.

The output will have to be normalized so the waveform will be represented by an array of numbers that is between -1 and +1.

See here for a [Docker image](https://github.com/sound-ws/docker-generate-waveforms) which should (hopefully) help.

If you have an AWS environment, we have also created [a Serverless Backend](https://github.com/stemplayer-js/api) that will do this for you.

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to minimize the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
