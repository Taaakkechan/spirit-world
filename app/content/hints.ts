import { isRandomizer } from 'app/gameConstants';
import { findReachableChecksFromStart } from 'app/randomizer/find';
import { setScript } from 'app/scriptEvents';
import { findObjectLocation } from 'app/utils/enterZoneByTarget';
import Random from 'app/utils/Random';

import { Frame, GameState, LogicalZoneKey, LootWithLocation, ObjectDefinition, ZoneLocation } from 'app/types';

interface Mission {
    getMarkerLocation?: (state :GameState) => ZoneLocation & { object?: ObjectDefinition } | false
    markerFrame?: Frame
    getScript: (state: GameState) => string
    isAvailable: (state: GameState) => boolean
    isResolved: (state: GameState) => boolean
}

function findMaterialWorldObject(state: GameState, objectId: string) {
    return findObjectLocation(state, 'overworld', objectId, false, null, true);
}
function findSpiritWorldObject(state: GameState, objectId: string) {
    return findObjectLocation(state, 'overworld', objectId, true, null, true);
}
function findMaterialSkyObject(state: GameState, objectId: string) {
    return findObjectLocation(state, 'sky', objectId, false, null, true);
}
function findSpiritSkyObject(state: GameState, objectId: string) {
    return findObjectLocation(state, 'sky', objectId, true, null, true);
}

const getPeachCaveLocation = (state: GameState) => findMaterialWorldObject(state, 'peachCaveTopEntrance');
const getWaterfallVillageLocation = (state: GameState) => findMaterialWorldObject(state, 'waterfallCaveEntrance');
const getVanaraElderLocation = (state: GameState) => findMaterialWorldObject(state, 'elderEntrance');

const getTombLocation = (state: GameState) => findMaterialWorldObject(state, 'tombEntrance');
const getWarTempleLocation = (state: GameState) => findMaterialWorldObject(state, 'warTempleEntrance');
const getLakeTeleporterLocation = (state: GameState) => findMaterialWorldObject(state, 'tombTeleporter');

const getLakeTunnelLocation = (state: GameState) => findMaterialWorldObject(state, 'lakeTunnelEntrance');
const getGrandTempleLocation = (state: GameState) => findMaterialWorldObject(state, 'grandTempleEntrance');

const getForestTempleLocation = (state: GameState) => findSpiritWorldObject(state, 'elderSpiritEntrance');
const getWaterfallTowerLocation = (state: GameState) => findMaterialWorldObject(state, 'waterfallTowerEntrance');
const getForgeLocation = (state: GameState) => findSpiritSkyObject(state, 'forgeEntrance');
const getSkyPalaceLocation = (state: GameState) => findSpiritSkyObject(state, 'skyPalaceEntrance');
const getJadePalaceLocation = (state: GameState) => findSpiritWorldObject(state, 'jadePalaceEntrance');

const getCraterLocation = (state: GameState) => findMaterialSkyObject(state, 'craterEntrance');
const getLakeTempleLocation = (state: GameState) => findMaterialWorldObject(state, 'riverTempleUpperEntrance');
const getStaffTowerLocation = (state: GameState) => findMaterialWorldObject(state, 'staffTowerEntrance');

const getWarPalaceLocation = (state: GameState) => findSpiritWorldObject(state, 'warTempleEntranceSpirit');

