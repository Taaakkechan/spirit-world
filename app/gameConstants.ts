// Update duration in milliseconds.
export const FRAME_LENGTH = 20;

// Dimensions of the canvas in canvas pixels.
export const CANVAS_WIDTH = 256;
export const CANVAS_HEIGHT = 224;
// Scale of canvas pixels relative to document pixels.
export const CANVAS_SCALE = 3;

// Dimensions of the game in document pixels.
export const DOM_WIDTH = CANVAS_WIDTH * CANVAS_SCALE;
export const DOM_HEIGHT = CANVAS_HEIGHT * CANVAS_SCALE;

export const KEY_THRESHOLD = FRAME_LENGTH;