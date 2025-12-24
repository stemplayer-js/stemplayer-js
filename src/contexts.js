import { createContext } from '@lit/context';

/**
 * Context for cascading display mode from parent to children
 * Prevents each child component from recalculating responsive breakpoints
 */
export const displayModeContext = createContext('displayMode');
