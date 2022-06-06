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

pub fn init_board() -> Board {
    let board: Board = [[None; 13]; 13];
    board
}

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

pub fn update_board_with_tiles(mut board: Board, tiles: Box<Vec<TileCoord>>)
    -> Result<Board, &'static str> {
    for tile_coord in *tiles {
        if board[tile_coord.y][tile_coord.x] == None {
            board[tile_coord.y][tile_coord.x] = Some(tile_coord.val);
        }
        else {
            return Err("can't place tile at already-occupied coordinates");
        }
    }
    return Ok(board);
}