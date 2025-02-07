import { createAnimation } from 'app/utils/animations';

import {
    ActorAnimations, CreateAnimationOptions,
    ExtraAnimationProperties, FrameAnimation, FrameDimensions,
} from 'app/types';

const enemyDeathGeometry: FrameDimensions = {w: 20, h: 20};
export const enemyDeathAnimation: FrameAnimation = createAnimation('gfx/effects/enemydeath.png', enemyDeathGeometry, { cols: 9, duration: 4}, { loop: false });

// 252x28
const bossDeathExplosionGeometry: FrameDimensions = {w: 28, h: 28};
export const bossDeathExplosionAnimation: FrameAnimation
    = createAnimation('gfx/effects/powersource_explosion.png', bossDeathExplosionGeometry, { cols: 9, duration: 4}, { loop: false });


const snakeGeometry: FrameDimensions = { w: 18, h: 18, content: { x: 2, y: 6, w: 14, h: 11} };
const leftSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snek.png', snakeGeometry, { x: 0});
const downSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snek.png', snakeGeometry, { x: 1});
const upSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snek.png', snakeGeometry, { x: 2});
export const snakeAnimations: ActorAnimations = {
    idle: {
        up: upSnakeAnimation,
        down: downSnakeAnimation,
        left: leftSnakeAnimation,
        right: leftSnakeAnimation,
    },
};
const leftRedSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekred.png', snakeGeometry, { x: 0});
const downRedSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekred.png', snakeGeometry, { x: 1});
const upRedSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekred.png', snakeGeometry, { x: 2});
export const redSnakeAnimations: ActorAnimations = {
    idle: {
        up: upRedSnakeAnimation,
        down: downRedSnakeAnimation,
        left: leftRedSnakeAnimation,
        right: leftRedSnakeAnimation,
    },
};
const leftBlueSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekblue.png', snakeGeometry, { x: 0});
const downBlueSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekblue.png', snakeGeometry, { x: 1});
const upBlueSnakeAnimation: FrameAnimation = createAnimation('gfx/enemies/snekblue.png', snakeGeometry, { x: 2});
export const blueSnakeAnimations: ActorAnimations = {
    idle: {
        up: upBlueSnakeAnimation,
        down: downBlueSnakeAnimation,
        left: leftBlueSnakeAnimation,
        right: leftBlueSnakeAnimation,
    },
};
// all idols share the same layout and dimensions
// row 0: still frames; row 1: float;
// row 2: float attack; row 3: dead float attack;
// row 4: projectile float attack; row 5: dead projectile float attack;
// row 6: warning eye glow
const idolGeometry: FrameDimensions = { w: 32, h: 40, content: { x: 2, y: 20, w: 28, h: 20} };
const iceImage = 'gfx/enemies/miniStatueBoss-ice-32x40.png';
const fireImage = 'gfx/enemies/miniStatueBoss-fire-32x40.png';
const lightningImage = 'gfx/enemies/miniStatueBoss-lightning-32x40.png';

// ice snake animations
// gfx/enemies/miniStatueBoss-ice-32x40
const iceIdolAttackAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 2, cols: 5});
const iceIdolAttackDeadAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 3, cols: 5});
const iceIdolAttackBallAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 4, cols: 5});
const iceIdolAttackBallDeadAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 5, cols: 5});
const iceIdolBrokenAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { x: 3, y: 0, cols: 1});
const iceIdolIdleAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 1, cols: 5});
const iceIdolStillAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { x: 0, y: 0, cols: 1});
const iceIdolWakeAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { x: 0, y: 0, cols: 2}, {loop: false});
const iceIdolWarningAnimation: FrameAnimation = createAnimation(iceImage, idolGeometry, { y: 6, cols: 5});

