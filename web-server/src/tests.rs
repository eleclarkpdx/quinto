use crate::game::init_board;

use super::game::*;

// run this test individually with the nocapture flag to see the output.
#[test]
fn generate_some_tiles() {
    let mut tiles: Vec<u8>;
    for i in 0..10 {
        tiles = *generate_tiles(i);
        println!("{:?}", tiles);
    }
}

// run this test individually with the nocapture flag to see the output.
#[test]
fn play_some_tiles() {
    let num_tiles = 5;
    let board = init_board();
    let tiles = *generate_tiles(num_tiles);
    let mut tile_coords: Vec<TileCoord> = vec![];
    let mut i = 0;
    for tile in &tiles {
        tile_coords.push(TileCoord{val: *tile, x: i, y: i});
        i += 1;
    }
    // TODO: DRY
    match update_board_with_tiles(board, Box::new(tile_coords)) {
        Ok(board) =>
            for line in board {
                println!("{:?}", line);
            }
        Err(e) => println!("{}", e)
    }
}