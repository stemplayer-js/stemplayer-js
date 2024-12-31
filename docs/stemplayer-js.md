# stemplayer-js

A Stem Player web component

**Mixins:** ResponsiveMixin

## Properties

| Property           | Attribute            | Modifiers | Type                                             | Default | Description                                      |
|--------------------|----------------------|-----------|--------------------------------------------------|---------|--------------------------------------------------|
| `audioContext`     | `audioContext`       |           | `object`                                         |         | Inject a pre instantiated AudioContext           |
| `audioDuration`    | `audioDuration`      |           |                                                  |         |                                                  |
| `autoplay`         | `autoplay`           |           | `boolean`                                        | false   | Whether to (attempt) autoplay                    |
| `currentTime`      |                      |           | `number`                                         |         | Set the curentTime of playback, seeking to that time. |
| `destination`      | `destination`        |           | `object`                                         |         | Inject a pre instantiated destination for the audio context to use |
| `duration`         | `duration`           |           | `number`                                         |         | overrides the duration                           |
| `isLoading`        | `isLoading`          |           |                                                  |         |                                                  |
| `loop`             | `loop`               |           | `boolean`                                        | false   | Allows looping (experimental)                    |
| `noKeyboardEvents` | `no-keyboard-events` |           | `boolean`                                        | false   | Controls the player by keyboard events (e.g. space = start/pause) |
| `offset`           | `offset`             |           | `number`                                         |         | the offset                                       |
| `pct`              |                      |           | `number`                                         |         | Sets the currentTime to a pct of total duration, seeking to that time |
| `regionDuration`   | `regionDuration`     |           |                                                  |         |                                                  |
| `regionOffset`     | `regionOffset`       |           |                                                  |         |                                                  |
| `regions`          | `regions`            |           | `boolean`                                        | false   | Enable region selection                          |
| `slottedElements`  |                      | readonly  | `array`                                          |         |                                                  |
| `state`            |                      | readonly  | `{ state: any; currentTime: any; offset: any; duration: any; stems: { id: any; src: any; waveform: any; volume: any; muted: any; solo: any; }[]; }` |         | Exports the current state of the player          |
| `stemComponents`   |                      | readonly  | `array`                                          |         | Get the stem componenents                        |
| `zoom`             | `zoom`               |           | `number`                                         | 1       | Zoom waveform                                    |

## Methods

| Method                        | Type                    | Description    |
|-------------------------------|-------------------------|----------------|
| `#getLargeScreenTpl`          | `(): TemplateResult<1>` |                |
| `#getSmallScreenTpl`          | `(): TemplateResult<1>` |                |
| `#handleKeypress`             | `(e: any): void`        |                |
| `#loadStem`                   | `(e: any): void`        |                |
| `#onRegionChange`             | `(e: any): void`        |                |
| `#onRegionUpdate`             | `(e: any): void`        |                |
| `#onToggleLoop`               | `(): void`              |                |
| `#recalculatePixelsPerSecond` | `(): void`              |                |
| `destroy`                     | `(): void`              |                |
| `pause`                       | `(): any`               | Pause playback |
| `play`                        | `(): any`               | Start playback |

## Events

| Event           | Type                           | Description                                      |
|-----------------|--------------------------------|--------------------------------------------------|
| `end`           |                                | Fires when the player reaches the end of the playback |
| `loading-end`   |                                | Fires when the player completes loading data     |
| `loading-start` |                                | Fires when the player starts loading data        |
| `pause`         |                                | Fires when the player pauses playback            |
| `peaks`         | `CustomEvent<{ peaks: any; }>` |                                                  |
| `resize`        |                                |                                                  |
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

| Property                                    | Default                                          |
|---------------------------------------------|--------------------------------------------------|
| `--stemplayer-js-background-color`          | "black"                                          |
| `--stemplayer-js-brand-color`               | "rgb(1, 164, 179)"                               |
| `--stemplayer-js-color`                     | "rgb(220, 220, 220)"                             |
| `--stemplayer-js-font-family`               | "'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif" |
| `--stemplayer-js-font-size`                 | "16px"                                           |
| `--stemplayer-js-grid-base`                 | "1.5rem"                                         |
| `--stemplayer-js-max-height`                | "auto"                                           |
| `--stemplayer-js-progress-background-color` | "rgba(255, 255, 255, 1)"                         |
| `--stemplayer-js-progress-mix-blend-mode`   | "overlay"                                        |
| `--stemplayer-js-row-height`                | "4.5rem"                                         |
| `--stemplayer-js-waveform-bar-gap`          |                                                  |
| `--stemplayer-js-waveform-bar-width`        |                                                  |
| `--stemplayer-js-waveform-color`            |                                                  |
| `--stemplayer-js-waveform-pixel-ratio`      |                                                  |


# stemplayer-js-controls

A component to render a single stem

**Mixins:** WaveformHostMixin, ResponsiveMixin

## Properties

| Property      | Attribute     | Type      | Default          | Description                                      |
|---------------|---------------|-----------|------------------|--------------------------------------------------|
| `controls`    | `controls`    | `string`  | ["loop","label"] | The controls that are enables                    |
| `currentPct`  | `currentPct`  | `number`  |                  | The percentage of the current time               |
| `currentTime` | `currentTime` | `number`  |                  | The current time of playback                     |
| `duration`    | `duration`    | `number`  |                  | The duration of the track                        |
| `isPlaying`   | `isPlaying`   | `boolean` |                  | The playing state                                |
| `label`       | `label`       | `string`  |                  | The label to display                             |
| `loop`        | `loop`        | `boolean` |                  | Whether the loop is toggled on or off            |
| `peaks`       | `peaks`       | `object`  |                  | The peaks data that are to be used for displaying the waveform |