const missions: Mission[] = [
    {
        getMarkerLocation: getPeachCaveLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'peachCave') {
                return `I want to explore that cave I fell in more.
                    {|}The entrance was just east of the waterfall north of the lake.`;
            } else {
                return 'I need to find a way out of this cave.';
            }
        },
        isAvailable(state: GameState) {
            return true;
        },
        isResolved(state: GameState) {
            return state.hero.weapon > 0;
        },
    },
    {
        getMarkerLocation: getPeachCaveLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'peachCave') {
                return `I wonder if that glowing peach is still in that cave?
                    {|}The entrance was just east of the waterfall and north of the lake.`;
            } else if (!state.savedState.objectFlags.peachCaveBoss) {
                return 'With this Chakram I should be able to climb out of this cave.';
            } else {
                return 'I left that glowing peach somewhere in this cave.';
            }
        },
        isAvailable(state: GameState) {
            return state.hero.weapon > 0;
        },
        isResolved(state: GameState) {
            return state.hero.passiveTools.catEyes > 0;
        },
    },
    {
        getMarkerLocation: getPeachCaveLocation,
        getScript(state: GameState) {
            return `Now that I can see in the dark I should have no trouble finding a way out of this cave.`;
        },
        isAvailable(state: GameState) {
            return state.hero.passiveTools.catEyes > 0;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.homeInstructions || state.location.zoneKey !== 'peachCave';
        },
    },
    {
        getMarkerLocation: getWaterfallVillageLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'waterfallCave') {
                return `I've been out for a long time, I should head home to the cave behind the waterfall.
                    {|}The waterfall is just north of the lake.
                    {addCue: Press [B_MAP] to view the map}`;
            } else {
                return `I should tell my mom about what happened in the cave.
                    {|}I think I saw her by the pool at the entrance.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.homeInstructions || state.location.zoneKey !== 'peachCave';
        },
        isResolved(state: GameState) {
            // This is normally resolved by talking to your mom, but it is also considered resolved
            // if you talk to the Vanara Elder or Vanara Guardian first.
            return !!state.savedState.objectFlags.momElder
                || !!state.savedState.objectFlags.elderTomb
                || state.hero.passiveTools.spiritSight > 0;
        },
    },
    {
        getMarkerLocation: getVanaraElderLocation,
        getScript(state: GameState) {
            return `I should talk to the Vanara Elder about my strange powers.
                {|}He lives in the woods to the southwest with the other Vanara.
                {addCue: Press [B_MAP] to view the map}`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.momElder;
        },
        isResolved(state: GameState) {
            // Talking to the Vanara Guardian will also resolve this mission.
            return !!state.savedState.objectFlags.elderTomb
                || state.hero.passiveTools.spiritSight > 0;
        },
    },
    {
        getMarkerLocation: getVanaraElderLocation,
        getScript(state: GameState) {
            return `The Vanara Elder said there was something I needed in his basement.
                {|}He lives in the southwest tree in the forest.
                {addCue: Press [B_MAP] to view the map}`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elderTomb;
        },
        isResolved(state: GameState) {
            // Talking to the Vanara Guardian will also resolve this mission.
            return state.hero.activeTools.bow > 0
                || state.hero.passiveTools.spiritSight > 0;
        },
    },
    {
        getMarkerLocation: getTombLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'tomb') {
                return `The elder said I could learn more about my powers if I explore the Vanara Tomb.
                    {|}The Tomb is North of the woods in the Southwest.`;
            } else {
                return `The elder said I could learn more about my powers if I explore this Tomb.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elderTomb;
        },
        isResolved(state: GameState) {
            return state.hero.passiveTools.spiritSight > 0;
        },
    },
    {
        getMarkerLocation: getWaterfallVillageLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'waterfallCave') {
                return `I should go ask my mom if she knows anything about what the Vanara Guardian
                    was talking about.
                    {|}He said she might help me find a way to "touch the spirit world".
                    {addCue: Press [B_MAP] to view the map}`;
            } else {
                return `I think I saw my mom by the pool near the entrance.`;
            }
        },
        isAvailable(state: GameState) {
            return state.hero.passiveTools.spiritSight > 0;
        },
        isResolved(state: GameState) {
            // This will automatically resolve if the player obtains the Summoner's Circlet even if they
            // never talk to their mom about the ruins.
            return !!state.savedState.objectFlags.momRuins
                || state.hero.passiveTools.astralProjection > 0;
        },
    },
    {
        getMarkerLocation: getWarTempleLocation,
        getScript(state: GameState) {
            return `There must be some way to open the Temple in the southeastern ruins.
                {|}Maybe my new spirit sight will show the way.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.momRuins;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.warTempleEntrance;
        },
    },
    {
        getMarkerLocation: getWarTempleLocation,
        getScript(state: GameState) {
            return `I need to keep exploring the southeast ruins to find the treasure of the summoner tribe.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.momRuins && !!state.savedState.objectFlags.warTempleEntrance;
        },
        isResolved(state: GameState) {
            return !!state.hero.passiveTools.astralProjection;
        },
    },
    {
        getMarkerLocation: getLakeTeleporterLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'tomb') {
                return `The Guardian of the Tomb said to come back when I could "touch the spirit world".
                    {|}There was a teleporter by the lake that will take me back to the Tomb.`;
            } else {
                return `I should ask the Guardian what to do next.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.hero.passiveTools.astralProjection;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.tombExit;
        },
    },
    {
        getMarkerLocation: getLakeTeleporterLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey === 'cocoon') {
                return `There must be something important at the bottom of this strange cave.`;
            } else if (state.location.zoneKey === 'tomb') {
                return `There must be something important in that strange cave behind this Tomb.`;
            } else {
                return `There must be something important in that strange cave behind the Tomb.
                    {|}There was a teleporter by the lake that will take me back to the Tomb.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.tombExit;
        },
        isResolved(state: GameState) {
            return !!state.hero.passiveTools.teleportation;
        },
    },
    {
        getMarkerLocation: getLakeTunnelLocation,
        getScript(state: GameState) {
            if (state.location.zoneKey !== 'helix') {
                return `The Guardian said there is something called the Helix beyond the Lake Tunnel.
                    {|}With all my spirit abilities, I should be able to get through now.`;
            } else {
                return `The Guardian said I should seek answers at the top of this Helix.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.hero.passiveTools.teleportation;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.vanaraCommanderBeasts;
        },
    },
    {
        getMarkerLocation(state: GameState) {
            if (state.location.isSpiritWorld) {
                return getJadePalaceLocation(state);
            } else {
                return getGrandTempleLocation(state);
            }
        },
        getScript(state: GameState) {
            if (state.location.isSpiritWorld) {
                if (state.location.zoneKey === 'grandTemple') {
                    return `The Spirit King should be in the throne room at the north end of the palace.`;
                } else {
                    return `I should head to the Jade Palace and talk to the Spirit King.`;
                }
            } else {
                return `There is a portal to the spirit world in the middle of the Grand Temple, north of the Holy City.
                    {|}If I travel through the portal I should be able to speak to the Spirit King on the other side.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.vanaraCommanderBeasts && !state.savedState.objectFlags.spiritKingForestTemple;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.spiritKingForestTemple;
        },
    },
    {
        getMarkerLocation(state: GameState) {
            if (state.location.isSpiritWorld) {
                return getForestTempleLocation(state);
            } else {
                return getGrandTempleLocation(state);
            }
        },
        getScript(state: GameState) {
            if (state.location.isSpiritWorld) {
                return `The Spirit King said I would find something useful in the Fertility Temple.
                    {|}It is in the strange forest to the Southwest.`;
            } else {
                return `There is a portal to the spirit world in the middle of the Grand Temple, north of the Holy City.`;
            }
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.spiritKingForestTemple;
        },
        isResolved(state: GameState) {
            return !!state.hero.activeTools.clone && !!state.hero.equipment.cloudBoots;
        },
    },
    {
        getMarkerLocation: getGrandTempleLocation,
        getScript(state: GameState) {
            return `I might find something useful in the training gauntlet under the Grand Temple.
                {|}There is a staircase to the Gauntlet at the back of the temple.`;
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && !!state.hero.activeTools.staff
                && !!state.hero.activeTools.clone && !!state.hero.equipment.cloudBoots;
        },
        isResolved(state: GameState) {
            return !!state.hero.passiveTools.trueSight;
        },
    },
    {
        getMarkerLocation: getWaterfallTowerLocation,
        getScript(state: GameState) {
            return `There is something hidden behind the waterfall at the top of the mountain.`;
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && !!state.hero.passiveTools.trueSight;
        },
        isResolved(state: GameState) {
            return state.hero.activeTools.cloak >= 2;
        },
    },
    {
        getMarkerLocation: getForgeLocation,
        getScript(state: GameState) {
            return `There is a Forge at the top of the mountains in the Spirit World.
                {|}I can probably upgrade my equipment there.`;
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && !!state.hero.equipment.cloudBoots;
        },
        isResolved(state: GameState) {
            return !!state.hero.passiveTools.goldMail;
        },
    },
    {
        getMarkerLocation: getSkyPalaceLocation,
        getScript(state: GameState) {
            return `There is a useful treasure hidden in the Sky Palace, but I'll have to figure out how to get in.`;
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && (
                    !!state.hero.passiveTools.lightningBlessing
                    || state.hero.passiveTools.gloves >= 2
                    || state.hero.activeTools.cloak >= 2
                    || state.hero.activeTools.clone >= 1
                    || state.hero.elements.lightning >= 1
                );
        },
        isResolved(state: GameState) {
            return !!state.hero.passiveTools.nimbusCloud;
        },
    },
    {
        getMarkerLocation: getJadePalaceLocation,
        getScript(state: GameState) {
            return `There is a powerful relic hidden in the Holy Sanctum.
                {|}There is a door to the Sanctum at the back of the Jade Palace in the Spirit World.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && (
                    state.hero.elements.lightning >= 1
                    || state.hero.elements.ice >= 1
                    || (state.hero.elements.fire >= 1 && state.hero.passiveTools.fireBlessing >= 1)
                );
        },
        isResolved(state: GameState) {
            return state.hero.activeTools.bow >= 2;
        },
    },
    {
        getMarkerLocation: getCraterLocation,
        getScript(state: GameState) {
            return `The Flame Beast is probably in the crater among the mountain peaks.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && (
                    state.hero.equipment.cloudBoots >= 1
                    || state.hero.elements.ice >= 1
                    || state.hero.activeTools.cloak >= 2
                    || state.hero.passiveTools.gloves >= 2
                );
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.flameBeast;
        },
    },
    {
        getMarkerLocation: getLakeTempleLocation,
        getScript(state: GameState) {
            return `The Frost Beast must be residing in the ruins in the middle of the Frozen Lake.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && (
                    state.hero.equipment.ironBoots >= 1
                    || (
                        (state.hero.elements.lightning >= 1 || state.hero.elements.fire >= 1)
                        && (state.hero.activeTools.clone >= 1 || state.hero.passiveTools.nimbusCloud >= 1)
                    )
                );
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.frostBeast;
        },
    },
    {
        getMarkerLocation: getStaffTowerLocation,
        getScript(state: GameState) {
            return `The Storm Beast is roosting at the top of the Staff Tower.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.elementalBeastsEscaped
                && (
                    state.hero.equipment.cloudBoots >= 1
                    || state.hero.elements.ice >= 1
                    || state.hero.activeTools.cloak >= 2
                    || state.hero.activeTools.clone >= 1
                );
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.stormBeast;
        },
    },
    {
        getMarkerLocation: getJadePalaceLocation,
        getScript(state: GameState) {
            return `There is another powerful relic hidden in the Holy Sanctum.
                {|}There is a door to the Sanctum at the back of the Jade Palace in the Spirit World.`
        },
        isAvailable(state: GameState) {
            return state.hero.activeTools.bow >= 2
                && state.hero.elements.lightning >= 1
                && state.hero.elements.ice >= 1
                && state.hero.elements.fire >= 1 && state.hero.passiveTools.fireBlessing >= 1;
        },
        isResolved(state: GameState) {
            return state.hero.passiveTools.phoenixCrown >= 1;
        },
    },
    {
        getMarkerLocation: getWarPalaceLocation,
        getScript(state: GameState) {
            return `Something evil is growing under the War Palace.
                {|}The War Palace is to the southeast in the Spirit World.`
        },
        isAvailable(state: GameState) {
            return state.hero.elements.lightning >= 1
                && state.hero.elements.ice >= 1
                && state.hero.elements.fire >= 1;
        },
        isResolved(state: GameState) {
            return !!state.savedState.objectFlags.voidTree;
        },
    },
    {
        getMarkerLocation: getWarPalaceLocation,
        getScript(state: GameState) {
            return `Something evil is growing under the War Palace.
                {|}The War Palace is to the southeast in the Spirit World.`
        },
        isAvailable(state: GameState) {
            return !!state.savedState.objectFlags.voidTree;
        },
        isResolved(state: GameState) {
            return false;
        },
    },
];


