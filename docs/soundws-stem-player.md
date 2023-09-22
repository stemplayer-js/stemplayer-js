# soundws-stem-player

The main stem player web-component.

## Properties

| Property          | Attribute          | Modifiers | Type                                            | Default   | Description                                      |
|-------------------|--------------------|-----------|-------------------------------------------------|-----------|--------------------------------------------------|
| `accentColor`     | `accent-color`     |           |                                                 |           | The accent color of the component. Accent color determines for example the "hover" background of buttons. |
| `autoplay`        | `autoplay`         |           |                                                 | false     | Whether to (attempt) autoplay                    |
| `backgroundColor` | `background-color` |           |                                                 |           | The background color of the component            |
| `color`           | `color`            |           |                                                 |           | The text color of the component                  |
| `controls`        |                    | readonly  | `Element \| undefined`                          |           | Gets the controls component                      |
| `currentTime`     |                    |           | `number`                                        |           | Set the curentTime of playback, seeking to that time. |
| `duration`        | `duration`         |           | `number`                                        |           | overrides the duration                           |
| `fontFamily`      | `font-family`      |           |                                                 |           | The CSS font family                              |
| `fontSize`        | `font-size`        |           |                                                 |           | The font-size of the component                   |
| `isLoading`       | `isLoading`        |           | `boolean`                                       |           |                                                  |
| `loadingIcon`     | `loading-icon`     |           | `"loading"\|""`                                 | "loading" | The loading to use when the player goes into a "loading" state. |
| `loop`            | `loop`             |           | `boolean`                                       | false     | overrides the duration                           |
| `maxHeight`       | `max-height`       |           | `string`                                        |           | Limits the height of the "body" slot, making that section scrollable |
| `pct`             |                    |           | `number`                                        |           | Sets the currentTime to a pct of total duration, seeking to that time |
| `rowHeight`       | `row-height`       |           |                                                 |           | The height of each row Each stem will occupy one row. |
| `sampleRate`      | `sample-rate`      |           | `number`                                        | 22050     | The sample rate used for instantiating the audioContext |
| `state`           |                    | readonly  | `{ state: any; currentTime: any; stems: any; }` |           | Exports the current state of the player          |
| `stems`           |                    | readonly  |                                                 |           |                                                  |

## Methods

| Method  | Type                | Description    |
|---------|---------------------|----------------|
| `pause` | `(): Promise<void>` | Pause playback |
| `play`  | `(): Promise<void>` | Start playback |

## Events

| Event           | Description                                      |
|-----------------|--------------------------------------------------|
| `end`           | Fires when the player reaches the end of the playback |
| `loading-end`   | Fires when the player completes loading data     |
| `loading-start` | Fires when the player starts loading data        |
| `pause`         | Fires when the player pauses playback            |
| `seek`          | Fires when the player seeks                      |
| `start`         | Fires when the player starts playing             |
| `timeupdate`    | Fires the player progresses                      |

## Slots

| Name     | Description             |
|----------|-------------------------|
|          | The default slot        |
| `footer` | The default slot        |
| `header` | The slot names "header" |

## CSS Custom Properties

| Property                                | Default                                          |
|-----------------------------------------|--------------------------------------------------|
| `--sws-stemsplayer-accent-color`        | "rgb(1, 164, 179)"                               |
| `--sws-stemsplayer-bg-color`            | "black"                                          |
| `--sws-stemsplayer-color`               | "rgb(220, 220, 220)"                             |
| `--sws-stemsplayer-font-family`         | "'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif" |
| `--sws-stemsplayer-font-size`           | "16px"                                           |
| `--sws-stemsplayer-row-height`          | "60px"                                           |
| `--sws-stemsplayer-wave-color`          |                                                  |
| `--sws-stemsplayer-wave-pixel-ratio`    | 2                                                |
| `--sws-stemsplayer-wave-progress-color` |                                                  |


# soundws-stem-player-controls

## Properties

