import { createAnimation, drawFrame } from 'app/utils/animations';
import { rectanglesOverlap } from 'app/utils/index';

import {
    FloorSwitchDefinition, GameState,
    ObjectInstance, ObjectStatus, ShortRectangle,
} from 'app/types';

const [upFrame, downFrame] = createAnimation('gfx/tiles/toggletiles.png', {w: 16, h: 16}, {cols: 2}).frames;

export class FloorSwitch implements ObjectInstance {
    drawPriority: 'background' = 'background';
    definition: FloorSwitchDefinition = null;
    x: number;
    y: number;
    status: ObjectStatus = 'normal';
    constructor(definition: FloorSwitchDefinition) {
        this.definition = definition;
        this.x = definition.x;
        this.y = definition.y;
    }
    getHitbox(state: GameState): ShortRectangle {
        return { x: this.x + 2, y: this.y + 2, w: 12, h: 12 };
    }
    isDepressed(state: GameState): boolean {
        const hitbox = this.getHitbox(state);
        if (rectanglesOverlap(state.hero, hitbox)) {
            return true;
        }
        for (const object of state.areaInstance.objects) {
            if (object === this || !object.getHitbox) {
                continue;
            }
            if (rectanglesOverlap(object.getHitbox(state), hitbox)) {
                return true;
            }
        }
        return false;
    }
    onToggle(state: GameState): void {
        if (this.status === 'active') {
            this.status = 'normal';
        } else {
            this.status = 'active';
        }
        // Don't apply the toggle effect on release unless toggleOnRelease is true.
        if (this.status === 'normal' && !this.definition.toggleOnRelease) {
            return;
        }
        for (const object of state.areaInstance.objects) {
            if (object.status === 'hiddenSwitch') {
                object.status = 'normal';
            }
            if (object.definition?.status === 'closedSwitch') {
                const newStatus = object.status === 'normal' ? 'closedSwitch' : 'normal';
                if (object.changeStatus) {
                    object.changeStatus(state, newStatus);
                } else {
                    object.status = newStatus;
                }
            }
        }
    }

    update(state: GameState) {
        if (this.status === 'active' && !this.isDepressed(state)) {
            this.onToggle(state);
        } else if (this.status === 'normal' && this.isDepressed(state)) {
            this.onToggle(state);
        }
    }
    render(context: CanvasRenderingContext2D, state: GameState) {
        if (this.status === 'active') {
            drawFrame(context, downFrame, {...downFrame, x: this.x, y: this.y});
        } else {
            drawFrame(context, upFrame, {...upFrame, x: this.x, y: this.y});
        }
    }
}