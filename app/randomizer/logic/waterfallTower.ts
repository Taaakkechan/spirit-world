import {
    andLogic,
    hasBossWeapon,
    hasGloves, hasIronBoots,
    hasMediumRange, hasRoll,
    hasWeapon,
    hasWaterBlessing,
    orLogic,
} from 'app/content/logic';

import {LogicNode } from 'app/types';


const zoneId = 'waterfallTower';
export const waterfallTowerNodes: LogicNode[] = [
    {
        zoneId,
        nodeId: 'waterfallTowerEntrance',
        checks: [
            {objectId: 'warTemple:0:0x2-empty-0'},
            {objectId: 'warTemple:0:0x2-gloves-0'},
            {objectId: 'warTemple:0:0x2-empty-1'},
        ],
        paths: [
            {nodeId: 'waterfallTowerFirstKey', logic: andLogic(hasGloves, hasRoll)},
            {nodeId: 'waterfallTowerFirstKey', logic: hasIronBoots},
        ],
        entranceIds: ['waterfallTowerEntrance'],
        exits: [{objectId: 'waterfallTowerEntrance'}],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerFirstKey',
        checks: [
            {objectId: 'waterfallTower:s0:0x1-smallKey-0'},
        ],
        paths: [
            // Key blocks aren't technically doors, but they function the same way as far as the logic is concerned.
            // There is a switch the hero must hit after the block to advance to the next section requiring medium range.
            {
                nodeId: 'waterfallTowerAfterFirstLock',
                logic: andLogic(hasGloves, hasMediumRange),
                doorId: 'waterfallTowerKeyBlock'
            },
            // Can just walk through the flows if you posess iron boots.
            {nodeId: 'waterfallTowerAfterFirstLock', logic: hasIronBoots},

        ],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerAfterFirstLock',
        paths: [
            // Must have a weapon to defeat the crystal guardian in order to hit the switch to advance.
            {nodeId: 'waterfallTowerAfterGuardian', logic: hasWeapon},
            {nodeId: 'waterfallTowerAfterGuardian', logic: hasIronBoots},
            // You can run up the center with the iron boots to reach the big key area directly.
            {nodeId: 'waterfallTowerBigKey', logic: hasIronBoots},
            // Just cross the middle stream to reach the big chest area with iron boots or roll across with water blessing.
            {nodeId: 'waterfallTowerBigKChest', logic: orLogic(andLogic(hasWaterBlessing, hasRoll), hasIronBoots)},
        ],
        exits: [{objectId: 'waterfallTower-backEntrance', logic: hasIronBoots}],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerAfterGuardian',
        checks: [
            // This is obtainable without iron boots, but it is annoying, so setting iron boots as the default logic.
            {objectId: 'waterfallTower:s0:0x0-money-0', logic: hasIronBoots},
        ],
        paths: [
            // Stones block the path to the big key area.
            {nodeId: 'waterfallTowerBeforeRustySwitch', logic: hasGloves},
        ],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBeforeRustySwitch',
        // Technically water blessing+roll would also work, but if you active the waterfall you won't be able to get
        // this chest without the iron boots.
        checks: [{objectId: 'waterfallTower:s0:0x0-peachOfImmortalityPiece-0', logic: andLogic(hasIronBoots, hasRoll)}],
        // Just jump off the ledge to reach the nextarea.
        paths: [{nodeId: 'waterfallTowerBeforeSecondGuardian'}],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBeforeSecondGuardian',
        // You have to defeat the crystal guardian to reach the big key from here.
        paths: [{nodeId: 'waterfallTowerBigKey', logic: hasWeapon}],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBigKey',
        checks: [{objectId: 'waterfallTower:s0:0x0-bigKey-0'}],
        paths: [
            {nodeId: 'warTempleKeyDoor'},
        ],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBigChest',
        checks: [{objectId: 'waterfallTower-ironBoots'}],
        paths: [
            {nodeId: 'warTempleKeyDoor'},
            {nodeId: 'warTemple:0:1x0-smallKey-0', logic: hasGloves},
        ],
        entranceIds: ['warTempleMainEntrance', 'warTempleLock1'],
        exits: [
            {objectId: 'warTempleMainEntrance'},
            {objectId: 'warTempleLock1'},
        ],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBack',
        paths: [
            // Just need to defeat the floor eyes to reach the boss chamber.
            {nodeId: 'waterfallTowerBoss', logic: hasWeapon},
        ],
        entranceIds: ['waterfallTower-backEntrance'],
        exits: [{objectId: 'waterfallTower-backEntrance'}],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerBoss',
        checks: [
            {objectId: 'waterfallTowerBoss', logic: andLogic(hasBossWeapon, hasIronBoots)},
        ],
        paths: [
            // Defeating the boss opens the door to the throne room
            {nodeId: 'waterfallTowerThroneRoom', logic: andLogic(hasBossWeapon, hasIronBoots)},
        ],
    },
    {
        zoneId,
        nodeId: 'waterfallTowerThroneRoom',
        npcs: [
            {loot: {type: 'dialogueLoot', id: 'waterfallDragon', lootType: 'cloak'}, progressFlags: ['waterfallTowerThroneDoor']},
        ],
        entranceIds: ['waterfallTower-backEntrance'],
        exits: [{objectId: 'waterfallTower-backEntrance'}],
    },
    // Could add logic for the top entrance eventually, as this might be a significant path for reaching the sky area in the
    // spirit world.
];