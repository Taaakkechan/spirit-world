import { addSparkleAnimation } from 'app/content/effects/animationEffect';
import { addEffectToArea, getAreaSize, removeEffectFromArea } from 'app/content/areas';
import { FRAME_LENGTH } from 'app/gameConstants';
import { createAnimation, drawFrameAt, getFrame } from 'app/utils/animations';
import { getDirection, hitTargets } from 'app/utils/field';
import { playSound } from 'app/utils/sounds';

import {
    AreaInstance, Direction, DrawPriority, EffectInstance, Frame, FrameAnimation,
    GameState, HitProperties, MagicElement,
} from 'app/types';

const upContent = {x: 5, y: 2, w: 6, h: 6};
const downContent = {x: 5, y: 8, w: 6, h: 6};
const leftContent = {x: 2, y: 5, w: 6, h: 6};
const rightContent = {x: 8, y: 5, w: 6, h: 6};

const dlAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: {x: 2, y: 8, w: 6, h: 6}}, {cols: 2});
const drAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: {x: 8, y: 8, w: 6, h: 6}}, {x: 2, cols: 2});
const urAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: {x: 8, y: 2, w: 6, h: 6}}, {x: 4, cols: 2});
const ulAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: {x: 2, y: 2, w: 6, h: 6}}, {x: 6, cols: 2});
const downAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: downContent}, {x: 8, cols: 2});
const rightAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: rightContent}, {x: 10, cols: 2});
const upAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: upContent}, {x: 12, cols: 2});
const leftAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: leftContent}, {x: 14, cols: 2});

const spinAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: {x: 5, y: 5, w: 6, h: 6}}, {y: 1, cols: 4, duration: 3});
const stuckDownAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: downContent}, {y: 2, cols: 5, duration: 3}, {loop: false});
const stuckRightAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: rightContent}, {y: 2, x: 5, cols: 5, duration: 3}, {loop: false});
const stuckUpAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: upContent}, {y: 2, x: 10, cols: 5, duration: 3}, {loop: false});
const stuckLeftAnimation = createAnimation('gfx/effects/arrow.png', {w: 16, h: 16, content: leftContent}, {y: 2, x: 15, cols: 5, duration: 3}, {loop: false});

const sdlAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: {x: 2, y: 8, w: 6, h: 6}}, {cols: 2});
const sdrAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: {x: 8, y: 8, w: 6, h: 6}}, {x: 2, cols: 2});
const surAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: {x: 8, y: 2, w: 6, h: 6}}, {x: 4, cols: 2});
const sulAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: {x: 2, y: 2, w: 6, h: 6}}, {x: 6, cols: 2});
const sdownAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: downContent}, {x: 8, cols: 2});
const srightAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: rightContent}, {x: 10, cols: 2});
const supAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: upContent}, {x: 12, cols: 2});
const sleftAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: leftContent}, {x: 14, cols: 2});

const spoofDownAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: downContent}, {y: 1, cols: 3, duration: 3}, {loop: false});
const spoofRightAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: rightContent}, {y: 1, x: 3, cols: 3, duration: 3}, {loop: false});
const spoofUpAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: upContent}, {y: 1, x: 6, cols: 3, duration: 3}, {loop: false});
const spoofLeftAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: leftContent}, {y: 1, x: 9, cols: 3, duration: 3}, {loop: false});
const sstuckDownAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: downContent}, {y: 2, cols: 5, duration: 3}, {loop: false});
const sstuckRightAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: rightContent}, {y: 2, x: 5, cols: 5, duration: 3}, {loop: false});
const sstuckUpAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: upContent}, {y: 2, x: 10, cols: 5, duration: 3}, {loop: false});
const sstuckLeftAnimation = createAnimation('gfx/effects/spiritarrow.png', {w: 16, h: 16, content: leftContent}, {y: 2, x: 15, cols: 5, duration: 3}, {loop: false});



interface ArrowAnimations {
    normal: FrameAnimation,
    stuck: FrameAnimation,
    blocked: FrameAnimation,
}

