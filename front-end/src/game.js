const handElem = document.querySelector("#hand");
const boardElem = document.querySelector("#board");
const boardWidth = 13;
const boardHeight = 13;
const moveOk = document.querySelector("#move-ok");
const moveUndo = document.querySelector("#move-undo");
const moveCancel = document.querySelector("#move-cancel");
let state = "thinking";
let move = [];

moveOk.addEventListener("click", function handleClick(event) {
    if (state == "playing") {
        submitMove();
        state = "thinking";
    }
});

// dummy function that fills your hand
const getTiles = (num_tiles) => {
    return new Array(num_tiles).fill(5);
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
            newTile.innerHTML = " ";
            newRowElem.append(newTile);
        }
    }
    let centerCell = boardElem.querySelectorAll("td")[(13*6)+6];
    centerCell.innerHTML = 5;
    centerCell.setAttribute("class","played-tile");
}

const playHand = (hand, playingThisTile) => {
    playTile(playingThisTile);
    state = "playing";
}
    
const playTile = (playingThisTile) => {
    playingThisTile.setAttribute("class", "playing-tile");
    //setPlayableLocations();

    let board = boardElem.querySelectorAll("td");
    let playableLocations = Array.from(document.querySelectorAll(".open-tile"));
    for (let i = 0; i < board.length; ++i) {
        if (playableLocations.includes(board[i])) {
            board[i].addEventListener("click", function handleClick(event) {
                board[i].setAttribute("class", "played-tile");
                board[i].innerHTML = playingThisTile.innerHTML;

                move.push([playingThisTile.innerHTML, i]);
                playingThisTile.remove();

                setPlayableLocations();
            });
        }
    }
}

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

const submitMove = () => {

}