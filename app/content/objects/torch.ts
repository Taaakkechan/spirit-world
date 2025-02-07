//import { resetTileBehavior } from 'app/content/areas';
//import { allTiles } from 'app/content/tiles';
import { flameAnimation } from 'app/content/effects/flame';
import { objectHash } from 'app/content/objects/objectHash';
import { FRAME_LENGTH } from 'app/gameConstants';
import { hitTargets } from 'app/utils/field';
import { getObjectStatus, saveObjectStatus } from 'app/utils/objects';

import { drawFrameAt, getFrame } from 'app/utils/animations';

import {
    AreaInstance, GameState, HitProperties, HitResult, ObjectInstance,
    ObjectStatus, SimpleObjectDefinition, Rect, TileBehaviors,
} from 'app/types';

export class Torch implements ObjectInstance {
    area: AreaInstance;
    behaviors: TileBehaviors = {
        solid: true,
        low: true,
    };
    drawPriority: 'sprites' = 'sprites';
    definition: SimpleObjectDefinition = null;
    isObject = <const>true;
    isNeutralTarget = true;
    x: number;
    y: number;
    status: ObjectStatus = 'normal';
    animationTime = 0;
    appliedFireToTiles = false;
    constructor(state: GameState, definition: SimpleObjectDefinition) {
        this.definition = definition;
        this.behaviors = {...this.behaviors};
        this.x = definition.x;
        this.y = definition.y;
        this.status = this.definition.status;
        if (getObjectStatus(state, this.definition)) {
            this.status = 'active';
        }
        if (this.status === 'active') {
            this.behaviors.element = 'fire';
        }
    }
    getHitbox(state: GameState): Rect {
        return { x: this.x, y: this.y, w: 16, h: 16 };
    }
    onHit(state: GameState, hit: HitProperties): HitResult {
        if (this.status === 'active' && hit.element === 'ice') {
            this.status = 'normal';
            this.behaviors.element = null;
            this.appliedFireToTiles = false;
        } else if (this.status === 'normal' && hit.element === 'fire') {
            this.status = 'active';
            this.behaviors.element = 'fire';
        }
        return { hit: true, pierced: true, setElement: this.behaviors.element };
    }
    onActivate(state: GameState) {
        this.status = 'active';
        this.behaviors.element = 'fire';
    }
    applyFireToTiles(state: GameState) {
        hitTargets(state, this.area, {
            element: 'fire',
            hitCircle: {
                x: this.x + 8,
                y: this.y + 8,
                r: 36,
            },
            hitTiles: true,
        });
        /*const tx = (this.x / 16) | 0, ty = (this.y / 16) | 0;
        for(let dy = -2; dy <= 2; dy++) {
            for(let dx = -2; dx <= 2; dx++) {
                if (dx * dx + dy * dy >= 8) continue;
                let changed = false;
                for (const layer of this.area.layers) {
                    const tile = layer.tiles?.[ty+dy]?.[tx + dx];
                    const fireTile = tile?.behaviors?.elementTiles?.fire;
                    if (typeof fireTile !== 'undefined') {
                        layer.tiles[ty + dy][tx + dx] = layer.originalTiles[ty + dy][tx + dx] = allTiles[fireTile];
                        changed = true;
                    }
                }
                if (changed) {
                    this.area.checkToRedrawTiles = true;
                    if (this.area.tilesDrawn?.[ty + dy]?.[tx + dx]) {
                        this.area.tilesDrawn[ty + dy][tx + dx] = false;
                    }
                    resetTileBehavior(this.area, {x: tx + dx, y: ty + dy});
                }
            }
        }*/
        this.appliedFireToTiles = true;
    }
    update(state: GameState) {
        if (this.area && this.status === 'active' && !this.appliedFireToTiles) {
            saveObjectStatus(state, this.definition);
            this.applyFireToTiles(state);
        }
        this.animationTime += FRAME_LENGTH;
    }
    render(context: CanvasRenderingContext2D, state: GameState) {
        if (this.status !== 'normal' && this.status !== 'active') {
            return;
        }
        context.beginPath();
        context.rect(this.x, this.y, 16, 16);
        context.fillStyle = 'black';
        context.strokeStyle = '#888';
        context.fill();
        context.stroke();
        if (this.status === 'active') {
            const frame = getFrame(flameAnimation, this.animationTime);
            drawFrameAt(context, frame, {
                x: this.x,
                y: this.y - 4,
                w: frame.content.w,
                h: frame.content.h,
            });
        }
    }
}
objectHash.torch = Torch;
