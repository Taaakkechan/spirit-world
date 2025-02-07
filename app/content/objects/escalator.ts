import { objectHash } from 'app/content/objects/objectHash';
import { FRAME_LENGTH } from 'app/gameConstants';
import { moveActor } from 'app/moveActor';
import { drawFrameAt } from 'app/utils/animations';
import { directionMap } from 'app/utils/field';
import { createCanvasAndContext, debugCanvas } from 'app/utils/canvas';
import { allImagesLoaded, requireImage } from 'app/utils/images';
import { isObjectInsideTarget, pad } from 'app/utils/index';
import {
    AreaInstance, Direction, DrawPriority, Frame, FrameWithPattern, GameState,
    ObjectInstance, ObjectStatus, EscalatorDefinition, HitProperties, HitResult, TileBehaviors,
} from 'app/types';


//const woodenStairs: Frame = {image: requireImage('gfx/woodhousetilesarranged.png'), x: 224, y: 16, w: 16, h: 48};
// Middle wooden stair tile for escalator.
const woodenStairs: Frame = {image: requireImage('gfx/tiles/woodhousetilesarranged.png'), x: 224, y: 32, w: 16, h: 16};
const verticalBelt: Frame = {image: requireImage('gfx/tiles/woodhousetilesarranged.png'), x: 208, y: 96, w: 16, h: 16};
const [horizontalBeltCanvas, horizontalBeltContext] = createCanvasAndContext(16, 16);
const [verticalBeltCanvas, verticalBeltContext] = createCanvasAndContext(16, 16);
const [escalatorCanvas, escalatorContext] = createCanvasAndContext(16, 16);
const horizontalBelt: Frame = {image: horizontalBeltCanvas, x: 0, y: 0, w: 16, h: 16};
// Scale up all the images so that they look good moving quickly.
const createHorizontalBelt = async () => {
    await allImagesLoaded();
    horizontalBeltContext.save();
        horizontalBeltContext.translate(8, 8);
        horizontalBeltContext.rotate(Math.PI / 2);
        horizontalBeltContext.translate(-8, -8);
        drawFrameAt(horizontalBeltContext, verticalBelt, {x: 0, y: 0, w: 48, h: 48});
    horizontalBeltContext.restore();

    drawFrameAt(verticalBeltContext, verticalBelt, {x: 0, y: 0, w: 48, h: 48});
    verticalBelt.x = 0;
    verticalBelt.y = 0;
    verticalBelt.image = verticalBeltCanvas;

    drawFrameAt(escalatorContext, woodenStairs, {x: 0, y: 0, w: 48, h: 48});
    woodenStairs.x = 0;
    woodenStairs.y = 0;
    woodenStairs.image = escalatorCanvas;
}
createHorizontalBelt();
debugCanvas;//(beltCanvas);

export const escalatorStyles: {[key: string]: {[key in Direction]?: FrameWithPattern}} = {
    escalator: {
        up: woodenStairs,
        down: woodenStairs,
        left: woodenStairs,
        right: woodenStairs,
    },
    belt: {
        up: verticalBelt,
        down: verticalBelt,
        left: horizontalBelt,
        right: horizontalBelt,
    },
};

