import { addObjectToArea } from 'app/content/areas';
import { LightningBolt } from 'app/content/effects/lightningBolt';
import { LightningDischarge } from 'app/content/effects/lightningDischarge';
import { enemyDefinitions } from 'app/content/enemies/enemyHash';
import { allTiles } from 'app/content/tiles';
import { debugCanvas } from 'app/dom';
import {
    accelerateInDirection,
    getNearbyTarget,
    //getVectorToNearbyTarget,
    getVectorToTarget,
    hasEnemyLeftSection,
    // moveEnemy,
    //moveEnemyToTargetLocation,
    //paceRandomly,
} from 'app/content/enemies';
import { beetleWingedAnimations } from 'app/content/enemyAnimations';
import { FRAME_LENGTH } from 'app/gameConstants';
import { createAnimation, drawFrameAt } from 'app/utils/animations';
import { getDirection } from 'app/utils/field';
import { playSound } from 'app/utils/sounds';

import { AreaInstance, Enemy, GameState, HitProperties, HitResult, Rect } from 'app/types';

// This is just the spirit sight frame.
export const stormHeartAnimation = createAnimation('gfx/hud/icons.png',
    {w: 18, h: 18, content: {x: 1, y: 1, w: 16, h: 16}}, {x: 6, cols: 1}
);


debugCanvas;//(stormHeartCanvas);

const stormHeartAnimations = {
    idle: {
        up: stormHeartAnimation,
        down: stormHeartAnimation,
        left: stormHeartAnimation,
        right: stormHeartAnimation,
    },
};

