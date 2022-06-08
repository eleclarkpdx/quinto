const handElem = document.querySelector("#hand");
const boardElem = document.querySelector("#board");
const boardWidth = 13;
const boardHeight = 13;
const moveOk = document.querySelector("#move-ok");
const moveCancel = document.querySelector("#move-cancel");
let state = "thinking";
let move = [];

moveOk.addEventListener("click", function handleClick(event) {
    if (state == "playing") {
        console.log(submitMove());
        state = "thinking";
    }
    Array.from(document.querySelectorAll(".playing-tile")).forEach((tile) => {
        tile.setAttribute("class", "played-tile");
    });
    Array.from(handElem.querySelectorAll(".empty-tile")).forEach((tile) => {
        tile.remove();
    });
});

moveCancel.addEventListener("click", function handleClick(event) {
    Array.from(document.querySelectorAll(".playing-tile")).forEach((tile) => {
        tile.setAttribute("class", "empty-tile");
        tile.innerHTML = " ";
    });
    Array.from(handElem.querySelectorAll(".empty-tile")).forEach((tile) => {
        tile.setAttribute("class", "tile");
    });
});


// dummy function that fills your hand
const getTiles = (num_tiles) => {
    return [0, 1, 2, 3, 4];
}

const fillHand = () => {
    let tilesInHand = Array.from(handElem.getElementsByTagName("td"));
    // TDOD: replace next line with with server request
    let drawnTiles = getTiles(5 - tilesInHand.length);
    tilesInHand = tilesInHand.concat(drawnTiles);
    for (let i = 0; i < tilesInHand.length; ++i) {
        let newTile = document.createElement("td");
        newTile.setAttribute("class", "tile");
        newTile.setAttribute("id", `hand${i}`);
        newTile.innerHTML = tilesInHand[i];
        handElem.append(newTile);
    }

    let handTileElems = document.querySelectorAll(".tile");
    handTileElems.forEach(handTileElem => {
        handTileElem.addEventListener("click", function handleClick(event) {
            playHand(handTileElems, handTileElem)
        });
    });
}

const initBoard = () => {
    for (let y = 0; y < boardHeight; ++y) {
        let newRow = document.createElement("tr");
        boardElem.append(newRow);
        let newRowElem = boardElem.querySelectorAll("tr")[y];
        for (let x = 0; x < boardWidth; ++x) {
            let newTile = document.createElement("td");
            newTile.setAttribute("class", "empty-tile");
            newTile.innerHTML = " ";
            newRowElem.append(newTile);
        }
    }
    let centerCell = boardElem.querySelectorAll("td")[(13*6)+6];
    centerCell.innerHTML = 5;
    centerCell.setAttribute("class","played-tile");
}

const playHand = (hand, playingThisTile) => {
    if (state === "thinking") {
        move = [];
    }
    playTile(playingThisTile);
    state = "playing";
}
    
const playTile = (playingThisTile) => {
    playingThisTile.setAttribute("class", "empty-tile");
    //setPlayableLocations();

    let board = boardElem.querySelectorAll("td");
    let playableLocations = Array.from(document.querySelectorAll(".empty-tile"));
    for (let i = 0; i < board.length; ++i) {
        if (playableLocations.includes(board[i])) {
            board[i].addEventListener("click", function handleClick(event) {
                if (playingThisTile) {
                    board[i].setAttribute("class", "playing-tile");
                    board[i].innerHTML = playingThisTile.innerHTML;
                    move.push([playingThisTile.innerHTML, i]);
                    playingThisTile = null;
                }
            });
        }
    }
}