export const iceIdolAnimations: ActorAnimations = {
    attack: omniAnimation(iceIdolAttackAnimation),
    attackDead: omniAnimation(iceIdolAttackDeadAnimation),
    attackBall: omniAnimation(iceIdolAttackBallAnimation),
    attackBallDead: omniAnimation(iceIdolAttackBallDeadAnimation),
    broken: omniAnimation(iceIdolBrokenAnimation),
    death: omniAnimation(iceIdolBrokenAnimation),
    idle: omniAnimation(iceIdolIdleAnimation),
    still: omniAnimation(iceIdolStillAnimation),
    wake: omniAnimation(iceIdolWakeAnimation),
    warning: omniAnimation(iceIdolWarningAnimation),
};

// lightning bird animations
// gfx/enemies/miniStatueBoss-lightning-32x40
const lightningIdolAttackAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 2, cols: 5});
const lightningIdolAttackDeadAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 3, cols: 5});
const lightningIdolAttackBallAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 4, cols: 5});
const lightningIdolAttackBallDeadAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 5, cols: 5});
const lightningIdolBrokenAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { x: 3, y: 0, cols: 1});
const lightningIdolIdleAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 1, cols: 5});
const lightningIdolStillAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 0, cols: 1});
const lightningIdolWakeAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { x: 0, y: 0, cols: 2}, {loop: false});
const lightningIdolWarningAnimation: FrameAnimation = createAnimation(lightningImage, idolGeometry, { y: 6, cols: 5});

export const lightningIdolAnimations: ActorAnimations = {
    attack: omniAnimation(lightningIdolAttackAnimation),
    attackDead: omniAnimation(lightningIdolAttackDeadAnimation),
    attackBall: omniAnimation(lightningIdolAttackBallAnimation),
    attackBallDead: omniAnimation(lightningIdolAttackBallDeadAnimation),
    broken: omniAnimation(lightningIdolBrokenAnimation),
    death: omniAnimation(lightningIdolBrokenAnimation),
    idle: omniAnimation(lightningIdolIdleAnimation),
    still: omniAnimation(lightningIdolStillAnimation),
    wake: omniAnimation(lightningIdolWakeAnimation),
    warning: omniAnimation(lightningIdolWarningAnimation),
};

// fire badger animations
// gfx/enemies/miniStatueBoss-fire-32x40
const fireIdolAttackAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 2, cols: 5});
const fireIdolAttackDeadAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 3, cols: 5});
const fireIdolAttackBallAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 4, cols: 5});
const fireIdolAttackBallDeadAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 5, cols: 5});
const fireIdolBrokenAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { x: 3, y: 0, cols: 1});
const fireIdolIdleAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 1, cols: 5});
const fireIdolStillAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 0, cols: 1});
const fireIdolWakeAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { x: 0, y: 0, cols: 2}, {loop: false});
const fireIdolWarningAnimation: FrameAnimation = createAnimation(fireImage, idolGeometry, { y: 6, cols: 5});

export const fireIdolAnimations: ActorAnimations = {
    attack: omniAnimation(fireIdolAttackAnimation),
    attackDead: omniAnimation(fireIdolAttackDeadAnimation),
    attackBall: omniAnimation(fireIdolAttackBallAnimation),
    attackBallDead: omniAnimation(fireIdolAttackBallDeadAnimation),
    broken: omniAnimation(fireIdolBrokenAnimation),
    death: omniAnimation(fireIdolBrokenAnimation),
    idle: omniAnimation(fireIdolIdleAnimation),
    still: omniAnimation(fireIdolStillAnimation),
    wake: omniAnimation(fireIdolWakeAnimation),
    warning: omniAnimation(fireIdolWarningAnimation),
};

