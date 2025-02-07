import { editingState } from 'app/development/editingState';
import {
    CANVAS_HEIGHT, CANVAS_WIDTH, MAX_SPIRIT_RADIUS,
    FADE_IN_DURATION, FADE_OUT_DURATION,
    CIRCLE_WIPE_IN_DURATION, CIRCLE_WIPE_OUT_DURATION, MUTATE_DURATION,
} from 'app/gameConstants';
import { renderAreaLighting, renderSurfaceLighting, updateLightingCanvas, updateWaterSurfaceCanvas } from 'app/render/areaLighting';
import { renderHeroEyes, renderHeroShadow } from 'app/renderActor';
import { drawFrame } from 'app/utils/animations';
import { createCanvasAndContext, drawCanvas } from 'app/utils/canvas';

import { AreaInstance, AreaLayer, AreaLayerDefinition, EffectInstance, ObjectInstance, GameState } from 'app/types';

// This is the max size of the s
const [spiritCanvas, spiritContext] = createCanvasAndContext(MAX_SPIRIT_RADIUS * 2, MAX_SPIRIT_RADIUS * 2);

//let spiritCanvasRadius: number;
export function updateSpiritCanvas(state: GameState, radius: number): void {
    //if (radius === spiritCanvasRadius) {
    //    return;
    //}
    //spiritCanvasRadius = radius;
    const spiritAlpha = 0.2 + 0.8 * radius / MAX_SPIRIT_RADIUS;
    const x = spiritCanvas.width / 2;
    const y = spiritCanvas.height / 2
    const area = state.alternateAreaInstance;
    spiritContext.save();
        spiritContext.clearRect(0, 0, spiritCanvas.width, spiritCanvas.height);
        const gradient = spiritContext.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        spiritContext.fillStyle = 'white';
        spiritContext.globalAlpha = spiritAlpha;
        spiritContext.fillStyle = gradient;
        spiritContext.beginPath();
        spiritContext.arc(x, y, radius, 0, 2 * Math.PI);
        spiritContext.fill();
        spiritContext.translate(
            -(state.hero.x + state.hero.w / 2 - state.camera.x - spiritCanvas.width / 2) | 0,
            -(state.hero.y - state.camera.y - spiritCanvas.height / 2) | 0
        );
        spiritContext.globalAlpha = 1;
        spiritContext.globalCompositeOperation = 'source-atop';
        renderAreaBackground(spiritContext, state, area);
        renderAreaObjectsBeforeHero(spiritContext, state, area);
        spiritContext.save();
            translateContextForAreaAndCamera(spiritContext, state, area);
            renderHeroEyes(spiritContext, state, state.hero);
        spiritContext.restore();
        renderAreaObjectsAfterHero(spiritContext, state, area);
        renderAreaForeground(spiritContext, state, area);
        // renderForegroundObjects(spiritContext, state, area);
    spiritContext.restore();
    if (state.zone.surfaceKey && !area.definition.isSpiritWorld) {
        spiritContext.save();
            spiritContext.globalCompositeOperation = 'source-atop';
            spiritContext.globalAlpha = 0.6;
            spiritContext.fillStyle = 'blue';
            spiritContext.fillRect(0, 0, spiritCanvas.width, spiritCanvas.height);
        spiritContext.restore();
    }
}

function applyScreenShakes(context: CanvasRenderingContext2D, state: GameState) {
    context.save();
    for (const screenShake of state.screenShakes) {
        const t = state.fieldTime - screenShake.startTime;
        // If endTime is falsey, p stays at 1 the entire time.
        const p = screenShake.endTime
            ? ( 1 - t / (screenShake.endTime - screenShake.startTime))
            : 1;
        const amplitude = p * Math.sin(t / 20);
        context.translate(screenShake.dx * amplitude, screenShake.dy * amplitude);
    }
}

function removeScreenShakes(context: CanvasRenderingContext2D, state: GameState) {
    context.restore();
}

