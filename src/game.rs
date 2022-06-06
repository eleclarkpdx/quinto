use core::num;

use rand::Rng;

fn init_board() -> [[Option<u8>; 13 ]; 13] {
    let board: [[Option<u8>; 13]; 13] = [[None; 13]; 13];
    board
}

fn get_tiles(num_tiles_needed: i32) -> Box<[u8]> {
    // a player can't hold more than 5 tiles at once, so we will 
    let mut tiles: [Option<u8>; 5] = [None; 5]
    let mut rng = rand::thread_rng();
    for i in 0..num_tiles_needed {
        tiles[i] = rng.gen();
        println!(tiles[i]);
    }
    
}