export function showHint(state: GameState): void {
    if (isRandomizer) {
        setScript(state, getRandomizerHint(state));
        return;
    }
    for (const mission of missions) {
        if (mission.isAvailable(state) && !mission.isResolved(state)) {
            setScript(state, mission.getScript(state));
            return;
        }
    }
    const flags = state.savedState.objectFlags;
    if (!flags.voidTree) {
        setScript(state, ``);
    } else {
        setScript(state, `Isn't there anywhere else interesting to go?
            {|}Try adding ?seed=20 to the url to play the randomizer.`);
    }
}

export function getMapTarget(state: GameState): ZoneLocation & { object?: ObjectDefinition } | false {
    if (isRandomizer) {
        return null;
    }
    for (const mission of missions) {
        if (mission.isAvailable(state) && !mission.isResolved(state)) {
            const location = mission.getMarkerLocation(state);
            if (location) {
                return location;
            }
        }
    }
    return null;
}

export function convertLocationToMapCoordinates(location: ZoneLocation & {object?: ObjectDefinition}): {x: number, y: number} {
    const coords = {
        x: location.areaGridCoords.x * 64 + location.x / 8,
        y: location.areaGridCoords.y * 64 + location.y / 8,
    };
    // Most doors are 32x32, so add 16 / 2 px to the coords to target the center of the door
    if (location.object?.type === 'door') {
        coords.x += 2;
        coords.y += 2;
    } else {
        // Other objects like teleporters/pits tend to be 16x16
        coords.x++;
        coords.y++;
    }
    return coords;
}