export function renderStandardFieldStack(context: CanvasRenderingContext2D, state: GameState, renderHero: boolean = null): void {
    applyScreenShakes(context, state);
        renderField(context, state, renderHero);
        renderSurfaceLighting(context, state, state.areaInstance);
        renderFieldForeground(context, state, state.areaInstance, state.nextAreaInstance);
        renderWaterOverlay(context, state);
        renderHeatOverlay(context, state, state.areaInstance);
        renderSpiritOverlay(context, state);
        renderAreaLighting(context, state, state.areaInstance, state.nextAreaInstance);
    removeScreenShakes(context, state);
}
export function renderStandardFieldStackWithoutWaterOverlay(context: CanvasRenderingContext2D, state: GameState, renderHero: boolean = null): void {
    renderField(context, state, renderHero);
    renderSurfaceLighting(context, state, state.areaInstance);
    renderFieldForeground(context, state, state.areaInstance, state.nextAreaInstance);
    renderSpiritOverlay(context, state);
    renderAreaLighting(context, state, state.areaInstance, state.nextAreaInstance);
}

export function translateContextForAreaAndCamera(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance): void {
    context.translate((-state.camera.x + area.cameraOffset.x) | 0, (-state.camera.y + area.cameraOffset.y) | 0);
}

export function checkToRedrawTiles(area: AreaInstance) {
    if (editingState.isEditing) {
        const w = 16, h = 16;
        for (let y = 0; y < area.h; y++) {
            for (let x = 0; x < area.w; x++) {
                if (!area.tilesDrawn?.[y]?.[x]) {
                    area.context.clearRect(x * w, y * h, w, h);
                    if (area.foregroundContext) {
                        area.foregroundContext.clearRect(x * w, y * h, w, h);
                    }
                }
            }
        }
    }
    area.layers.map((layer, index) => renderLayer(area, layer, area.definition.parentDefinition?.layers?.[index]));
    for (let y = 0; y < area.h; y++) {
        if (!area.tilesDrawn[y]) {
            area.tilesDrawn[y] = [];
        }
        for (let x = 0; x < area.w; x++) {
            area.tilesDrawn[y][x] = true;
        }
    }
    area.checkToRedrawTiles = false;
}


function updateObjectsToRender(this: void, state: GameState, area: AreaInstance) {
    if (!area) {
        return;
    }
    area.objectsToRender = [];
    for (const object of [...area?.objects || [], ...area?.effects || []]) {
        for (const part of [object, ...(object.getParts?.(state) || [])]) {
            // Invisible objects are not rendered unless the hero has true sight.
            if (!editingState.isEditing && !state.hero.passiveTools.trueSight && object.definition?.isInvisible) {
                continue;
            }
            if (part.render || part.renderShadow || part.renderForeground) {
                area.objectsToRender.push(part);
                if (part.getYDepth) {
                    part.yDepth = part.getYDepth();
                } else if (part.getHitbox) {
                    const hitbox = part.getHitbox();
                    part.yDepth = hitbox.y + hitbox.h;
                } else {
                    part.yDepth = part.y;
                }
            }
        }
    }
}

export function renderField(
    context: CanvasRenderingContext2D,
    state: GameState,
    shouldRenderHero: boolean = null
): void {
    updateObjectsToRender(state, state.areaInstance);
    updateObjectsToRender(state, state.alternateAreaInstance);
    updateObjectsToRender(state, state.nextAreaInstance);
    if (editingState.isEditing) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    // Update any background tiles that have changed.
    if (state.areaInstance.checkToRedrawTiles) {
        checkToRedrawTiles(state.areaInstance);
        updateLightingCanvas(state.areaInstance);
        if (state.underwaterAreaInstance) {
            updateWaterSurfaceCanvas(state);
        }
    }
    if (state.alternateAreaInstance.checkToRedrawTiles) {
        checkToRedrawTiles(state.alternateAreaInstance);
        updateLightingCanvas(state.alternateAreaInstance);
    }
    if (state.nextAreaInstance?.checkToRedrawTiles) {
        checkToRedrawTiles(state.nextAreaInstance);
        updateLightingCanvas(state.nextAreaInstance);
    }

    // Draw the field, enemies, objects and hero.
    renderAreaBackground(context, state, state.areaInstance);
    renderAreaBackground(context, state, state.nextAreaInstance);
    renderAreaObjectsBeforeHero(context, state, state.areaInstance);
    renderAreaObjectsBeforeHero(context, state, state.nextAreaInstance);
    if (shouldRenderHero === true || (shouldRenderHero !== false && state.hero.area === state.areaInstance)) {
        renderHero(context, state);
    }

    renderAreaObjectsAfterHero(context, state, state.areaInstance);
    renderAreaObjectsAfterHero(context, state, state.nextAreaInstance);
}

