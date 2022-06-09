const handElem = document.querySelector("#hand");
const boardElem = document.querySelector("#board");
const boardWidth = 13;
const boardHeight = 13;
const submitMove = document.querySelector("#move-ok");
const moveCancel = document.querySelector("#move-cancel");
let state = "thinking";
let move = [];
let totalScore = 0;
let currentScore = 0;

submitMove.addEventListener("click", function handleClick(event) {
    if (state == "playing") {
        state = "thinking";
    }
    if (moveOk()) {
        Array.from(document.querySelectorAll(".playing-tile")).forEach((tile) => {
            tile.setAttribute("class", "played-tile");
        });
        Array.from(document.querySelectorAll(".played-hand-tile")).forEach((tile) => {
            tile.remove();
        });
        fillHand();
        document.querySelector("#total-score").innerHTML = totalScore;
    }
    else {
        cancelMove();
    }
    move = [];
});


moveCancel.addEventListener("click", function handleClick(event) {
    cancelMove();
    move = [];
});


const getTiles = (num_tiles) => {
    let arr = [];
    for (let i = 0; i < (num_tiles); ++i) {
        arr.push(Math.floor((Math.random()*10)));
    }
    return arr;
}

const fillHand = () => {
    let tilesInHand = handElem.querySelectorAll("td");
    let drawnTiles = getTiles(5 - tilesInHand.length);
    for (let i = 0; i < drawnTiles.length; ++i) {
        let newTile = document.createElement("td");
        newTile.setAttribute("class", "tile");
        newTile.setAttribute("id", `hand${i}`);
        newTile.innerHTML = drawnTiles[i];
        handElem.append(newTile);
    }

    let handTileElems = document.querySelectorAll(".tile");
    handTileElems.forEach(handTileElem => {
        handTileElem.addEventListener("click", function handleClick(event) {
            if (!document.querySelector(".playing-hand-tile")) {
                playHand(handTileElems, handTileElem)
            }
        });
    });
}

const getRooms = () => {
  let rooms = document.querySelector("#rooms")
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", "list_rooms", false);
  xmlHttp.send(null);
  console.log(xmlHttp.responseText);
  rooms.innerHTML = `<h2>Rooms:</h2><ul><li>${xmlHttp.responseText}</li></ul>`
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
    playingThisTile.setAttribute("class", "playing-hand-tile");

    let board = boardElem.querySelectorAll("td");
    let playableLocations = Array.from(document.querySelectorAll(".empty-tile"));
    for (let i = 0; i < board.length; ++i) {
        if (playableLocations.includes(board[i])) {
            board[i].addEventListener("click", function handleClick(event) {
                if (playingThisTile) {
                    playingThisTile.setAttribute("class", "played-hand-tile");
                    board[i].setAttribute("class", "playing-tile");
                    board[i].innerHTML = playingThisTile.innerHTML;

                    pushOk = true;
                    move.forEach((tile) => {
                        if (tile[1] === i) {
                            pushOk = false;
                        }
                    });
                    if (pushOk === true) {
                        move.push([playingThisTile.innerHTML, i]);
                    }
                    playingThisTile = null;
                }
            });
        }
    }
}