const beetleGeometry: FrameDimensions = { w: 18, h: 17, content: { x: 2, y: 4, w: 14, h: 12} };
function genericBeetleAnimation(props: CreateAnimationOptions, extra?: ExtraAnimationProperties) {
    return createAnimation('gfx/enemies/genericbeetle.png', beetleGeometry, props, extra);
}
const beetleDownAnimation: FrameAnimation = genericBeetleAnimation({ y: 0, cols: 4});
const beetleRightAnimation: FrameAnimation = genericBeetleAnimation({ y: 1, cols: 4});
const beetleUpAnimation: FrameAnimation = genericBeetleAnimation({ y: 2, cols: 4});
const beetleLeftAnimation: FrameAnimation = genericBeetleAnimation({ y: 4, cols: 4});
const beetleClimbAnimation: FrameAnimation = genericBeetleAnimation({ y: 3, cols: 4});
export const beetleAnimations: ActorAnimations = {
    climbing: omniAnimation(beetleClimbAnimation),
    idle: {
        up: beetleUpAnimation,
        down: beetleDownAnimation,
        left: beetleLeftAnimation,
        right: beetleRightAnimation,
    },
};
export const climbingBeetleAnimations: ActorAnimations = {
    idle: omniAnimation(beetleClimbAnimation),
};


function goldenBeetleAnimation(props: CreateAnimationOptions, extra?: ExtraAnimationProperties) {
    return createAnimation('gfx/enemies/goldenbeetle.png', beetleGeometry, props, extra);
}
const goldenBeetleDownAnimation: FrameAnimation = goldenBeetleAnimation({ y: 0, cols: 4});
const goldenBeetleRightAnimation: FrameAnimation = goldenBeetleAnimation({ y: 1, cols: 4});
const goldenBeetleUpAnimation: FrameAnimation = goldenBeetleAnimation({ y: 2, cols: 4});
const goldenBeetleLeftAnimation: FrameAnimation = goldenBeetleAnimation({ y: 4, cols: 4});
export const goldenBeetleAnimations: ActorAnimations = {
    idle: {
        up: goldenBeetleUpAnimation,
        down: goldenBeetleDownAnimation,
        left: goldenBeetleLeftAnimation,
        right: goldenBeetleRightAnimation,
    },
};

const beetleMiniGeometry: FrameDimensions = { w: 10, h: 10 };
const beetleMiniDownAnimation: FrameAnimation = createAnimation('gfx/enemies/smallbeetle.png', beetleMiniGeometry, { x: 0, cols: 2});
const beetleMiniRightAnimation: FrameAnimation = createAnimation('gfx/enemies/smallbeetle.png', beetleMiniGeometry, { x: 2, cols: 2});
const beetleMiniUpAnimation: FrameAnimation = createAnimation('gfx/enemies/smallbeetle.png', beetleMiniGeometry, { x: 4, cols: 2});
const beetleMiniLeftAnimation: FrameAnimation = createAnimation('gfx/enemies/smallbeetle.png', beetleMiniGeometry, { x: 7, cols: 2});
export const beetleMiniAnimations: ActorAnimations = {
    idle: {
        up: beetleMiniUpAnimation,
        down: beetleMiniDownAnimation,
        left: beetleMiniLeftAnimation,
        right: beetleMiniRightAnimation,
    },
};

const beetleHornedGeometry: FrameDimensions = { w: 22, h: 18, content: { x: 4, y: 4, w: 14, h: 13} };
const beetleHornedDownAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 0, cols: 4});
const beetleHornedRightAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 2, cols: 4});
const beetleHornedUpAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 4, cols: 4});
const beetleHornedLeftAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 6, cols: 4});
const beetleHornedChargeDownAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 1, cols: 4});
const beetleHornedChargeRightAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 3, cols: 4});
const beetleHornedChargeUpAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 5, cols: 4});
const beetleHornedChargeLeftAnimation: FrameAnimation = createAnimation('gfx/enemies/hornedbeetle.png', beetleHornedGeometry, { y: 7, cols: 4});

export const beetleHornedAnimations: ActorAnimations = {
    idle: {
        up: beetleHornedUpAnimation,
        down: beetleHornedDownAnimation,
        left: beetleHornedLeftAnimation,
        right: beetleHornedRightAnimation,
    },
    attack: {
        up: beetleHornedChargeUpAnimation,
        down: beetleHornedChargeDownAnimation,
        left: beetleHornedChargeLeftAnimation,
        right: beetleHornedChargeRightAnimation,
    }
};