export function renderHero(context: CanvasRenderingContext2D, state: GameState) {
    context.save();
        translateContextForAreaAndCamera(context, state, state.areaInstance);
        state.hero.render(context, state);
    context.restore();
}

export function renderFieldForeground(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance, nextArea?: AreaInstance) {
    renderAreaForeground(context, state, area);
    if (nextArea) {
        renderAreaForeground(context, state, nextArea);
    }
    renderForegroundObjects(context, state, area);
    if (nextArea) {
        renderForegroundObjects(context, state, nextArea);
    }
}

export function renderWaterOverlay(context: CanvasRenderingContext2D, state: GameState) {
    if (!editingState.isEditing && state.zone.surfaceKey && !state.areaInstance.definition.isSpiritWorld && state.transitionState?.type !== 'surfacing') {
        context.save();
            context.globalAlpha = 0.6;
            context.fillStyle = 'blue';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.restore();
    }
}
export function renderHeatOverlay(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance) {
    if (!editingState.isEditing && state.hotLevel > 0) {
        context.save();
            context.globalAlpha = 0.4 * state.hotLevel;
            context.fillStyle = 'red';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.restore();
    }
}

export function renderSpiritOverlay(context: CanvasRenderingContext2D, state: GameState) {
    if (state.hero.spiritRadius > 0) {
        context.save();
        context.globalAlpha = 0.6 * state.hero.spiritRadius / MAX_SPIRIT_RADIUS;
        context.fillStyle = '#888';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.restore();
        updateSpiritCanvas(state, state.hero.spiritRadius);
        context.drawImage(spiritCanvas,
            0, 0, spiritCanvas.width, spiritCanvas.height,
            (state.hero.x + state.hero.w / 2 - spiritCanvas.width / 2
            - state.camera.x + state.areaInstance.cameraOffset.x) | 0,
            (state.hero.y - spiritCanvas.height / 2
             - state.camera.y + state.areaInstance.cameraOffset.y) | 0,
            spiritCanvas.width, spiritCanvas.height
        );
    }
}

// Fully renders an area to a canvas, but with no state effects like spirit sight.
// This is used during the transition to and from the spirit world.
export function renderArea(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance, renderHero: boolean = null): void {
    updateObjectsToRender(state, area);
    // Update any background tiles that have changed.
    if (area.checkToRedrawTiles) {
        checkToRedrawTiles(area);
        updateLightingCanvas(area);
    }
    // Draw the field, enemies, objects and hero.
    renderAreaBackground(context, state, area);
    renderAreaObjectsBeforeHero(context, state, area);
    if (renderHero === true || (renderHero !== false && state.hero.area === area)) {
        context.save();
            translateContextForAreaAndCamera(context, state, area);
            state.hero.render(context, state);
        context.restore();
    }
    renderAreaObjectsAfterHero(context, state, area);
    renderAreaForeground(context, state, area);
}

export function renderAreaBackground(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance): void {
    if (!area) {
        return;
    }
    context.save();
        translateContextForAreaAndCamera(context, state, area);
        const source = {
            x: (state.camera.x - area.cameraOffset.x) | 0,
            y: (state.camera.y - area.cameraOffset.y) | 0,
            w: CANVAS_WIDTH,
            h: CANVAS_HEIGHT,
        }
        const target = {
            x: (state.camera.x - area.cameraOffset.x) | 0,
            y: (state.camera.y - area.cameraOffset.y) | 0,
            w: CANVAS_WIDTH,
            h: CANVAS_HEIGHT,
        }
        drawCanvas(context, area.canvas, source, target);
        for (const object of area.objectsToRender) {
            if (object.drawPriority === 'background' || object.getDrawPriority?.(state) === 'background') {
                object.render?.(context, state);
            }
        }
    context.restore();
}

