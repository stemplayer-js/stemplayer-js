import { LitElement } from 'lit';
import { ResponsiveMixin } from './mixins/ResponsiveMixin.js';

export class ResponsiveLitElement extends ResponsiveMixin(LitElement) {}
