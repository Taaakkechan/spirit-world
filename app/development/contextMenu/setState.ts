import { cloneDeep } from 'lodash';

import { applySavedState, cleanState, getState } from 'app/state';
import { setSpawnLocation } from 'app/content/spawnLocations';
import {
    earlyDungeonSpawnLocations,
    middleDungeonSpawnLocations,
    lateDungeonSpawnLocations,
    easyBossSpawnLocations,
    storySpawnLocations,
    minimizerSpawnLocations,
    SpawnLocationOptions,
} from 'app/content/spawnStates';
import { returnToSpawnLocation } from 'app/utils/returnToSpawnLocation';

import { MenuOption } from 'app/types';

function getSpawnLocationOptions(spawnLocations: SpawnLocationOptions, useSavedState = false) {
    return Object.keys(spawnLocations).map(name => {
        return {
            label: `${name}`,
            onSelect() {
                const state = getState();
                if (useSavedState) {
                    applySavedState(state, cloneDeep(spawnLocations[name].savedState));
                }
                cleanState(state);
                setSpawnLocation(state, spawnLocations[name].location);
                returnToSpawnLocation(state);
                if (spawnLocations[name].savedState.savedHeroData.life) {
                    state.hero.life = spawnLocations[name].savedState.savedHeroData.life;
                }
                state.scene = 'game';
            }
        }
    });
}

export function getTestStateContextMenuOption(): MenuOption {
    return {
        getLabel() {
            return 'Test State...';
        },
        getChildren() {
            return [
                {
                    label: 'Early',
                    getChildren() {
                        return getSpawnLocationOptions(earlyDungeonSpawnLocations, true);
                    }
                },
                {
                    label: 'Mid',
                    getChildren() {
                        return getSpawnLocationOptions(middleDungeonSpawnLocations, true);
                    }
                },
                {
                    label: 'Late',
                    getChildren() {
                        return getSpawnLocationOptions(lateDungeonSpawnLocations, true);
                    }
                },
                {
                    label: 'Boss',
                    getChildren() {
                        return getSpawnLocationOptions(easyBossSpawnLocations, true);
                    }
                },
                {
                    label: 'Story',
                    getChildren() {
                        return getSpawnLocationOptions(storySpawnLocations, true);
                    }
                },
                {
                    label: 'Mini',
                    getChildren() {
                        return getSpawnLocationOptions(minimizerSpawnLocations, true);
                    }
                },
            ];
        }
    }
}
