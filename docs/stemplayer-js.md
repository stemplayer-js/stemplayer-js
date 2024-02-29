# stemplayer-js

A Stem Player web component

## Properties

| Property           | Attribute            | Modifiers | Type                                             | Default | Description                                      |
|--------------------|----------------------|-----------|--------------------------------------------------|---------|--------------------------------------------------|
| `audioContext`     | `audioContext`       |           | `object`                                         |         | Inject a pre instantiated AudioContext           |
| `autoplay`         | `autoplay`           |           | `boolean`                                        | false   | Whether to (attempt) autoplay                    |
| `currentTime`      |                      |           | `number`                                         |         | Set the curentTime of playback, seeking to that time. |
| `duration`         | `duration`           |           | `number`                                         |         | overrides the duration                           |
| `isLoading`        | `isLoading`          |           |                                                  |         |                                                  |
| `loop`             | `loop`               |           | `boolean`                                        | false   | Allows looping (experimental)                    |
| `noHover`          | `no-hover`           |           | `boolean`                                        | false   | Disabled the mouseover hover effect              |
| `noKeyboardEvents` | `no-keyboard-events` |           | `boolean`                                        | false   | Controls the player by keyboard events (e.g. space = start/pause) |
| `pct`              |                      |           | `number`                                         |         | Sets the currentTime to a pct of total duration, seeking to that time |
| `slottedElements`  |                      | readonly  | `Element[]`                                      |         |                                                  |
| `state`            |                      | readonly  | `{ state: any; currentTime: any; stems: { id: any; src: any; waveform: any; volume: any; muted: any; solo: any; }[]; }` |         | Exports the current state of the player          |
| `stemComponents`   |                      | readonly  | `array`                                          |         | Get the stem componenents                        |

## Methods

| Method    | Type       | Description    |
|-----------|------------|----------------|
| `destroy` | `(): void` |                |
| `pause`   | `(): any`  | Pause playback |
| `play`    | `(): any`  | Start playback |

## Events

| Event           | Type                           | Description                                      |
|-----------------|--------------------------------|--------------------------------------------------|
| `end`           |                                | Fires when the player reaches the end of the playback |
| `loading-end`   |                                | Fires when the player completes loading data     |
| `loading-start` |                                | Fires when the player starts loading data        |
| `pause`         |                                | Fires when the player pauses playback            |
| `peaks`         | `CustomEvent<{ peaks: any; }>` |                                                  |
| `seek`          |                                | Fires when the player seeks                      |
| `start`         |                                | Fires when the player starts playing             |
| `timeupdate`    |                                | Fires the player progresses                      |

## Slots

| Name     | Description             |
|----------|-------------------------|
|          | The default (body) slot |
| `footer` |                         |
| `header` |                         |

## CSS Custom Properties

| Property                                  | Default                                          |
|-------------------------------------------|--------------------------------------------------|
| `--stemplayer-hover-background-color`     | "rgba(255, 255, 255, 0.5)"                       |
| `--stemplayer-hover-mix-blend-mode`       | "overlay"                                        |
| `--stemplayer-js-background-color`        | "black"                                          |
| `--stemplayer-js-brand-color`             | "rgb(1, 164, 179)"                               |
| `--stemplayer-js-color`                   | "rgb(220, 220, 220)"                             |
| `--stemplayer-js-font-family`             | "'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif" |
| `--stemplayer-js-font-size`               | "16px"                                           |
| `--stemplayer-js-grid-base`               | "1.5rem"                                         |
| `--stemplayer-js-max-height`              | "auto"                                           |
| `--stemplayer-js-row-height`              | "4.5rem"                                         |
| `--stemplayer-js-waveform-bar-gap`        |                                                  |
| `--stemplayer-js-waveform-bar-width`      |                                                  |
| `--stemplayer-js-waveform-color`          |                                                  |
| `--stemplayer-js-waveform-pixel-ratio`    |                                                  |
| `--stemplayer-js-waveform-progress-color` |                                                  |


# stemplayer-js-controls

A component to render a single stem

## Properties

| Property            | Attribute           | Modifiers | Type                           | Description                                      |
|---------------------|---------------------|-----------|--------------------------------|--------------------------------------------------|
| `currentPct`        | `currentPct`        |           | `number`                       | The percentage of the current time               |
| `currentTime`       | `currentTime`       |           | `number`                       | The current time of playback                     |
| `duration`          | `duration`          |           | `number`                       | The duration of the track                        |
| `isPlaying`         | `isPlaying`         |           | `boolean`                      | The playing state                                |
| `label`             | `label`             |           | `string`                       | The label to display                             |
| `peaks`             | `peaks`             |           | `object`                       | The peaks data that are to be used for displaying the waveform |
| `waveColor`         | `waveColor`         |           | `string`                       | The colour of the waveform                       |
| `waveProgressColor` | `waveProgressColor` |           | `string`                       | The wave progress colour                         |
| `waveformComponent` |                     | readonly  | `Element \| null \| undefined` |                                                  |

## Events

| Event              | Type                  |
|--------------------|-----------------------|
| `controls:pause`   |                       |
| `controls:play`    |                       |
| `controls:seek`    | `CustomEvent<number>` |
| `controls:seeking` | `CustomEvent<any>`    |

## CSS Custom Properties

| Property                                         |
|--------------------------------------------------|
| `--stemplayer-js-controls-background-color`      |
| `--stemplayer-js-controls-color`                 |
| `--stemplayer-js-controls-waveform-color`        |
| `--stemplayer-js-controls-waveform-progress-color` |


# stemplayer-js-stem

A component to render a single stem

## Properties

| Property            | Attribute           | Modifiers | Type      | Description                        |
|---------------------|---------------------|-----------|-----------|------------------------------------|
| `currentPct`        | `currentPct`        |           | `number`  |                                    |
| `duration`          | `duration`          |           | `number`  | Override the duration of the track |
| `label`             | `label`             |           | `string`  | The label to display               |
| `muted`             | `muted`             |           | `boolean` |                                    |
| `peaks`             |                     | readonly  | `array`   |                                    |
| `solo`              | `solo`              |           | `boolean` |                                    |
| `src`               | `src`               |           | `string`  | The url of the audio file          |
| `volume`            | `volume`            |           | `number`  | Set the volume                     |
| `waveColor`         | `waveColor`         |           | `string`  | The colour of the waveform         |
| `waveProgressColor` | `waveProgressColor` |           | `string`  | The wave progress colour           |
| `waveform`          | `waveform`          |           | `string`  | The url of the waveform file       |

## Methods

| Method   | Type                               |
|----------|------------------------------------|
| `load`   | `(controller: any): Promise<void>` |
| `unload` | `(): void`                         |

## Events

| Event             | Type                |
|-------------------|---------------------|
| `stem:load:end`   |                     |
| `stem:load:error` | `CustomEvent<any>`  |
| `stem:load:start` |                     |
| `stem:solo`       | `CustomEvent<this>` |
| `stem:unsolo`     | `CustomEvent<this>` |