export class Escalator implements ObjectInstance {
    area: AreaInstance;
    animationTime: number = 0;
    behaviors: TileBehaviors;
    offsetX: number = 0;
    offsetY: number = 0;
    definition: EscalatorDefinition;
    drawPriority: DrawPriority = 'background';
    isObject = <const>true;
    isNeutralTarget = true;
    x: number;
    y: number;
    pattern: CanvasPattern;
    // 'normal' is running 'off' is stopped.
    speed: EscalatorDefinition['speed']
    status: ObjectStatus = 'normal';
    constructor(state: GameState, definition: EscalatorDefinition) {
        this.definition = definition;
        this.status = definition.status;
        this.x = this.definition.x;
        this.y = this.definition.y;
        this.speed = this.definition.speed;
    }
    onActivate(state: GameState) {
        this.status = 'normal';
    }
    onDeactivate(state: GameState) {
        this.status = 'off';
    }
    onHit(state: GameState, hit: HitProperties): HitResult {
        if (this.status === 'frozen' && hit.element === 'fire') {
            this.status = 'normal';
            delete this.behaviors;
        } else if (hit.element === 'ice') {
            this.status = 'frozen';
            this.behaviors = {
                slippery: true
            };
        }
        return {};
    }
    getHitbox(state: GameState) {
        return this.definition;
    }
    getHitboxForMovingObjects(state: GameState) {
        const hitbox = pad(this.definition, 8);
        if (this.definition.d === 'down' || this.definition.d === 'up') {
            hitbox.y -= 6;
            hitbox.h += 12;
        } else {
            hitbox.x -= 6;
            hitbox.w += 12;
        }
        return hitbox;
    }
    update(state: GameState) {
        this.animationTime += FRAME_LENGTH;
        const dx = directionMap[this.definition.d][0];
        const dy = directionMap[this.definition.d][1];
        let speed = (this.speed === 'slow') ? 1 : 3;
        if (this.status === 'normal') {
            this.offsetX += dx * speed;
            this.offsetY += dy * speed;
        }
        // If touching center of player, pull player in and push them south.

        for (const hero of [state.hero, ...state.hero.clones]) {
            if (hero.area !== this.area || hero.isInvisible || this.status !== 'normal') {
                continue;
            }
            const heroHitbox = hero.getHitbox(state);
            const touchingHero = isObjectInsideTarget(heroHitbox, this.getHitboxForMovingObjects(state))
                && hero.action !== 'roll' && hero.action !== 'preparingSomersault' && hero.z <= 0;
            if (this.speed === 'slow' && touchingHero) {
                moveActor(state, hero, speed * dx, speed * dy, {
                    canFall: true,
                    canJump: true,
                    canSwim: true,
                });
            } else if (this.speed === 'fast') {
                if (hero.actionTarget === this && !touchingHero) {
                    hero.actionTarget = null;
                    hero.actionDx = 0;
                    hero.actionDy = 0;
                    // Make the hero lose control briefly on exiting fast escalators.
                    hero.vx = dx;
                    hero.vy = dy;
                    hero.vz = 2;
                    // Use 'knockedHard' to allow transitioning to the next screen when necessary.
                    hero.action = 'knockedHard';
                    hero.isControlledByObject = false;
                    hero.safeD = hero.d;
                    hero.safeX = hero.x;
                    hero.safeY = hero.y;
                } else if (!hero.actionTarget && touchingHero) {
                    hero.actionTarget = this;
                    hero.action = null;
                    hero.actionDx = 0;
                    hero.actionDy = 0;
                }
                if (hero.actionTarget === this) {
                    hero.isControlledByObject = true;
                    speed = state.nextAreaInstance ? 0.75 : speed;
                    hero.actionDx = speed * dx;
                    hero.actionDy = speed * dy;
                    hero.x += hero.actionDx;
                    hero.y += hero.actionDy;
                }
            }
        }
    }
    render(context: CanvasRenderingContext2D, state: GameState) {
        const style = escalatorStyles[this.definition.style as keyof typeof escalatorStyles] || escalatorStyles.belt;
        const frame = style[this.definition.d];
        if (!frame) {
            debugger;
        }
        if (!frame.pattern ) {
            const [patternCanvas, patternContext] = createCanvasAndContext(frame.w, frame.h);
            drawFrameAt(patternContext, frame, {x: 0, y: 0});
            frame.pattern = context.createPattern(patternCanvas, 'repeat');
        }
        context.save();
            context.translate(this.offsetX, this.offsetY);
            context.fillStyle = frame.pattern;
            context.fillRect(this.x - this.offsetX, this.y - this.offsetY, this.definition.w, this.definition.h);
        context.restore();
        if (this.status === 'frozen') {
            context.save();
                context.globalAlpha *= 0.5;
                context.fillStyle = 'white';
                context.fillRect(this.x, this.y, this.definition.w, this.definition.h);
            context.restore();
        }
    }
}
objectHash.escalator = Escalator;