export function renderAreaForeground(context: CanvasRenderingContext2D, state: GameState, area: AreaInstance): void {
    if (!area?.foregroundCanvas) {
        return;
    }
    context.save();
        translateContextForAreaAndCamera(context, state, area);
        const source = {
            x: (state.camera.x - area.cameraOffset.x) | 0,
            y: (state.camera.y - area.cameraOffset.y) | 0,
            w: CANVAS_WIDTH,
            h: CANVAS_HEIGHT,
        }
        const target = {
            x: (state.camera.x - area.cameraOffset.x) | 0,
            y: (state.camera.y - area.cameraOffset.y) | 0,
            w: CANVAS_WIDTH,
            h: CANVAS_HEIGHT,
        }
        drawCanvas(context, area.foregroundCanvas, source, target);
    context.restore();
    renderForegroundObjects(context, state, area);
}

export function renderAreaObjectsBeforeHero(
    context: CanvasRenderingContext2D,
    state: GameState,
    area: AreaInstance,
    doNotTranslate: boolean = false,
): void {
    if (!area) {
        return;
    }
    context.save();
        if (!doNotTranslate) {
            translateContextForAreaAndCamera(context, state, area);
        }
        if (area === state.areaInstance && !editingState.isEditing) {
            renderHeroShadow(context, state, state.hero);
        } else if (state.transitionState?.type === 'mutating' && area === state.transitionState.nextAreaInstance) {
            renderHeroShadow(context, state, state.hero);
        }
        // Render shadows before anything else.
        for (const object of area.objectsToRender) {
            if (object.renderShadow) {
                object.renderShadow(context, state);
            }
        }
        const spriteObjects: (EffectInstance | ObjectInstance)[] = [];
        // Currently the jumping down logic uses hero y value to simulate a z value.
        // Because of this, to render the hero in the correct order we need to pretend the
        // y value is greater than it actually is. Otherwise they will be rendered behind
        // things like door frames that they should be jumping in front of.
        const heroYDepth = (state.hero.action === 'jumpingDown' && state.hero.d === 'down')
            ? state.hero.y + 48 : state.hero.y + 16;
        for (const object of area.objectsToRender) {
            if ((object.drawPriority === 'sprites' || object.getDrawPriority?.(state) === 'sprites')
                && object.yDepth <= heroYDepth
            ) {
                if (object.render) {
                    spriteObjects.push(object);
                }
            }
        }
        spriteObjects.sort((A, B) => A.yDepth - B.yDepth);
        for (const objectOrEffect of spriteObjects) {
            objectOrEffect.render(context, state);
        }
    context.restore();
}

export function renderAreaObjectsAfterHero(
    context: CanvasRenderingContext2D,
    state: GameState,
    area: AreaInstance,
    doNotTranslate: boolean = false,
): void {
    if (!area) {
        return;
    }
    context.save();
        if (!doNotTranslate) {
            translateContextForAreaAndCamera(context, state, area);
        }
        const spriteObjects: (EffectInstance | ObjectInstance)[] = [];
        // Currently the jumping down logic uses hero y value to simulate a z value.
        // Because of this, to render the hero in the correct order we need to pretend the
        // y value is greater than it actually is. Otherwise they will be rendered behind
        // things like door frames that they should be jumping in front of.
        const heroYDepth = (state.hero.action === 'jumpingDown' && state.hero.d === 'down')
            ? state.hero.y + 48 : state.hero.y + 16;
        for (const object of area.objectsToRender) {
            if ((object.drawPriority === 'sprites' || object.getDrawPriority?.(state) === 'sprites')
                && (object.yDepth) > heroYDepth
            ) {
                if (object.render) {
                    spriteObjects.push(object);
                }
            }
        }
        // Sprite objects are rendered in order of their y positions.
        spriteObjects.sort((A, B) => A.yDepth - B.yDepth);
        for (const objectOrEffect of spriteObjects) {
            objectOrEffect.render(context, state);
        }
    context.restore();
}

