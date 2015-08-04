// *****************************************************************************
//  filename:       helpers.js
//  purpose:        provide generic functions for pyroJS program
//  written by:     Martin Humphreys and Jonathan Melcher on July 30, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

// *****************************************************************************
//  function:   actOnArray2D
//  purpose:    act on each element of a rectangular array with a given action
//  parameters: array2D     - rectangular array
//              action      - function : (object, row, col, array) -> void
// *****************************************************************************
function actOnArray2D(array2D, action) {

    for (var i = 0; i < array2D.length; ++i) {
        for (var j = 0; j < array2D[0].length; ++j) {
            action(array2D[i][j], i, j, array2D);
        }
    }
}

function actOnSquare(array2D, row, col, squareSize, action) {

    var offset = Math.floor(squareSize / 2);
    for (var i = -offset; i < offset + 1; ++i) {
        for (var j = -offset; j < offset + 1; ++j) {
            if (isValidCoordinate(row + i, col + j, array2D[0].length, array2D.length)) {
                action(array2D[row + i][col + j], row + i, row + j, array2D);
            }
        }
    }
}

// *****************************************************************************
//  function:   searchArray2D
//  purpose:    apply a search function to each element of an array, returning
//              the first match or undefined if no matches are found
//  parameters: array2D     - rectangular array
//              startRow    - starting row of search
//              startCol    - starting column of search
//              searchFn    - function : (object, row, col, array) -> bool
// *****************************************************************************
function searchArray2D(array2D, startRow, startCol, searchFn) {
    
    for (var i = startRow; i < array2D.length; ++i) {
        for (var j = startCol; j < array2D[0].length; ++j) {
            if (searchFn(array2D[i][j], i, j, array2D)) {
                return array2D[i][j];
            }
        }
    }
    return undefined;
}

// *****************************************************************************
//  function:   createArray2D
//  purpose:    create a rectangular array given its dimensions and a function
//              to construct the elements based on coordinate
//  paramaters: height
//              width
//              constructor     - function : (row, col) -> object
// *****************************************************************************
function createArray2D(height, width, constructor) {
    
    var array2D = [];
    var row;
    for (var i = 0; i < height; ++i) {
        row = [];
        for (var j = 0; j < width; ++j) {
            row.push(constructor(i, j));
        }
        array2D.push(row);
    }
    return array2D;
}

// *****************************************************************************
//  function:   getRandomDirection
//  purpose:    retrieve a random element from the COMPASS array which serves as
//              an enumeration of the cardinal directions
//  parameters: none
// *****************************************************************************
function getRandomDirection() {
    return COMPASS[Math.floor(Math.random() * 4)];
}

// *****************************************************************************
//  function:   getOpposingDirection
//  purpose:    get the opposite direction of the given cardinal direction from
//              the COMPASS array which serves as an enumeration of the above
//  parameters: direction
//  notes:      a non-cardinal direction argument will yield undefined
// *****************************************************************************
function getOpposingDirection(direction) {
    
    var i = COMPASS.indexOf(direction);
    return i >= 0 ? COMPASS[(i + 2) % 4] : undefined;
}

// *****************************************************************************
//  function:   isValidCoordinate
//  summary:    checks if given row/col is within the range of width and height
//  parameters: row, col, width, height
// *****************************************************************************
function isValidCoordinate(row, col, width, height) {
    return row >= 0 && row < height && col >= 0 && col < width;
}