const beetleWingedGeometry: FrameDimensions = { w: 22, h: 18, content: { x: 4, y: 4, w: 14, h: 13} };
const beetleWingedAnimation: FrameAnimation = createAnimation('gfx/enemies/flyingbeetle.png', beetleWingedGeometry, { cols: 4});
export const beetleWingedAnimations: ActorAnimations = {
    idle: {
        up: beetleWingedAnimation,
        down: beetleWingedAnimation,
        left: beetleWingedAnimation,
        right: beetleWingedAnimation,
    },
};

const entGeometry: FrameDimensions = { w: 40, h: 38, content: { x: 4, y: 6, w: 32, h: 32} };
const entAnimation: FrameAnimation = createAnimation('gfx/enemies/ent.png', entGeometry, { cols: 1});
export const entAnimations: ActorAnimations = {
    idle: {
        up: entAnimation,
        down: entAnimation,
        left: entAnimation,
        right: entAnimation,
    },
};

const droneGeometry: FrameDimensions = { w: 18, h: 17, content: { x: 2, y: 4, w: 14, h: 12} };
const droneAnimation: FrameAnimation = createAnimation('gfx/enemies/drone.png', droneGeometry, { cols: 4});
export const droneAnimations: ActorAnimations = {
    idle: {
        up: droneAnimation,
        down: droneAnimation,
        left: droneAnimation,
        right: droneAnimation,
    },
};

const sentryBotGeometry: FrameDimensions = { w: 40, h: 39, content: { x: 4, y: 8, w: 32, h: 32} };
const sentryBotSideGeometry: FrameDimensions = { w: 40, h: 39, content: { x: 14, y: 8, w: 12, h: 32} };
const sentryBotAnimationDown: FrameAnimation = createAnimation('gfx/enemies/sentrybot.png', sentryBotGeometry, { cols: 4});
const sentryBotAnimationRight: FrameAnimation = createAnimation('gfx/enemies/sentrybot.png', sentryBotSideGeometry, { cols: 4, y: 1});
const sentryBotAnimationUp: FrameAnimation = createAnimation('gfx/enemies/sentrybot.png', sentryBotGeometry, { cols: 4, y: 2});
const sentryBotAnimationLeft: FrameAnimation = createAnimation('gfx/enemies/sentrybot.png', sentryBotSideGeometry, { cols: 4, y: 3});
export const sentryBotAnimations: ActorAnimations = {
    idle: {
        up: sentryBotAnimationUp,
        down: sentryBotAnimationDown,
        left: sentryBotAnimationLeft,
        right: sentryBotAnimationRight,
    },
};

const squirrelGeometry: FrameDimensions = { w: 24, h: 24, content: { x: 3, y: 7, w: 18, h: 18} };
type SquirrelObject = {
    down: FrameAnimation;
    right: FrameAnimation;
    up: FrameAnimation;
    left: FrameAnimation;
    climb: FrameAnimation;
}
function createSquirrelAnimation(squirrelType: string): SquirrelObject {
    const down: FrameAnimation = createAnimation(`gfx/enemies/${squirrelType}.png`, squirrelGeometry, { y: 0, cols: 4, duration: 10});
    const right: FrameAnimation = createAnimation(`gfx/enemies/${squirrelType}.png`, squirrelGeometry, { y: 1, cols: 4, duration: 10});
    const up: FrameAnimation = createAnimation(`gfx/enemies/${squirrelType}.png`, squirrelGeometry, { y: 4, cols: 4, duration: 10});
    const left: FrameAnimation = createAnimation(`gfx/enemies/${squirrelType}.png`, squirrelGeometry, { y: 2, cols: 4, duration: 10});
    const climb: FrameAnimation = createAnimation(`gfx/enemies/${squirrelType}.png`, squirrelGeometry, { y: 3, cols: 4, duration: 10});
    return {down, right, up, left, climb};
}