export function getRandomizerZoneDescription(zone: LogicalZoneKey): string {
    switch (zone) {
        case 'sky': return 'in the sky';
        case 'spiritSky': return 'in the spirit world sky';
        case 'overworld': return 'outside';
        case 'spiritWorld': return 'out in the spirit world';
        case 'bushCave': return 'in a cave full of bushes';
        case 'ascentCave': return  'in a cave on the mountain';
        case 'ascentCaveSpirit': return  'in the spirit world in a cave on the mountain';
        case 'fertilityShrine': return 'in the shrine by the forest village';
        case 'fertilityShrineSpirit': return 'in the shrine by the Forest Temple';
        case 'holyCityInterior': return 'inside the Holy City';
        case 'jadeCityInterior': return 'inside the Jade City';
        case 'fertilityShrineSpirit': return 'in the shrine by the Forest Temple';
        case 'waterfallCave': return 'in the Cave Village';
        case 'treeVillage': return 'in the Vanara Village';
        case 'peachCave': return 'in the dark cave by the lake';
        case 'peachCaveSpirit': return 'in a cave in the spirit world';
        case 'tomb': return 'in the Vanara Tomb';
        case 'warTemple': return 'in the Summoner Ruins';
        case 'cocoon': return 'in the Cocoon behind the Vanara Tomb';
        case 'helix': return 'in the Helix';
        case 'forestTemple': return 'in the Forest Temple';
        case 'waterfallTower': return 'in the Waterfall Tower';
        case 'forge': return 'in the Forge';
        case 'grandTemple': return 'in the Grand Temple';
        case 'skyPalace': return 'in the Sky Palace';
        case 'jadePalace': return 'in the Jade Palace';
        case 'riverTemple': return 'in the Lake Ruins';
        case 'crater': return 'in the Volcano Crater';
        case 'staffTower': return 'in the Staff Tower';
        case 'warPalace': return 'in the Palace of War';
        case 'lab': return 'in the Hidden Laboratory';
        case 'tree': return 'in the World Tree';
        case 'void': return 'in the abyss of space';
        case 'gauntlet': return 'in the Gauntlet under the Grand Temple';
        case 'holySanctum': return 'in the Holy Sanctum of the Jade Palace';
    }
    // The type of this should just be `void` if all zones are handled.
    return zone;
}

