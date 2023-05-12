import { PlayerComponent } from './src/component/player-component';
import { ControlComponent } from './src/component/control-component';
import { StemComponent } from './src/component/stem-component';

window.customElements.define('soundws-stem-player', PlayerComponent);
window.customElements.define('soundws-stem-player-controls', ControlComponent);
window.customElements.define('soundws-stem', StemComponent);