/*
// wildly inefficient
const setPlayableLocations = () => {
    let openTiles = boardElem.querySelectorAll(".open-tile");
    openTiles.forEach((tile) => {
        tile.removeAttribute("class");
    });

    if (state == "thinking") {
        let board = boardElem.querySelectorAll("td");
        let occupied = []; 
        for (let x = 0; x < boardWidth; ++x) {
            for (let y = 0; y < boardHeight; ++y) {
                if (board[(boardWidth*y) + x].innerHTML != " ") {
                    occupied.push([x, y]);
                }
            }
        }
        // TODO: DRY
        for (let i = 0; i < occupied.length; ++i) {
            let up = board[boardWidth*(occupied[i][1]-1) + occupied[i][0]];
            if (up.innerHTML == " ") {
                up.setAttribute("class","open-tile");
            }
            let down = board[boardWidth*(occupied[i][1]+1) + occupied[i][0]];
            if (down.innerHTML == " ") {
                down.setAttribute("class","open-tile");
            }
            let left = board[(boardWidth*occupied[i][1]) + (occupied[i][0]-1)];
            if (left.innerHTML == " ") {
                left.setAttribute("class","open-tile");
            }
            let right = board[(boardWidth*occupied[i][1]) + (occupied[i][0]+1)];
            if (right.innerHTML == " ") {
                right.setAttribute("class","open-tile");
            }
        }
    }
    else if (state == "playing") {
        let lastMove = move[move.length - 1];
        let upOccupied = ((lastMove[1]-boardWidth) !== " ");
        let downOccupied = ((lastMove[1]+boardWidth) !== " ");
        let leftOccupied = ((lastMove[1]-1) !== " ");
        let rightOccupied = ((lastMove[1]+1) !== " ");
        if leftOccupied
    }
}
*/

// a move must
// 1) touch a pre-existing tile
// 2) be played in a line
// 3) not cause the board to contain more than 5 tiles in sequence without empty spaces
// 4) sum to a multiple of 5 on all axes
const submitMove = () => {
    let board = boardElem.querySelectorAll("td");
    let floating = true;
    for (let i = 0; i < move.length; ++i) {
        let tile = move[i];
        // TODO: undefined near borders (eg if you play a tile at (11,0), then tile[1]-boardwidth is out of bounds)
        let left = board[tile[1]-1].classList;
        let right = board[tile[1]+1].classList;
        let up = board[tile[1]-boardWidth].classList;
        let down = board[tile[1]+boardWidth].classList;
        if (!((left.contains("empty-tile") || left.contains("playing-tile")) &&
            (right.contains("empty-tile") || right.contains("playing-tile")) &&
            (up.contains("empty-tile") || up.contains("playing-tile")) &&
            (down.contains("empty-tile") || down.contains("playing-tile")))) {
            floating = false;
        }
    };
    if (floating === true) {
        return false;
    }

    let isColumn = false;
    let isRow = false;
    let prevCoord = move[0][1];
    for (let i = 1; i < move.length; ++i) {
        if ((prevCoord === move[i][1]-13) || (prevCoord === move[i][1]+13)) {
            isColumn = true;
        }
        else if ((prevCoord === move[i][1]-1) || (prevCoord === move[i][1]+1)) {
            isRow = true;
        }
        prevCoord = move[i][1];
    }
    if (isColumn && isRow) {
        return false;
    }

    // TODO: DRY
    // this is the least-efficient way you could possibly do it
    let colCount = 0;
    let maxColCount = colCount;
    for (let x = 0; x < boardWidth; ++x) {
        for (let y = 0; y < boardHeight; ++y) {
            yCoord = y * boardWidth;
            if (board[yCoord + x].classList.contains("empty-tile")) {
                if (colCount > maxColCount) {
                    maxColCount = colCount;
                }
                colCount = 0;
            }
            else {
                colCount += 1;
            }
        }
    }    
    if (maxColCount > 5) {
        return false;
    }
    let rowCount = 0;
    let maxRowCount = rowCount;
    for (let y = 0; y < boardHeight; ++y) {
        for (let x = 0; x < boardWidth; ++x) {
            yCoord = y * boardWidth;
            if (board[yCoord + x].classList.contains("empty-tile")) {
                if (rowCount > maxRowCount) {
                    maxRowCount = rowCount;
                }
                rowCount = 0;
            }
            else {
                rowCount += 1;
            }
        }
    }    
    if (maxRowCount > 5) {
        return false;
    }




    return true;
}


const getScore = () => {

}