export function renderForegroundObjects(
    context: CanvasRenderingContext2D,
    state: GameState,
    area: AreaInstance,
    doNotTranslate: boolean = false,
): void {
    if (!area) {
        return;
    }
    context.save();
        if (!doNotTranslate) {
            translateContextForAreaAndCamera(context, state, area);
        }
        const foregroundObjects: (EffectInstance | ObjectInstance)[] = [];
        for (const object of area.objectsToRender) {
            if (object.renderForeground) {
                foregroundObjects.push(object);
            } else {
                const drawPriority = object.drawPriority || object.getDrawPriority?.(state);
                if (!drawPriority || drawPriority === 'foreground') {
                    foregroundObjects.push(object);
                }
            }
        }
        for (const object of foregroundObjects) {
            if (object.renderForeground) {
                object.renderForeground(context, state);
            } else {
                object.render?.(context, state);
            }
        }
        state.hero.renderForeground?.(context, state);
    context.restore();
}

const [maskCanvas, maskContext] = createCanvasAndContext(16, 16);
export function renderLayer(area: AreaInstance, layer: AreaLayer, parentLayer: AreaLayerDefinition): void {
    // Create foreground canvas only as needed.
    const isForeground = (layer.definition.drawPriority ?? layer.definition.key) === 'foreground';
    if (isForeground && !area.foregroundContext) {
        [area.foregroundCanvas, area.foregroundContext] = createCanvasAndContext(
            16 * layer.definition.grid.w,
            16 * layer.definition.grid.h,
        );
    }
    const context = isForeground ? area.foregroundContext : area.context;
    const w = 16, h = 16;
    context.save();
    if (editingState.isEditing && editingState.selectedLayerKey !== layer.key) {
        if (layer.definition.visibilityOverride === 'fade') {
            context.globalAlpha *= 0.3;
        } else if (editingState.selectedLayerKey) {
            context.globalAlpha *= 0.5;
        }
    }
    for (let y = 0; y < layer.h; y++) {
        if (!area.tilesDrawn[y]) {
            area.tilesDrawn[y] = [];
        }
        for (let x = 0; x < layer.w; x++) {
            if (area.tilesDrawn[y][x]) {
                continue;
            }
            let tile = layer.tiles[y][x];
            const maskTile = layer.maskTiles?.[y]?.[x];
            context.save();
            if (editingState.isEditing) {
                if (tile?.behaviors?.editorTransparency) {
                    context.globalAlpha *= tile.behaviors.editorTransparency;
                }
            }
            if (maskTile) {
                // Create the masked tile to draw underneath the mask frame.
                if (tile) {
                    maskContext.clearRect(0, 0, 16, 16);
                    maskContext.globalCompositeOperation = 'source-over';
                    drawFrame(maskContext, maskTile.behaviors.maskFrame, {x: 0, y: 0, w: 16, h: 16});
                    maskContext.globalCompositeOperation = 'source-in';
                    drawFrame(maskContext, tile.frame, {x: 0, y: 0, w: 16, h: 16});
                    // Draw the masked content first, then the mask frame on top.
                    //window['debugCanvas'](maskCanvas);
                    context.drawImage(maskCanvas, 0, 0, 16, 16, x * w, y * h, w, h);
                }
                drawFrame(context, maskTile.frame, {x: x * w, y: y * h, w, h});
            } else if (tile) {
                drawFrame(context, tile.frame, {x: x * w, y: y * h, w, h});
            }
            context.restore();
        }
    }
    context.restore();
}