const arrowStyles: {[key: string]: {[key in Direction]: ArrowAnimations}} = {
    normal: {
        upleft: {
            normal: ulAnimation,
            stuck: stuckUpAnimation,
            blocked: spinAnimation,
        },
        up: {
            normal: upAnimation,
            stuck: stuckUpAnimation,
            blocked: spinAnimation,
        },
        upright: {
            normal: urAnimation,
            stuck: stuckUpAnimation,
            blocked: spinAnimation,
        },
        left: {
            normal: leftAnimation,
            stuck: stuckLeftAnimation,
            blocked: spinAnimation,
        },
        right: {
            normal: rightAnimation,
            stuck: stuckRightAnimation,
            blocked: spinAnimation,
        },
        downleft: {
            normal: dlAnimation,
            stuck: stuckDownAnimation,
            blocked: spinAnimation,
        },
        down: {
            normal: downAnimation,
            stuck: stuckDownAnimation,
            blocked: spinAnimation,
        },
        downright: {
            normal: drAnimation,
            stuck: stuckDownAnimation,
            blocked: spinAnimation,
        },
    },
    spirit: {
        upleft: {
            normal: sulAnimation,
            stuck: sstuckUpAnimation,
            blocked: spoofUpAnimation,
        },
        up: {
            normal: supAnimation,
            stuck: sstuckUpAnimation,
            blocked: spoofUpAnimation,
        },
        upright: {
            normal: surAnimation,
            stuck: sstuckUpAnimation,
            blocked: spoofUpAnimation,
        },
        left: {
            normal: sleftAnimation,
            stuck: sstuckLeftAnimation,
            blocked: spoofLeftAnimation,
        },
        right: {
            normal: srightAnimation,
            stuck: sstuckRightAnimation,
            blocked: spoofRightAnimation,
        },
        downleft: {
            normal: sdlAnimation,
            stuck: sstuckDownAnimation,
            blocked: spoofDownAnimation,
        },
        down: {
            normal: sdownAnimation,
            stuck: sstuckDownAnimation,
            blocked: spoofDownAnimation,
        },
        downright: {
            normal: sdrAnimation,
            stuck: sstuckDownAnimation,
            blocked: spoofDownAnimation,
        },
    }
}

type ArrowStyle = keyof typeof arrowStyles;

interface Props {
    x?: number
    y?: number
    vx?: number
    vy?: number
    damage?: number
    spiritCloakDamage?: number
    // Don't update until this many frames have passed
    delay?: number
    // Don't collide with walls for this many milliseconds.
    ignoreWallsDuration?: number
    element?: MagicElement
    reflected?: boolean
    style?: ArrowStyle
}

