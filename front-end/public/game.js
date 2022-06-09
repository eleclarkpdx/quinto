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
// dummy function that fills your hand
const getTiles = (num_tiles) => {
    let arr = [];
    for (let i = 0; i < (num_tiles+5); ++i) {
        arr.push(i);
    }
    return arr;
}

const fillHand = () => {
    let tilesInHand = handElem.querySelectorAll("td");
    // TDOD: replace next line with with server request
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