const electricSquirrelAnimation = createSquirrelAnimation('electricsquirrel');
export const electricSquirrelAnimations: ActorAnimations = {
    climbing: {
        up: electricSquirrelAnimation.climb,
        down: electricSquirrelAnimation.climb,
        left: electricSquirrelAnimation.climb,
        right: electricSquirrelAnimation.climb,
    },
    idle: {
        up: electricSquirrelAnimation.up,
        down: electricSquirrelAnimation.down,
        left: electricSquirrelAnimation.left,
        right: electricSquirrelAnimation.right,
    },
};

const superElectricSquirrelAnimation = createSquirrelAnimation('superelectricsquirrel');
export const superElectricSquirrelAnimations: ActorAnimations = {
    climbing: {
        up: superElectricSquirrelAnimation.climb,
        down: superElectricSquirrelAnimation.climb,
        left: superElectricSquirrelAnimation.climb,
        right: superElectricSquirrelAnimation.climb,
    },
    idle: {
        up: superElectricSquirrelAnimation.up,
        down: superElectricSquirrelAnimation.down,
        left: superElectricSquirrelAnimation.left,
        right: superElectricSquirrelAnimation.right,
    },
};

const brownSquirrelAnimation = createSquirrelAnimation('brownsquirrel');
export const brownSquirrelAnimations: ActorAnimations = {
    climbing: {
        up: brownSquirrelAnimation.climb,
        down: brownSquirrelAnimation.climb,
        left: brownSquirrelAnimation.climb,
        right: brownSquirrelAnimation.climb,
    },
    idle: {
        up: brownSquirrelAnimation.up,
        down: brownSquirrelAnimation.down,
        left: brownSquirrelAnimation.left,
        right: brownSquirrelAnimation.right,
    },
};

export function omniAnimation(animation: FrameAnimation) {
    return {
        up: animation, down: animation, left: animation, right: animation,
    };
}

const floorEyeGeometry: FrameDimensions = { w: 16, h: 16 };
const floorEyeClosedAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry, { cols: 1});
const floorEyeOpeningAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry,
    { x: 1, cols: 10, duration: 5, frameMap: [0, 1, 2, 2, 2, 2, 2, 3, 4, 5, 6, 7, 8, 9]}, {loop: false});
const floorEyeOpenAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry, { x: 3, cols: 1, duration: 5});
const floorEyeAttackAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry,
    { x: 9, cols: 4, duration: 3, frameMap: [0, 1, 2, 3, 2, 1]});
const floorEyeClosingAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry,
    { x: 0, cols: 3, duration: 5, frameMap: [2, 1, 0]}, {loop: false});
const floorEyeHurtAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry, { x: 16, cols: 1, duration: 5});
const floorEyeDefeatedAnimation: FrameAnimation = createAnimation('gfx/enemies/eyemonster.png', floorEyeGeometry, { x: 17, cols: 1, duration: 5});

export const floorEyeAnimations: ActorAnimations = {
    idle: omniAnimation(floorEyeClosedAnimation),
    opening: omniAnimation(floorEyeOpeningAnimation),
    open: omniAnimation(floorEyeOpenAnimation),
    attack: omniAnimation(floorEyeAttackAnimation),
    closing: omniAnimation(floorEyeClosingAnimation),
    hurt: omniAnimation(floorEyeHurtAnimation),
    defeated: omniAnimation(floorEyeDefeatedAnimation),
};

/*
This is the Bat sheet. The Bat runs at 10 FPS
The first 6 frames are for flying - it runs 1-2-3-4-5-6-1 at 10 FPS
Frame 7 is when hurt (runs however long is appropriate)
Frame 8-14 is for attacking. I imagine the icicles are spawned on frame 11 or 12.
*/

