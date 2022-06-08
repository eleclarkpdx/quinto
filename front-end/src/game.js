const handElem = document.querySelector("#hand")
const boardElem = document.querySelector("#board")
const boardWidth = 13;
const boardHeight = 13;
// state can be "viewing" or "playing"
let state = "viewing";

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
        newTile.setAttribute("class", "playable-tile");
        newTile.setAttribute("id", `hand${i}`);
        newTile.innerHTML = tilesInHand[i];
        handElem.append(newTile);
    }

    let handTileElems = document.querySelectorAll(".playable-tile");
    handTileElems.forEach(handTileElem => {
        handTileElem.addEventListener("click", function handleClick(event) {
            playHand(handTileElem)
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

const playHand = (playingThisTile) => {
    let handTiles = Array.from(document.querySelectorAll(".playable-tile"));
    console.log(`played tile ${playingThisTile.id}`);
    playingThisTile.setAttribute("class", "playing-tile");
    setPlayableLocations();
    
}

// wildly inefficient
const setPlayableLocations = () => {
    let board = boardElem.querySelectorAll("td");
    let occupied = []; 
    for (let x = 0; x < boardWidth; ++x) {
        for (let y = 0; y < boardHeight; ++y) {
            if (board[(boardWidth*y) + x].innerHTML != " ") {
                occupied.push([x, y]);
            }
        }
    }
    for (let i = 0; i < occupied.length; ++i) {
        // up
        board[boardWidth*(occupied[i][1]-1) + occupied[i][0]].setAttribute("class","playing-tile");
        // down
        board[boardWidth*(occupied[i][1]+1) + occupied[i][0]].setAttribute("class","playing-tile");
        // left
        board[(boardWidth*occupied[i][1]) + (occupied[i][0]-1)].setAttribute("class","playing-tile");
        // right
        board[(boardWidth*occupied[i][1]) + (occupied[i][0]+1)].setAttribute("class","playing-tile");
    }
}