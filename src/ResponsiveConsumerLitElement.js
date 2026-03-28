import { LitElement } from 'lit';
import { ResponsiveConsumerMixin } from './mixins/ResponsiveConsumerMixin.js';
import { PlayerStateConsumerMixin } from './mixins/PlayerStateConsumerMixin.js';

/**
 * LitElement that consumes displayMode and playerState from a parent provider via context.
 * Use this for child components instead of ResponsiveLitElement.
 */
export class ResponsiveConsumerLitElement extends PlayerStateConsumerMixin(
  ResponsiveConsumerMixin(LitElement),
) {}