## Methods

| Method                  | Type                                             |
|-------------------------|--------------------------------------------------|
| `#getLargeScreenTpl`    | `(): TemplateResult<1>`                          |
| `#getSmallScreenTpl`    | `(): TemplateResult<1>`                          |
| `#toggleLoop`           | `(e: any): void`                                 |
| `computeWaveformStyles` | `(): { waveColor: string; progressColor: string; devicePixelRatio: number; barGap: number; barWidth: number; } \| { waveColor: string; progressColor: string; barWidth: string \| number; barGap: string \| number; pixelRatio: any; controlsWaveColor: any; controlsProgressColor: any; }` |
| `isControlEnabled`      | `(value: any): boolean`                          |

## Events

| Event              | Type                  |
|--------------------|-----------------------|
| `controls:loop`    | `CustomEvent<any>`    |
| `controls:pause`   |                       |
| `controls:play`    |                       |
| `controls:seek`    | `CustomEvent<number>` |
| `controls:seeking` | `CustomEvent<any>`    |
| `resize`           |                       |

## CSS Custom Properties

| Property                                    |
|---------------------------------------------|
| `--stemplayer-js-controls-background-color` |
| `--stemplayer-js-controls-color`            |


# stemplayer-js-stem

A component to render a single stem

**Mixins:** WaveformHostMixin, ResponsiveMixin

## Properties

| Property            | Attribute           | Modifiers | Type      | Default | Description                        |
|---------------------|---------------------|-----------|-----------|---------|------------------------------------|
| `currentPct`        | `currentPct`        |           | `number`  |         |                                    |
| `duration`          | `duration`          |           | `number`  |         | Override the duration of the track |
| `label`             | `label`             |           | `string`  |         | The label to display               |
| `muted`             | `muted`             |           | `boolean` |         |                                    |
| `peaks`             |                     | readonly  | `array`   |         |                                    |
| `row`               |                     | readonly  |           |         |                                    |
| `solo`              | `solo`              |           | `string`  | "off"   |                                    |
| `src`               | `src`               |           | `string`  |         | The url of the audio file          |
| `volume`            | `volume`            |           | `number`  |         | Set the volume                     |
| `waveColor`         | `waveColor`         |           | `string`  |         | The colour of the waveform         |
| `waveProgressColor` | `waveProgressColor` |           | `string`  |         | The wave progress colour           |
| `waveform`          | `waveform`          |           | `string`  |         | The url of the waveform file       |

## Methods

| Method                  | Type                                             | Description                                      |
|-------------------------|--------------------------------------------------|--------------------------------------------------|
| `computeWaveformStyles` | `(): { waveColor: string; progressColor: string; devicePixelRatio: number; barGap: number; barWidth: number; } \| { waveColor: string; progressColor: string; barWidth: string \| number; barGap: string \| number; pixelRatio: any; controlsWaveColor: any; controlsProgressColor: any; }` |                                                  |
| `load`                  | `(controller: any): Promise<void>`               |                                                  |
| `requestLoad`           | `(): void`                                       | When the src changes, trigger a request to reload the stem (in the context of the player) |
| `unload`                | `(): void`                                       |                                                  |

## Events

| Event               | Type               |
|---------------------|--------------------|
| `resize`            |                    |
| `stem:load:end`     |                    |
| `stem:load:error`   | `CustomEvent<any>` |
| `stem:load:request` |                    |
| `stem:load:start`   |                    |


# stemplayer-js-workspace

An area that represents the timeline providing functionality to select regions

**Mixins:** ResponsiveMixin

## Properties

| Property | Modifiers | Type                                             | Description                      |
|----------|-----------|--------------------------------------------------|----------------------------------|
| `state`  | readonly  | `{ left: number; width: number; offset: number; duration: number; }` | Gets the current selection state |

## Methods

| Method             | Type                                            |
|--------------------|-------------------------------------------------|
| `#handleClick`     | `(e: any): void`                                |
| `#onDeselectClick` | `(e: any): void`                                |
| `#onMouseDown`     | `(e: any): void`                                |
| `#onMouseMove`     | `(e: any): void`                                |
| `#onMouseUp`       | `(): void`                                      |
| `resolveOffsets`   | `(e: any): { offsetX: any; offsetWidth: any; }` |

## Events

| Event           | Type                                             |
|-----------------|--------------------------------------------------|
| `region:change` | `CustomEvent<{ left: number; width: number; offset: number; duration: number; }>` |
| `region:hover`  | `CustomEvent<{ left: number; width: number; offset: number; duration: number; }>` |
| `region:seek`   | `CustomEvent<number>`                            |
| `region:update` | `CustomEvent<{ left: number; width: number; offset: number; duration: number; }>` |
| `resize`        |                                                  |


# stemplayer-js-row

A component to render a single stem

## Properties

| Property       | Attribute     | Modifiers | Type                  | Description                                      |
|----------------|---------------|-----------|-----------------------|--------------------------------------------------|
| `displayMode`  | `displayMode` |           | `string`              |                                                  |
| `nonFlexWidth` |               | readonly  | `number \| undefined` | Returns the combined width of the non fluid (flex) containers |
