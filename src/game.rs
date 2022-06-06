use rand::{Rng, distributions::*};

pub fn init_board() -> [[Option<u8>; 13 ]; 13] {
    let board: [[Option<u8>; 13]; 13] = [[None; 13]; 13];
    board
}

pub fn get_tiles(num_tiles_needed: u8) -> Box<Vec<u8>> {
    if num_tiles_needed == 0 {
        return Box::new(vec![]);
    }
    let between = Uniform::from(0..10);
    let mut rng = rand::thread_rng();
    let mut tiles: Vec<u8> = vec![];
    for i in 0..(usize::from(num_tiles_needed)) {
        tiles.push(between.sample(&mut rng));
    }
    Box::new(tiles)
}
