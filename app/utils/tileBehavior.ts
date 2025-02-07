import {
    AreaInstance, FullTile, Tile, TileBehaviors,
} from 'app/types';

// This resets the tile behavior for a specific tile to whatever the combined behavior of the layers are.
// This is useful when an object in a tile was overriding the tile behavior beneath it and we need to
// reconstruct the original behavior after the object is removed.
export function resetTileBehavior(area: AreaInstance, {x, y}: Tile): void {
    delete area.behaviorGrid?.[y]?.[x];
    for (const layer of area.layers) {
        const tile = layer.tiles[y]?.[x];
        if (!tile) {
            continue;
        }
        const isForeground = (layer.definition.drawPriority ?? layer.definition.key) === 'foreground';
        // Masked tiles are assumed not to set any behaviors as they are mostly hidden by the mask.
        if (layer.definition.mask?.tiles?.[y]?.[x]) {
            continue;
        }
        // The behavior grid combines behaviors of all layers, with higher layers
        // overriding the behavior of lower layers.
        if (tile.behaviors) {
            if (!area.behaviorGrid[y]) {
                area.behaviorGrid[y] = [];
            }
            applyTileToBehaviorGrid(area.behaviorGrid, {x, y}, tile, isForeground);
        }
    }
}

export function applyBehaviorToTile(area: AreaInstance, x: number, y: number, behavior: TileBehaviors): void {
    if (!area.behaviorGrid[y]) {
        area.behaviorGrid[y] = [];
    }
    if (!area.behaviorGrid[y][x]) {
        area.behaviorGrid[y][x] = {};
    }
    area.behaviorGrid[y][x] = {...area.behaviorGrid[y][x], ...behavior};
}

export function applyLedgesToBehaviorGridTile(behaviorGrid: TileBehaviors[][], x: number, y: number, ledges: TileBehaviors['ledges']): void {
    if (!behaviorGrid[y]) {
        behaviorGrid[y] = [];
    }
    if (!behaviorGrid[y][x]) {
        behaviorGrid[y][x] = {};
    }
    if (!behaviorGrid[y][x].ledges) {
        behaviorGrid[y][x].ledges = ledges
    } else {
        behaviorGrid[y][x].ledges = {...behaviorGrid[y][x].ledges, ...ledges};
    }
}

export function removeLedgeFromBehaviorTileGrid(behaviorGrid: TileBehaviors[][], x: number, y: number, key: 'up' | 'down' | 'left' | 'right'): void {
    if (!behaviorGrid[y]?.[x]?.ledges) {
        return;
    }
    delete behaviorGrid[y][x].ledges[key];
    if (!Object.keys(behaviorGrid[y][x].ledges).length) {
        delete behaviorGrid[y][x].ledges;
    }
}

export function applyTileToBehaviorGrid(
    behaviorGrid: TileBehaviors[][],
    {x, y}: Tile,
    tile: FullTile,
    isForeground: boolean,
): void {
    const behaviors = tile.behaviors;
    // Tiles 0/1 are the null and empty tile and should not impact the tile behavior.
    if (!behaviors || tile.index < 2) {
        return;
    }
    // Lava + clouds erase the behaviors of tiles underneath them.
    if (behaviors.isLava || behaviors.cloudGround || behaviors.isGround === true) {
        // Undo ledges that might have been set by this tile to adjacent tiles when we clear false ledges.
        if (behaviorGrid[y][x]?.ledges?.up === false && y > 0) {
            removeLedgeFromBehaviorTileGrid(behaviorGrid, x, y - 1, 'down');
        }
        if (behaviorGrid[y][x]?.ledges?.down === false && y < behaviorGrid.length - 1) {
            removeLedgeFromBehaviorTileGrid(behaviorGrid, x, y + 1, 'up');
        }
        if (behaviorGrid[y][x]?.ledges?.left === false && x > 0) {
            removeLedgeFromBehaviorTileGrid(behaviorGrid, x - 1, y, 'right');
        }
        if (behaviorGrid[y][x]?.ledges?.right === false && x < behaviorGrid[0].length - 1) {
            removeLedgeFromBehaviorTileGrid(behaviorGrid, x + 1, y, 'left');
        }
        behaviorGrid[y][x] = {};
    }
    // Any background tile rendered on top of lava removes the lava behavior from it.
    if (!isForeground && behaviorGrid[y]?.[x]
        && !behaviors.isLava && !behaviors.isLavaMap && behaviors.isGround !== false
    ) {
        delete behaviorGrid[y][x].isLava;
        delete behaviorGrid[y][x].isLavaMap;
    }
    // Any background tile rendered on top of a pit removes the pit behavior.
    // If this causes issues with decorations like shadows we may need to explicitly set pit = false
    // on tiles that can cover up pits (like in the sky) and use that, or alternatively, make a separate
    // sky behavior that has this behavior instead of pits.
    if (!isForeground && behaviorGrid[y]?.[x]?.pit && !behaviors.pit && behaviors.isGround !== false) {
        delete behaviorGrid[y][x].pit;
    }
    if (!isForeground && behaviorGrid[y]?.[x]?.shallowWater && !behaviors.shallowWater && behaviors.isGround !== false) {
        delete behaviorGrid[y][x].shallowWater;
    }
    if (!isForeground && behaviorGrid[y]?.[x]?.water && !behaviors.water && behaviors.isGround !== false) {
        delete behaviorGrid[y][x].water;
    }
    if (!isForeground && behaviorGrid[y]?.[x]?.slippery && !behaviors.slippery && behaviors.isGround !== false) {
        delete behaviorGrid[y][x].slippery;
    }
    if (!isForeground && behaviorGrid[y]?.[x]?.cloudGround && !behaviors.cloudGround) {
        delete behaviorGrid[y][x].cloudGround;
    }
    const lightRadius = Math.max(behaviorGrid[y][x]?.lightRadius || 0, behaviors.lightRadius || 0);
    const brightness = Math.max(behaviorGrid[y][x]?.brightness || 0, behaviors.brightness || 0);
    const baseSolidMap = behaviorGrid[y][x]?.solidMap;
    behaviorGrid[y][x] = {...(behaviorGrid[y][x] || {}), ...behaviors, lightRadius, brightness};
    if (!behaviorGrid[y]?.[x]?.solid && baseSolidMap && behaviors.solidMap) {
        behaviorGrid[y][x].solidMap = new Uint16Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        for (let row = 0; row < 16; row++) {
            behaviorGrid[y][x].solidMap[row] = baseSolidMap[row] | behaviors.solidMap[row];
        }
    }
    // It is convenient for the projectile hit detection system to assume that ledges are always defined as going down
    // from the current tile into the adjacent tile, so we conver all false ledges (which are used to specify the reverse direction)
    // to setting true ledges on the tile they are next to.
    if (behaviors.ledges?.up === false && y > 0) {
        applyLedgesToBehaviorGridTile(behaviorGrid, x, y - 1, {down: true});
    }
    if (behaviors.ledges?.down === false && y < behaviorGrid.length - 1) {
        applyLedgesToBehaviorGridTile(behaviorGrid, x, y + 1, {up: true});
    }
    if (behaviors.ledges?.left === false && x > 0) {
        applyLedgesToBehaviorGridTile(behaviorGrid, x - 1, y, {right: true});
    }
    if (behaviors.ledges?.right === false && x < behaviorGrid[0].length - 1) {
        applyLedgesToBehaviorGridTile(behaviorGrid, x + 1, y, {left: true});
    }
}
