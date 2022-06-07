use rand::distributions::*;

type Board = [[Option<u8>; 13]; 13];

// represents a quinto tile (0-9) and the coordinate it's placed at.
// i would rather x & y be u8s, but rust doesn't like indexing arrays with u8s,
// and ease-of-indexing is the point of having coordinates, so...
pub struct TileCoord {
    // the value of the quinto tile (0-9)
    pub val: u8,
    // the x-coordinate of the tile on the board (0-12)
    pub x: usize,
    // the y-coordinate of the tile on the board (0-12)
    pub y: usize
}

// Create a new empty Board (empty = all array entries are None.)
pub fn init_board() -> Board {
    let mut board: Board = [[None; 13]; 13];
    board[6][6] = Some(5);
    board
}

// Randomly generate `num_tile_needed` values of 0-9.  
pub fn generate_tiles(num_tiles_needed: u8) -> Box<Vec<u8>> {
    if num_tiles_needed == 0 {
        return Box::new(vec![]);
    }
    let between = Uniform::from(0..10);
    let mut rng = rand::thread_rng();
    let mut tiles: Vec<u8> = vec![];
    for _i in 0..(usize::from(num_tiles_needed)) {
        tiles.push(between.sample(&mut rng));
    }
    Box::new(tiles)
}

// When given a pre-existing Board and a list of tiles-with-coordinates,
// Replace the None values at those coordinates with the given tiles.
// This function shouls be used to play tiles on the board.
// Returns Err if any of the coordinates are already occupied with a non-None value.
pub fn update_board_with_tiles(mut board: Board, tiles: Box<Vec<TileCoord>>)
    -> Result<Board, &'static str> {
    for tile_coord in *tiles {
        if (tile_coord.x > 12) || (tile_coord.y > 12) {
            return Err("coordinate index out of range");
        }
        if board[tile_coord.y][tile_coord.x] == None {
            board[tile_coord.y][tile_coord.x] = Some(tile_coord.val);
        }
        else {
            return Err("can't place tile at already-occupied coordinates");
        }
    }
    return Ok(board);
}

pub fn is_move_legal(mut board: Board, tile_move: Box<Vec<TileCoord>>)
    -> bool {
    // is the move in a line of length <5?
    // does the move connect to a preexisting tile? (should be skipped if this is the first move)
    // does the move sum to %5?
    todo!()
}