const crystalBatGeometry: FrameDimensions = { w: 36, h: 36, content: {x: 8, y: 8, w: 20, h: 20} };
const crystalBatFlyingAnimation = createAnimation('gfx/enemies/bat1-Sheet.png', crystalBatGeometry, { cols: 6, duration: 5});
const crystalBatHurtAnimation = createAnimation('gfx/enemies/bat1-Sheet.png', crystalBatGeometry, { x: 6, cols: 1});
const crystalBatAttackAnimation = createAnimation('gfx/enemies/bat1-Sheet.png', crystalBatGeometry, { x: 7, cols: 7, duration: 5});

export const crystalBatAnimations: ActorAnimations = {
    idle: omniAnimation(crystalBatFlyingAnimation),
    hurt: omniAnimation(crystalBatHurtAnimation),
    attack: omniAnimation(crystalBatAttackAnimation),
};

const crystalCollectorGeometry: FrameDimensions = { w: 50, h: 39, content: {x: 7, y: 9, w: 36, h: 30} };
const crystalBossAnimation = (props: CreateAnimationOptions, extra?: ExtraAnimationProperties) =>
    createAnimation('gfx/enemies/eyeboss2.png', crystalCollectorGeometry, props, extra);


const crystalCollectorOpenAnimation = crystalBossAnimation({ cols: 5, duration: 10}, {loop: false});
const crystalCollectorEnragedOpenAnimation = crystalBossAnimation({ y: 1, cols: 5, duration: 10}, {loop: false});

const crystalCollectorIdleAnimation = crystalBossAnimation({ x: 4, cols: 1, duration: 5});
const crystalCollectorEnragedIdleAnimation = crystalBossAnimation({ y: 1, x: 4, cols: 1, duration: 5});

const crystalCollectorHurtAnimation = crystalBossAnimation({ x: 5, cols: 1});
const crystalCollectorEnragedHurtAnimation = crystalBossAnimation({ y: 1, x: 5, cols: 1});

const crystalCollectorConfusedAnimation = crystalBossAnimation({ x: 6, cols: 2}, {loop: false});
const crystalCollectorEnragedConfusedAnimation = crystalBossAnimation({ y: 1, x: 6, cols: 2}, {loop: false});

const crystalCollectorAttackAnimation = crystalBossAnimation({ x: 8, cols: 3, duration: 5});
const crystalCollectorEnragedAttackAnimation = crystalBossAnimation({ y: 1, x: 8, cols: 3, duration: 5});

export const crystalCollecterBackFrame = crystalBossAnimation({x: 11}).frames[0];

export const crystalCollectorAnimations: ActorAnimations = {
    open: omniAnimation(crystalCollectorOpenAnimation),
    idle: omniAnimation(crystalCollectorIdleAnimation),
    hurt: omniAnimation(crystalCollectorHurtAnimation),
    confused: omniAnimation(crystalCollectorConfusedAnimation),
    attack: omniAnimation(crystalCollectorAttackAnimation),
    death: omniAnimation(crystalCollectorConfusedAnimation),
};
export const crystalCollectorEnragedAnimations: ActorAnimations = {
    open: omniAnimation(crystalCollectorEnragedOpenAnimation),
    idle: omniAnimation(crystalCollectorEnragedIdleAnimation),
    hurt: omniAnimation(crystalCollectorEnragedHurtAnimation),
    confused: omniAnimation(crystalCollectorEnragedConfusedAnimation),
    attack: omniAnimation(crystalCollectorEnragedAttackAnimation),
    death: omniAnimation(crystalCollectorEnragedConfusedAnimation),
};

const crystalBarrierGeometry: FrameDimensions = { w: 96, h: 94, content: {x: 16, y: 40, w: 64, h: 44} };
export const crystalBarrierSummonAnimation = createAnimation('gfx/effects/monstershield.png', crystalBarrierGeometry,
    { x: 0, cols: 4, duration: 6, frameMap: [0,0,0,0,1,2,3,2,3]});