const cloudFormations = [
    [0,406,395,395,407,0,0,406,395,395,407,0,0,406,395,395,407,0,0,406,395,395,407,0],
    [406,413,399,399,412,407,406,413,399,399,412,407,406,413,399,399,412,407,406,413,399,399,412,407],
    [398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400],
    [398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400],
    [398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400,398,399,408,409,399,400],
    [410,409,399,399,408,411,410,409,408,409,408,411,410,403,403,403,403,411,410,403,411,410,403,411],
    [0,410,403,403,411,0,0,410,411,410,411,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,406,395,395,407,0,0,406,395,395,407,0,0,406,395,395,407,0,0,406,395,395,407,0],
    [406,413,399,399,412,407,406,413,399,399,412,407,406,413,399,399,412,407,406,413,399,399,412,407],
    [398,399,399,399,399,400,398,399,399,399,399,400,398,399,399,399,399,400,398,399,408,409,399,400],
    [398,399,399,399,399,400,398,399,408,409,399,400,398,408,403,403,409,400,398,408,411,410,409,400],
    [398,408,403,403,409,400,398,408,411,410,409,400,398,400,0,0,398,400,398,400,0,0,398,400],
    [410,411,0,0,410,411,410,411,0,0,410,411,410,411,0,0,410,411,410,411,0,0,410,411],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const drawCloudFormation = (context: CanvasRenderingContext2D, state: GameState, enemy: Enemy, frame: number): void => {
    for (let row = 0; row < 7; row++) {
        const ty = row + (frame >= 4 ? 7 : 0);
        for (let column = 0; column < 6; column++) {
            const tx = column + (frame % 4) * 6;
            const tile = allTiles[cloudFormations[ty][tx]];
            if (tile) {
                drawFrameAt(context, tile.frame, {
                    x: enemy.x - 32 + 16 * column,
                    y: enemy.y - 32 + 16 * row,
                });
            }
        }
    }
}


enemyDefinitions.stormHeart = {
    // The storm heart is smaller than other hearts, but takes up a lot of space with its cloud barrier.
    animations: stormHeartAnimations, life: 24, scale: 2, touchHit: { damage: 4, element: 'lightning'},
    update: updateStormHeart,
    params: {
        enrageLevel: 0,
        counterAttackTimer: 0,
    },
    immunities: ['lightning'],
    renderOver(context: CanvasRenderingContext2D, state: GameState, enemy: Enemy): void {
        drawCloudFormation(context, state, enemy, enemy.params.cloudLife);
    },
    getHitbox(state: GameState, enemy: Enemy): Rect {
        return {
            x: enemy.x - 32,
            y: enemy.y - 32,
            w: 96,
            h: 112,
        };
    },
    onHit(state: GameState, enemy: Enemy, hit: HitProperties): HitResult {
        // If the shield is up, only fire damage can hurt it.
        if (enemy.params.cloudLife > 0) {
            enemy.params.cloudLife--;
            playSound('enemyHit');
            return { hit: true, stopped: true };
        }
    }
};
enemyDefinitions.stormBeast = {
    animations: beetleWingedAnimations, life: 36, scale: 4, update: updateStormBeast, flying: true,
    acceleration: 0.3, speed: 4,
    touchHit: { damage: 4, element: 'lightning'},
    immunities: ['lightning'],
    params: {
        enrageLevel: 0,
    },
};

function getStormHeart(this: void, state: GameState, area: AreaInstance): Enemy {
    return area.objects.find(target => target instanceof Enemy && target.definition.enemyType === 'stormHeart') as Enemy;
}

/*
function getStormBeast(this: void, state: GameState, area: AreaInstance): Enemy {
    return area.objects.find(target => target instanceof Enemy && target.definition.enemyType === 'flameBeast') as Enemy;
}*/

function isEnemyDefeated(enemy: Enemy): boolean {
    return !enemy || (enemy.life <= 0 && !enemy.isImmortal) || enemy.status === 'gone';
}

function updateStormHeart(this: void, state: GameState, enemy: Enemy): void {
    if (!enemy.params.previousLife) {
        enemy.params.previousLife = enemy.enemyDefinition.life;
    }
    if (enemy.params.counterAttackTimer > 0) {
        enemy.params.counterAttackTimer -= FRAME_LENGTH;
        if (enemy.params.counterAttackTimer === 3000) {
            const hitbox = enemy.getHitbox(state);
            const discharge = new LightningDischarge({
                x: hitbox.x + hitbox.w / 2,
                y: hitbox.y + hitbox.h / 2,
                tellDuration: 3000,
                radius: 96,
            });
            addObjectToArea(state, enemy.area, discharge);
        }
        enemy.params.previousLife = enemy.life;
    } else if (enemy.life < enemy.params.previousLife) {
        // Any time the cloud damage after its last counter attack, it prepars to counter attack in a few seconds.
        enemy.params.counterAttackTimer = 3200;
    }
    const isEnraged = enemy.params.enrageTime > 0;
    // const target = getVectorToNearbyTarget(state, enemy, isEnraged ? 144 : 500, enemy.area.allyTargets);
    if (isEnraged) {
        enemy.params.enrageTime -= FRAME_LENGTH;
        enemy.enemyInvulnerableFrames = enemy.invulnerableFrames = 20;
        if (enemy.params.enrageTime % 500 === 0) {
            enemy.params.theta = (enemy.params.theta || 0) + Math.PI / 4;
            const hitbox = state.hero.getHitbox(state);
            const lightningBolt = new LightningBolt({
                x: hitbox.x + hitbox.w / 2,
                y: hitbox.y + hitbox.h / 2,
                shockWaveTheta: enemy.params.theta,
            });
            addObjectToArea(state, enemy.area, lightningBolt);
        }
    }
    if (enemy.mode === 'choose') {

    }
    if (enemy.life <= enemy.enemyDefinition.life * 2 / 3 && enemy.params.enrageLevel === 0) {
        enemy.params.enrageLevel = 1;
        enemy.params.enrageTime = 6000;
        enemy.modeTime = 0;
    } else if (enemy.life <= enemy.enemyDefinition.life * 1 / 3 && enemy.params.enrageLevel === 1) {
        enemy.params.enrageLevel = 2;
        enemy.params.enrageTime = 8000;
        enemy.modeTime = 0;
    }
}

function updateStormBeast(this: void, state: GameState, enemy: Enemy): void {
    const stormHeart = getStormHeart(state, enemy.area);
    const target = getNearbyTarget(state, enemy, 2000, enemy.area.allyTargets);
    if (enemy.status === 'hidden') {
        if (!target) {
            return;
        }
        const theta = 2 * Math.PI * Math.random();
        enemy.x = 256 + 400 * Math.cos(theta);
        enemy.y = 256 + 400 * Math.sin(theta);
        enemy.params.targetVector = getVectorToTarget(state, enemy, target);
        enemy.vx = enemy.params.targetVector.x;
        enemy.vy = enemy.params.targetVector.y;
        enemy.status = 'normal';
        enemy.setMode('charge');
        return;
    }
    if (enemy.mode === 'regenerate') {
        if (isEnemyDefeated(stormHeart)) {
            enemy.setMode('choose');
            return;
        }
        // Cannot deal or take damage while regenerating.
        enemy.enemyInvulnerableFrames = enemy.invulnerableFrames = 20;
        if (enemy.modeTime % 1000 === 0) {
            enemy.life += 0.5;
            // Drains a little life from the heart to regenerate.
            stormHeart.life -= 0.1;
        }
        if (enemy.life >= enemy.enemyDefinition.life) {
            enemy.life = enemy.enemyDefinition.life;
            enemy.setMode('choose');
        }
        return;
    }
    if (enemy.life < enemy.enemyDefinition.life * 2 / 3) {
        if (!isEnemyDefeated(stormHeart)) {
            enemy.setMode('regenerate');
            return;
        }
    }
    if (!target) {
        return;
    }
    const targetVector = getVectorToTarget(state, enemy, target);
    if (enemy.mode === 'choose') {
        enemy.d = getDirection(targetVector.x, targetVector.y);
        enemy.setAnimation('idle', enemy.d);
    } else if (enemy.mode === 'charge') {
        accelerateInDirection(state, enemy, enemy.params.targetVector);
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        if (hasEnemyLeftSection(state, enemy)) {
            enemy.setMode('choose');
            enemy.status = 'hidden';
        }
    }
}