export class Arrow implements EffectInstance {
    area: AreaInstance;
    drawPriority: DrawPriority = 'sprites';
    frame: Frame;
    damage: number;
    spiritCloakDamage: number;
    delay: number;
    ignoreWallsDuration: number;
    element: MagicElement = null;
    x: number;
    y: number;
    z: number = 0;
    vz: number = 0;
    w: number;
    h: number;
    vx: number;
    vy: number;
    animationTime = 0;
    direction: Direction;
    blocked = false;
    reflected: boolean = false;
    stuckFrames: number = 0;
    style: ArrowStyle = 'normal';
    constructor({x = 0, y = 0, vx = 0, vy = 0, damage = 1, spiritCloakDamage = 5, delay = 0, element = null, reflected = false, style = 'normal',
        ignoreWallsDuration = 0,
    }: Props) {
        this.x = x | 0;
        this.y = y | 0;
        this.vx = vx;
        this.vy = vy;
        this.direction = getDirection(this.vx, this.vy, true);
        this.damage = damage;
        this.spiritCloakDamage = spiritCloakDamage;
        this.delay = delay;
        this.ignoreWallsDuration = ignoreWallsDuration;
        this.element = element;
        this.w = 6;
        this.h = 6;
        this.x -= this.w / 2 ;
        this.y -= this.h / 2 ;
        this.style = style;
        this.reflected = reflected;
    }
    getHitProperties(state: GameState): HitProperties {
        return {
            canPush: true,
            direction: this.direction,
            damage: this.damage,
            spiritCloakDamage: this.spiritCloakDamage,
            hitbox: this,
            tileHitbox: {
                w: this.w,
                h: this.h,
                x: this.x,
                // Hit box is lowered for northern walls to match the perspective.
                y: this.y - Math.max(0, this.vy),
            },
            vx: this.vx,
            vy: this.vy, element:
            this.element,
            hitAllies: this.reflected,
            hitEnemies: !this.reflected,
            hitObjects: true,
            hitTiles: this.animationTime >= this.ignoreWallsDuration,
        };
    }
    update(state: GameState) {
        if (this.delay > 0) {
            this.delay -= FRAME_LENGTH;
            return;
        }
        this.animationTime += FRAME_LENGTH;
        if (this.stuckFrames > 0) {
            this.stuckFrames++;
            if (this.blocked) {
                if (this.style !== 'spirit') {
                    if (this.vy > 0) {
                        this.y -= 0.5;
                    }
                    this.vz -= 0.2;
                    this.z += this.vz;
                    if (this.stuckFrames > 15) {
                        removeEffectFromArea(state, this);
                    }
                } else if (this.animationTime >= spoofDownAnimation.duration) {
                    removeEffectFromArea(state, this);
                }
            } else if (this.animationTime >= stuckDownAnimation.duration + 100) {
                removeEffectFromArea(state, this);
            }
            return;
        }
        this.x += this.vx;
        this.y += this.vy;
        const { section } = getAreaSize(state);
        if (this.x + this.w <= section.x || this.y + this.h <= section.y
            || this.x >= section.x + section.w || this.y  >= section.y + section.h
        ) {
            removeEffectFromArea(state, this);
            return;
        }
        if (!this.stuckFrames && this.damage > 1 && this.animationTime % 60 === 0) {
            addSparkleAnimation(state, this.area, this, { element: this.element });
        }
        const hitResult = hitTargets(state, this.area, this.getHitProperties(state));
        if (hitResult.reflected) {
            this.vx = -this.vx;
            this.vy = -this.vy;
            this.reflected = !this.reflected;
            playSound('blockAttack');
            this.direction = getDirection(this.vx, this.vy, true);
            return;
        }
        if (hitResult.blocked) {
            this.stuckFrames = 1;
            this.blocked = true;
            this.vz = 1;
            this.animationTime = 0;
            return;
        }
        if (hitResult.hit && !hitResult.pierced) {
            this.stuckFrames = 1;
            this.animationTime = 0;
            return;
        }
        // This is used to make torches light arrows on fire.
        if (hitResult.setElement) {
            this.element = hitResult.setElement;
        }
    }
    render(context: CanvasRenderingContext2D, state: GameState) {
        const animationSet = arrowStyles[this.style][this.direction];
        let animation = animationSet.normal;
        if (this.blocked) {
            animation = animationSet.blocked;
        } else if (this.stuckFrames > 0) {
            animation = animationSet.stuck;
        }
        const frame = getFrame(animation, this.animationTime);
        drawFrameAt(context, frame, { x: this.x, y: this.y - this.z });
    }
}

export class EnemyArrow extends Arrow {
    isEnemyAttack = true;
    getHitProperties(state: GameState): HitProperties {
        return {
            canPush: false,
            damage: this.damage,
            spiritCloakDamage: this.spiritCloakDamage,
            direction: this.direction,
            hitbox: this,
            tileHitbox: {
                w: this.w,
                h: this.h,
                x: this.x - this.vx,
                y: this.y - this.vy,
            },
            vx: this.vx,
            vy: this.vy, element:
            this.element,
            hitAllies: !this.reflected,
            hitEnemies: this.reflected,
            hitObjects: true,
            hitTiles: this.animationTime >= this.ignoreWallsDuration,
        };
    }
    update(state: GameState) {
        // Don't leave enemy arrows on the screen in case there are a lot of them.
        if (this.stuckFrames > 0 && !this.blocked) {
            removeEffectFromArea(state, this);
            return;
        }
        super.update(state);
    }
}

export class CrystalSpike extends Arrow {
    isEnemyAttack = true;
    static spawn(state: GameState, area: AreaInstance, arrowProps: Props) {
        const spike = new CrystalSpike(arrowProps);
        addEffectToArea(state, area, spike);
    }
    getHitProperties(state: GameState): HitProperties {
        return {
            canPush: false,
            damage: this.damage,
            spiritCloakDamage: this.spiritCloakDamage,
            canDamageCrystalShields: true,
            direction: this.direction,
            hitbox: this,
            tileHitbox: {
                w: this.w,
                h: this.h,
                x: this.x - this.vx,
                y: this.y - this.vy,
            },
            vx: this.vx,
            vy: this.vy,
            element: null,
            hitAllies: !this.reflected,
            hitEnemies: this.reflected,
            hitObjects: true,
            hitTiles: this.animationTime >= this.ignoreWallsDuration,
        };
    }
    update(state: GameState) {
        // Don't leave enemy arrows on the screen in case there are a lot of them.
        if (this.stuckFrames > 0 && !this.blocked) {
            removeEffectFromArea(state, this);
            return;
        }
        super.update(state);
    }
}