// a move must
// 1) touch a pre-existing tile
// 2) be played in a line
// 3) not cause the board to contain more than 5 tiles in sequence without empty spaces
// 4) sum to a multiple of 5 on all axes
const moveOk = () => {
    //skipping your turn is always okay
    if (move.length === 0) {
        return true;
    }
    let board = boardElem.querySelectorAll("td");
    let floating = true;
    for (let i = 0; i < move.length; ++i) {
        let tile = move[i];
        let [left, right, up, down] = [
            (board[tile[1]-1])? board[tile[1]-1].classList : null,
            (board[tile[1]+1])? board[tile[1]+1].classList : null,
            (board[tile[1]-13])? board[tile[1]-13].classList : null,
            (board[tile[1]+13])? board[tile[1]+13].classList : null,
        ]
        if ((left !== null && left.contains("played-tile")) ||
            (right !== null && right.contains("played-tile")) || 
            (up !== null && up.contains("played-tile")) || 
            (down !== null && down.contains("played-tile"))) {
            floating = false;
        }
    };
    if (floating === true) {
        return false;
    }

    let isColumn = true;
    let isRow = true;
    let col = null;
    for (let x = 0; x < boardWidth; x++) {
        for (let y = 0; y < boardHeight; y++) {
            yCoord = y * boardWidth;
            if (board[yCoord + x].classList.contains("playing-tile")) {
                if (col === null) {
                    col = x;
                }
                else if (col !== x) {
                    isColumn = false;
                }
            }
        }
    }
    let row = null;
    for (let y = 0; y < boardWidth; y++) {
        for (let x = 0; x < boardHeight; x++) {
            yCoord = y * boardWidth;
            if (board[yCoord + x].classList.contains("playing-tile")) {
                if (row === null) {
                    row = y;
                }
                else if (row !== y) {
                    isRow = false;
                }
            }
        }
    }
    console.log(`isColumn=${isColumn} && isRow=${isRow}`);
    if (!isRow && !isColumn) {
        return false;
    }

    // TODO: DRY
    // this is the least-efficient way you could possibly do it
    let colCount = 0;
    let maxColCount = colCount;
    for (let x = 0; x < boardWidth; ++x) {
        for (let y = 0; y < boardHeight; ++y) {
            yCoord = y * boardWidth;
            if (((yCoord + x)%13 === 0) || board[yCoord + x].classList.contains("empty-tile")) {
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
            if (((yCoord + x)%13 === 0) || board[yCoord + x].classList.contains("empty-tile")) {
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

    let score = getScore(isColumn, isRow);
    if (score%5 !== 0) {
        return false;
    }
    else {
        totalScore += score;
    }

    return true;
}

const cancelMove = () => {
    Array.from(document.querySelectorAll(".playing-tile")).forEach((tile) => {
        tile.setAttribute("class", "empty-tile");
        tile.innerHTML = " ";
    });
    Array.from(handElem.querySelectorAll(".played-hand-tile")).forEach((tile) => {
        tile.setAttribute("class", "tile");
    });
}

// this could really use an array
const getScore = (isColumn, isRow) => {
    let board = boardElem.querySelectorAll("td");
    let coreScore = 0;
    let auxScore = 0;
    let valid = true;
    if (isRow && isColumn) {
        //can only occur if only one tile was played
        tile = move[0];
        let [upScore, downScore, leftScore, rightScore] = [0, 0, 0, 0];
        let tileScore = parseInt(tile[0]);
        if (board[tile[1]-13].innerHTML !== " ") {
            upScore = sumUp(tile[1]-13) + tileScore;
        }
        if (board[tile[1]+13].innerHTML !== " ") {
            downScore = sumDown(tile[1]+13) + tileScore;
        }
        if (board[tile[1]-1].innerHTML !== " ") {
            leftScore = sumLeft(tile[1]-1) + tileScore;
        }
        if (board[tile[1]+1].innerHTML !== " ") {
            rightScore = sumRight(tile[1]+1) + tileScore;
        }
        if ((leftScore%5 !== 0) || (rightScore%5 !== 0) || (upScore%5 !== 0) || (downScore%5 !== 0)) {
            valid = false;
        }
        auxScore += leftScore + rightScore + upScore + downScore;
    }
    else if (isRow) {
        let left = getFurthestRowTile(move[0][1], -1);
        let rightmost = getFurthestRowTile(move[0][1], 1);
        while (left <= rightmost) {
            coreScore += parseInt(board[left].innerHTML);
            left += 1;
        }
        move.forEach((tile) => {
            let upScore = 0;
            let downScore = 0;
            let tileScore = parseInt(tile[0]);
            if (board[tile[1]-13].innerHTML !== " ") {
                upScore = sumUp(tile[1]-13) + tileScore;
            }
            if (board[tile[1]+13].innerHTML !== " ") {
                downScore = sumDown(tile[1]+13) + tileScore;
            }
            if ((upScore%5 !== 0) || (downScore%5 !== 0)) {
                valid = false;
            }
            auxScore += upScore + downScore;
        });
    }
    else if (isColumn) {
        let high = getFurthestColTile(move[0][1], -13);
        let lowest = getFurthestColTile(move[0][1], 13);
        while (high <= lowest) {
            coreScore += parseInt(board[high].innerHTML);
            high += 13;
        }
        move.forEach((tile) => {
            let leftScore = 0;
            let rightScore = 0;
            let tileScore = parseInt(tile[0]);
            if (board[tile[1]-1].innerHTML !== " ") {
                leftScore = sumLeft(tile[1]-1) + tileScore;
            }
            if (board[tile[1]+1].innerHTML !== " ") {
                rightScore = sumRight(tile[1]+1) + tileScore;
            }
            if ((leftScore%5 !== 0) || (rightScore%5 !== 0)) {
                valid = false;
            }
            auxScore += leftScore + rightScore;
        });
    }
    if (valid) {
        return auxScore + coreScore;
    }
    else {
        return -1; //arbitrary invalid value
    }
}

const getFurthestRowTile = (coord, offset) => {
    let board = boardElem.querySelectorAll("td");
    let stopAt = (offset > 0)? 0 : 12;
    if ((coord < 0) || (coord%13 == stopAt) || (board[coord].classList.contains("empty-tile"))) {
        return coord-offset;
    }
    else {
        return getFurthestRowTile(coord+offset, offset);
    }
}

const getFurthestColTile = (coord, offset) => {
    let board = boardElem.querySelectorAll("td");
    if ((coord < 0) || (coord > boardWidth*boardHeight) || (board[coord].classList.contains("empty-tile"))) {
        return coord-offset;
    }
    else {
        return getFurthestRowTile(coord+offset, offset);
    }
}

const sumLeft = (coord) => {
    let board = boardElem.querySelectorAll("td");
    if ((coord%13 == 0) || (board[coord].classList.contains("empty-tile"))) {
        return 0;
    }
    else {
        return parseInt(board[coord].innerHTML) + sumLeft(coord-1);
    }
}

const sumRight = (coord) => {
    let board = boardElem.querySelectorAll("td");
    if ((coord%13 == 12) || (board[coord].classList.contains("empty-tile"))) {
        return 0;
    }
    else {
        return parseInt(board[coord].innerHTML) + sumRight(coord+1);
    }
}

const sumUp = (coord) => {
    let board = boardElem.querySelectorAll("td");
    if ((coord < 14) || (board[coord].classList.contains("empty-tile"))) {
        return 0;
    }
    else {
        return parseInt(board[coord].innerHTML) + sumUp(coord-boardWidth);
    }
}

const sumDown = (coord) => {
    let board = boardElem.querySelectorAll("td");
    if ((coord > ((boardHeight-1)*boardWidth)) || (board[coord].classList.contains("empty-tile"))) {
        return 0;
    }
    else {
        return parseInt(board[coord].innerHTML) + sumDown(coord+boardWidth);
    }
}