export function getRandomizerHint(state: GameState): string {
    const reachableChecks: LootWithLocation[] = findReachableChecksFromStart(state);
    for (const check of Random.shuffle(reachableChecks)) {
        if (check.location) {
            const logicalZoneKey = check.location.logicalZoneKey;
            if (check.lootObject.type === 'dialogueLoot') {
                const npcKey = `${check.location.zoneKey}-${check.lootObject.id}`;
                if (state.savedState.objectFlags[npcKey]) {
                    continue;
                }
                return `Try talking to someone ${getRandomizerZoneDescription(logicalZoneKey)}.`;
            }
            if (state.savedState.objectFlags[check.lootObject.id]) {
                continue;
            }
            return `There is still something ${getRandomizerZoneDescription(logicalZoneKey)}.`;
        } else {
            const {dialogueKey, optionKey} = check;
            const flag = `${dialogueKey}-${optionKey}`;
            if (state.savedState.objectFlags[flag]) {
                continue;
            }
            if (dialogueKey === 'streetVendor') {
                return `The merchant has something for sale.`;
            }
            if (dialogueKey === 'storageVanara') {
                return `A vanara would be grateful for an exterminator.`;
            }
            return `Try talking to someone called ${dialogueKey}.`;
        }
    }
    return 'Looks like BK Mode to me :)';
}