| Property            | Attribute             | Type      | Description                                      |
|---------------------|-----------------------|-----------|--------------------------------------------------|
| `backgroundColor`   | `background-color`    |           | The elements background color                    |
| `color`             | `color`               |           | Text color                                       |
| `controller`        | `controller`          | `object`  |                                                  |
| `currentPct`        | `currentPct`          | `number`  |                                                  |
| `currentTime`       | `currentTime`         | `number`  |                                                  |
| `displayMode`       | `displayMode`         | `string`  | The displayMode determines normal or small screen rendering |
| `duration`          | `duration`            | `number`  |                                                  |
| `isLoading`         | `isLoading`           | `boolean` |                                                  |
| `isPlaying`         | `isPlaying`           | `boolean` |                                                  |
| `label`             | `label`               | `string`  |                                                  |
| `peaks`             | `peaks`               | `array`   |                                                  |
| `rowHeight`         |                       |           | The rowHeight                                    |
| `waveColor`         | `wave-color`          | `string`  | The fill color of the waveform after the cursor. |
| `wavePixelRatio`    | `wave-pixel-ratio`    | `number`  | The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all. |
| `waveProgressColor` | `wave-progress-color` | `string`  | The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all. |

## Methods

| Method                   | Type                |
|--------------------------|---------------------|
| `handleSeek`             | `(pct: any): void`  |
| `handleSeeking`          | `(): Promise<void>` |
| `pause`                  | `(): void`          |
| `play`                   | `(): void`          |
| `recalculateDisplayMode` | `(): void`          |

## Events

| Event         |
|---------------|
| `pause-click` |
| `play-click`  |


# soundws-stem

A component to render a single stem

## Properties

| Property            | Attribute             | Modifiers | Type      | Description                                      |
|---------------------|-----------------------|-----------|-----------|--------------------------------------------------|
| `audioSrc`          | `audio-src`           |           |           | Set using raw audio url, which will automatically set the hls and waveform endpoints |
| `backgroundColor`   | `background-color`    |           |           | The background color of the component            |
| `clientHeight`      | `clientHeight`        |           | `number`  |                                                  |
| `color`             | `color`               |           |           | The text color of the component                  |
| `currentPct`        | `currentPct`          |           | `number`  |                                                  |
| `displayMode`       | `displayMode`         |           | `string`  |                                                  |
| `duration`          | `duration`            |           | `number`  |                                                  |
| `label`             | `label`               |           | `string`  |                                                  |
| `muted`             | `muted`               |           | `boolean` |                                                  |
| `peaks`             |                       | readonly  | `array`   |                                                  |
| `renderedDuration`  | `renderedDuration`    |           | `number`  |                                                  |
| `rowHeight`         |                       |           |           | The rowHeight                                    |
| `solo`              | `solo`                |           | `boolean` |                                                  |
| `src`               | `src`                 |           | `string`  |                                                  |
| `volume`            | `volume`              |           | `number`  | Set the volume                                   |
| `waveColor`         | `wave-color`          |           | `string`  | The fill color of the waveform after the cursor. |
| `wavePixelRatio`    | `wave-pixel-ratio`    |           | `number`  | The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all. |
| `waveProgressColor` | `wave-progress-color` |           | `string`  | The fill color of the part of the waveform behind the cursor. When progressColor and waveColor are the same the progress wave is not rendered at all. |
| `waveform`          | `waveform`            |           | `string`  |                                                  |

## Events

| Event                | Type                |
|----------------------|---------------------|
| `peaks`              | `CustomEvent<any>`  |
| `solo`               | `CustomEvent<this>` |
| `stem-loading-end`   |                     |
| `stem-loading-error` | `CustomEvent<any>`  |
| `stem-loading-start` |                     |
| `unsolo`             | `CustomEvent<this>` |

## CSS Custom Properties

| Property                                     | Default              |
|----------------------------------------------|----------------------|
| `--sws-stemsplayer-stem-bg-color`            | "black"              |
| `--sws-stemsplayer-stem-color`               | "rgb(220, 220, 220)" |
| `--sws-stemsplayer-stem-wave-color`          | "#AAA"               |
| `--sws-stemsplayer-stem-wave-pixel-ratio`    | 2                    |
| `--sws-stemsplayer-stem-wave-progress-color` | "rgb(0, 206, 224)"   |