export const crystalBarrierNormalAnimation = createAnimation('gfx/effects/monstershield.png', crystalBarrierGeometry, { x: 3, cols: 1, duration: 5});
export const crystalBarrierDamagedAnimation = createAnimation('gfx/effects/monstershield.png', crystalBarrierGeometry, { x: 4, cols: 1, duration: 5});
export const crystalBarrierVeryDamagedAnimation = createAnimation('gfx/effects/monstershield.png', crystalBarrierGeometry, { x: 5, cols: 1, duration: 5});

const smallCrystalBarrierGeometry: FrameDimensions = { w: 68, h: 72, content: {x: 2, y: 20, w: 64, h: 44} };
export const [
    smallCrystalBarrierFlashFrame,
    smallCrystalBarrierNormalFrame,
    smallCrystalBarrierDamagedFrame,
    smallCrystalBarrierVeryDamagedFrame,
] = createAnimation('gfx/effects/golemshield.png', smallCrystalBarrierGeometry, { x: 0, cols: 4}).frames;

export const crystalBarrierSmallParticles = createAnimation('gfx/effects/crystalwallparticles.png', {w: 8, h: 8}, { cols: 3}).frames;
export const crystalBarrierLargeParticles = createAnimation('gfx/effects/crystalwallparticles2.png', {w: 16, h: 28}, { cols: 4}).frames;

const crystalGuardianGeometry: FrameDimensions = { w: 40, h: 48, content: {x: 4, y: 16, w: 32, h: 32} };
export const crystalGuardianIdleAnimation = createAnimation('gfx/enemies/golem.png', crystalGuardianGeometry,
    { x: 0, cols: 1, duration: 10});
export const crystalGuardianAttackAnimation = createAnimation('gfx/enemies/golem.png', crystalGuardianGeometry,
    { x: 1, cols: 2, duration: 10, frameMap: [0, 0, 1]}, {loop: false});
export const crystalGuardianSpellAnimation = createAnimation('gfx/enemies/golem.png', crystalGuardianGeometry,
    { x: 3, cols: 4, duration: 10}, {loopFrame: 1});
export const crystalGuardianHurtAnimation = createAnimation('gfx/enemies/golem.png', crystalGuardianGeometry,
    { x: 7, cols: 1, duration: 10}, {loop: false});
export const crystalGuardianAnimations: ActorAnimations = {
    idle: omniAnimation(crystalGuardianIdleAnimation),
    hurt: omniAnimation(crystalGuardianHurtAnimation),
    attack: omniAnimation(crystalGuardianAttackAnimation),
    spell: omniAnimation(crystalGuardianSpellAnimation),
    death: omniAnimation(crystalGuardianHurtAnimation),
};
/*
//
Frame 1 - this is the idle standing frame
Frame 2-3 - this is the hammering frame. I imagine you should keep the golem on frame 3 for longer just to help show that the attack came from the hammer
Frame 4-7 - this is the golem preparing and then casting a spell. Loop frames 5-7 for however long the casting is.
Frame 8 - hurt frame*/

const icePlantGeometry: FrameDimensions = { w: 48, h: 32, content: {x: 12, y: 16, w: 24, h: 16} };
export const icePlantIdleAnimation = createAnimation('gfx/enemies/icePlant.png', icePlantGeometry,
    { x: 0, cols: 1, duration: 10});
export const icePlantPrepareAnimation = createAnimation('gfx/enemies/icePlant.png', icePlantGeometry,
    { x: 1, cols: 1, duration: 20});
export const icePlantAttackAnimation = createAnimation('gfx/enemies/icePlant.png', icePlantGeometry,
    { x: 2, cols: 1, duration: 15});
export const icePlantAnimations: ActorAnimations = {
    idle: omniAnimation(icePlantIdleAnimation),
    prepare: omniAnimation(icePlantPrepareAnimation),
    attack: omniAnimation(icePlantAttackAnimation),
};