export function renderTransition(context: CanvasRenderingContext2D, state: GameState) {
    if (state.transitionState.type === 'diving' || state.transitionState.type === 'surfacing') {
        const dz = state.transitionState.nextLocation.z - state.hero.z;
        if (state.transitionState.time <= CIRCLE_WIPE_OUT_DURATION) {
            context.fillStyle = 'black';
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            if (!state.transitionState.patternCanvas) {
                const [patternCanvas, patternContext] = createCanvasAndContext(CANVAS_WIDTH, CANVAS_HEIGHT);
                state.transitionState.patternCanvas = patternCanvas;
                renderArea(patternContext, state, state.transitionState.nextAreaInstance, false);
                if (state.transitionState.type === 'diving') {
                    patternContext.save();
                        translateContextForAreaAndCamera(patternContext, state, state.transitionState.nextAreaInstance);
                        renderHeroShadow(patternContext, state, state.hero, true);
                    patternContext.restore();
                    renderAreaLighting(patternContext, state, state.transitionState.nextAreaInstance);
                    renderSurfaceLighting(patternContext, state, state.transitionState.nextAreaInstance);
                }
                state.transitionState.pattern = context.createPattern(state.transitionState.patternCanvas, 'repeat');
            }
            const p = Math.min(1, state.transitionState.time / CIRCLE_WIPE_OUT_DURATION);
            if (state.transitionState.type === 'surfacing') {
                context.save();
                    context.translate(0, dz + 24);
                    renderStandardFieldStackWithoutWaterOverlay(context, state, false);
                context.restore();
                context.save();
                    translateContextForAreaAndCamera(context, state, state.transitionState.nextAreaInstance);
                    state.hero.render(context, state);
                context.restore();
                context.save();
                    context.globalAlpha *= 0.6;
                    // This needs to match the styles we use for rendering underwater areas.
                    context.fillStyle = 'blue';
                    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.restore();
                context.save();
                    context.globalAlpha *= p * p;
                    context.translate(0, dz);
                    context.fillStyle = state.transitionState.pattern;
                    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.restore();
                context.save();
                    context.globalAlpha *= p * p;
                    translateContextForAreaAndCamera(context, state, state.transitionState.nextAreaInstance);
                    state.hero.render(context, state);
                context.restore();
            } else {
                context.save();
                    context.translate(0, dz);
                    context.fillStyle = state.transitionState.pattern;
                    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.restore();
                context.save();
                    translateContextForAreaAndCamera(context, state, state.transitionState.nextAreaInstance);
                    state.hero.render(context, state);
                context.restore();
                context.save();
                    context.globalAlpha *= 0.6;
                    // This needs to match the styles we use for rendering underwater areas.
                    context.fillStyle = 'blue';
                    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.restore();
                context.save();
                    context.translate(0, dz - 24);
                    context.globalAlpha *= (1 - p) * (1 - p);
                    renderStandardFieldStackWithoutWaterOverlay(context, state, false);
                context.restore();
                context.save();
                    context.globalAlpha *= (1 - p) * (1 - p);
                    translateContextForAreaAndCamera(context, state, state.transitionState.nextAreaInstance);
                    state.hero.render(context, state);
                context.restore();
            }
        } else {
            context.save();
                translateContextForAreaAndCamera(context, state, state.areaInstance);
                context.fillStyle = state.transitionState.pattern;
                context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            context.restore();
        }
        renderAreaLighting(context, state, state.areaInstance);
        context.save();
            context.translate(0, dz + 24);
            renderSurfaceLighting(context, state, state.areaInstance);
        context.restore();
        return;
    } else if (state.transitionState.type === 'mutating') {
        if (!state.transitionState.nextAreaInstance) {
            console.error('missing next area instance for mutating');
            return;
        }
        if (!state.transitionState.patternCanvas) {
            const [patternCanvas, patternContext] = createCanvasAndContext(CANVAS_WIDTH, CANVAS_HEIGHT);
            state.transitionState.patternCanvas = patternCanvas;
            state.transitionState.patternContext = patternContext;
            renderStandardFieldStack(patternContext, state);
            //patternContext.drawImage(mainCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            //state.transitionState.pattern = context.createPattern(state.transitionState.patternCanvas, 'repeat');
        }
        if (!state.transitionState.underCanvas) {
            const [underCanvas, underContext] = createCanvasAndContext(CANVAS_WIDTH, CANVAS_HEIGHT);
            state.transitionState.underCanvas = underCanvas;
            const area = state.transitionState.nextAreaInstance;
            updateObjectsToRender(state, area);
            // Update any background tiles that have changed.
            if (area.checkToRedrawTiles) {
                checkToRedrawTiles(area);
                updateLightingCanvas(area);
                if (state.underwaterAreaInstance) {
                    updateWaterSurfaceCanvas(state);
                }
            }
            // Draw the field, enemies, objects and hero.
            renderAreaBackground(underContext, state, area);
            renderAreaObjectsBeforeHero(underContext, state, area);
            underContext.save();
                translateContextForAreaAndCamera(underContext, state, area);
                state.hero.render(underContext, state);
            underContext.restore();
            renderAreaObjectsAfterHero(underContext, state, area);
            renderSurfaceLighting(underContext, state, area);
            renderFieldForeground(underContext, state, area);
            renderHeatOverlay(underContext, state, area);
            renderAreaLighting(underContext, state, area);
        }
        /*const offsets = [0, 4, 2, 6, 1, 5, 3, 7];
        if (state.transitionState.time > 0
            && state.transitionState.time % 100 === 0
            && state.transitionState.time / 100 <= offsets.length
        ) {
            for (let y = offsets[state.transitionState.time / 100 - 1]; y < CANVAS_HEIGHT; y += 8) {
                state.transitionState.patternContext.clearRect(
                    0, y, CANVAS_WIDTH, 1
                );
            }
        }*/
        context.save();
            context.drawImage(state.transitionState.underCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            context.globalAlpha *= Math.max(0, (MUTATE_DURATION - state.transitionState.time) / MUTATE_DURATION);
            context.drawImage(state.transitionState.patternCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.restore();
        return;
    }

    if (state.transitionState.type === 'portal') {
        renderStandardFieldStack(context, state);
        if (!state.alternateAreaInstance) {
            return;
        }
        const x = state.hero.x + state.hero.w / 2 - state.camera.x + state.areaInstance.cameraOffset.x;
        const y = state.hero.y + 2 - state.camera.y + state.areaInstance.cameraOffset.y;
        if (state.transitionState.time <= CIRCLE_WIPE_OUT_DURATION) {
            if (!state.transitionState.patternCanvas) {
                const [patternCanvas, patternContext] = createCanvasAndContext(CANVAS_WIDTH, CANVAS_HEIGHT);
                state.transitionState.patternCanvas = patternCanvas;
                renderArea(patternContext, state, state.alternateAreaInstance, true);
                renderHeatOverlay(patternContext, state, state.alternateAreaInstance);
                state.transitionState.pattern = context.createPattern(state.transitionState.patternCanvas, 'repeat');
            }
            context.save();
                const p = state.transitionState.time / CIRCLE_WIPE_OUT_DURATION;
                const radius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 1.5 * Math.max(0, Math.min(1, p));
                context.fillStyle = state.transitionState.pattern;
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI);
                context.fill();
            context.restore();
        } else {
            context.save();
                translateContextForAreaAndCamera(context, state, state.areaInstance);
                context.fillStyle = state.transitionState.pattern;
                context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            context.restore();
        }
    } else if (state.transitionState.type === 'fade') {
        renderStandardFieldStack(context, state);
        if (state.transitionState.time <= FADE_OUT_DURATION) {
            context.save();
                const p = Math.min(1, 1.5 * state.transitionState.time / FADE_OUT_DURATION);
                context.globalAlpha = p;
                context.fillStyle = '#000';
                context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            context.restore();
        } else {
            context.save();
                const alpha = 1.5 - 1.5 * (state.transitionState.time - FADE_OUT_DURATION) / FADE_IN_DURATION;
                context.globalAlpha = Math.max(0, Math.min(1, alpha));
                context.fillStyle = '#000';
                context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            context.restore();
        }
    } else {
        renderStandardFieldStack(context, state);
        const x = state.hero.x + state.hero.w / 2 - state.camera.x;
        const y = state.hero.y + 2 - state.camera.y;
        if (state.transitionState.time <= CIRCLE_WIPE_OUT_DURATION) {
            context.save();
                const p = 1 - 1.5 * state.transitionState.time / CIRCLE_WIPE_OUT_DURATION;
                const radius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * Math.max(0, Math.min(1, p));
                context.fillStyle = '#000';
                context.beginPath();
                context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.arc(x, y, radius, 0, 2 * Math.PI, true);
                context.fill();
            context.restore();
        } else {
            context.save();
                const p = 1.5 * (state.transitionState.time - CIRCLE_WIPE_OUT_DURATION) / CIRCLE_WIPE_IN_DURATION - 0.5;
                const radius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * Math.max(0, Math.min(1, p));
                context.fillStyle = '#000';
                context.beginPath();
                context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                context.arc(x, y, radius, 0, 2 * Math.PI, true);
                context.fill();
            context.restore();
        }
    }
}
