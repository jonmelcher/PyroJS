// *****************************************************************************
//  name:       getSpreadAdjustment
//  summary:    determines amount to add to a spread probability based on the
//              number of similar terrain in a square
//  parameters: occupied (PLAYER_SIZE^2)
//              terrain
//              adj (amount to add per similar terrain)
// *****************************************************************************
function getSpreadAdjustment(occupied, terrain, adj) {
    return occupied.reduce(function (acc, tile) { return tile.base === terrain ? acc + adj : acc }, 0);    
}

function getExplosionRadius() {
    return MIN_EXPLOSION_RADIUS + Math.floor(Math.random() * (MAX_EXPLOSION_RADIUS - MIN_EXPLOSION_RADIUS));
}

// *****************************************************************************
//  name:       explosion
//  summary:    explodes a gas can, spreading fire in a circle about it in level
//  parameters: tiles
//              row (location of 'gascan')
//              col (location of 'gascan')
//              maxDistance (from x, y)
// *****************************************************************************
function explosion(level, row, col, maxDistance) {

    var shiftRow = row;
    var shiftCol = col;
    var reversed = 1;
    var distance = 0;

    var _explosion = function(baseRow, baseCol) {

        if (isValidCoordinate(shiftRow, shiftCol, level.width, level.height) &&
            Math.sqrt(Math.pow(shiftRow - baseRow, 2) + Math.pow(shiftCol - baseCol, 2)) < maxDistance + 1) {
            if (level.tiles[shiftRow][shiftCol].base === 'gasCan') {
                explosion(shiftRow, shiftCol, getExplosionRadius());
            }
            else if (level.tiles[shiftRow][shiftCol].base !== 'exit') {
                level.tiles[shiftRow][shiftCol].spreadInto('fire');
            }
        }        
    };

    level.tiles[shiftRow][shiftCol].spreadInto('fire');

    while (distance < maxDistance + 1) {
        for (var i = 0; i < distance; ++i) {
            shiftRow += reversed;
            _explosion(row, col);
        }
        
        for (var i = 0; i < distance; ++i) {
            shiftCol += reversed;
            _explosion(row, col);
        }

        reversed *= -1;
        ++distance;
    }
}

// ******************************************************************************
//  name:       spreadFire
//  summary:    spreads fire probabilistically about a tile with .base === 'fire'
//              uses spreadTo to prevent over-spreading during tick
//              can also call explosion if 'gascan' is encountered
//  parameters: level
//              player
//              row (location of 'fire' tile)
//              col (location of 'fire' tile)
// ******************************************************************************
function spreadFire(level, player, row, col) {

    var fireSpreadProbability = BASE_FIRE_SPREAD_PROBABILITY;
    var occupied = level.getSquare(row, col, PLAYER_SIZE);
    var fn = function(tile) {
        
        tile.trySetFire(fireSpreadProbability, player);
        if (tile.base === 'gascan') {
            explosion(level, tile.row, tile.col, getExplosionRadius());
        }
    };

    fireSpreadProbability += getSpreadAdjustment(occupied, 'fire', FIRE_SPREAD_INCREASE);
    occupied.forEach(fn);

    if (Math.random() > FIRE_PERSISTENCE_PROBABILITY) {
        level.tiles[row][col].base = 'none';
    }    
}

// *****************************************************************************
//  name:       spreadGas
//  summary:    spreads gas probabilistically about a tile with .base === 'gas'
//              uses spreadTo to prevent over-spreading during tick
//  parameters: level
//              row (location of 'gas' tile)
//              col (location of 'gas' tile)
// *****************************************************************************
function spreadGas(level, row, col) {

    var gasSpreadProbability = BASE_GAS_SPREAD_PROBABILITY;
    var occupied = level.getSquare(row, col, PLAYER_SIZE);
    var fn = function(tile) {
        if (tile.base === 'none' && Math.random() < gasSpreadProbability) {
            tile.spreadInto('gas');
        }
    };
    
    gasSpreadProbability += getSpreadAdjustment(occupied, 'gas', GAS_SPREAD_INCREASE);
    occupied.forEach(fn);
}

// *****************************************************************************
//  name:       spreadSpreadables
//  summary:    calculates spread of spreadables to aid in calculation of the
//              next state of the level tiles
//  parameters: level
//              player
// *****************************************************************************
function spreadSpreadables(level, player) {
    
    var fn = function(tile, row, col) {
        
        if (!tile.spreadTo) {
            switch (tile.base) {
                case 'fire':
                    spreadFire(level, player, row, col);
                    break;
                case 'gas':
                    spreadGas(level, row, col);
                    break;
            }
        }
    };
    
    actOnArray2D(level.tiles, fn);
    actOnArray2D(level.tiles, function(tile) { tile.spreadTo = false });
}