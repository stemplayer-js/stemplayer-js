import { LitElement } from 'lit';
import { ResponsiveConsumerMixin } from './mixins/ResponsiveConsumerMixin.js';

/**
 * LitElement that consumes displayMode from a parent provider via context.
 * Use this for child components instead of ResponsiveLitElement.
 */
export class ResponsiveConsumerLitElement extends ResponsiveConsumerMixin(
  LitElement,
) {}
