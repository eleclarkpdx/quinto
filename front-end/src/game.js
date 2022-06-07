const handElem = document.querySelector("#hand")
const boardElem = document.querySelector("#board")

// dummy function that fills your hand
const getTiles = (num_tiles) => {
    return new Array(num_tiles).fill(5);
}

const fillHand = () => {
    let tilesInHand = Array.from(handElem.getElementsByTagName("td"));
    // TDOD: replace next line with with server request
    let drawnTiles = getTiles(5 - tilesInHand.length);
    tilesInHand = tilesInHand.concat(drawnTiles);
    for (let tile in tilesInHand) {
        let newTile = document.createElement("td");
        newTile.innerHTML = `<td>${tile}</td>`
        handElem.append(newTile);
    }
}

const initBoard = () => {
    width = 13;
    height = 13;
    let board = new Array(height);
    for (let y = 0; y < height; ++y) {
        let newRow = document.createElement("tr");
        boardElem.append(newRow);
        let newRowElem = boardElem.querySelectorAll("tr")[y];
        for (let x = 0; x < width; ++x) {
            let newTile = document.createElement("td");
            newTile.innerHTML = " ";
            newRowElem.append(newTile);
        }
    }
}