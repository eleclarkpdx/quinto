use rand::Rng;

fn init_board() -> [[Option<u8>; 13 ]; 13] {
    let board: [[Option<u8>; 13]; 13] = [[None; 13]; 13];
    board
}

fn get_tiles(num_tiles_needed: u8) -> Box<Vec<u8>> {
    let mut tiles: Vec<u8> = vec![];
    let mut rng = rand::thread_rng();
    for i in 0..(usize::from(num_tiles_needed)) {
        tiles[i] = rng.gen();
        println!("{:?}", tiles[i]);
    }
    Box::new(tiles)
}