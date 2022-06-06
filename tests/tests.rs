use web_server::game;

#[test]
fn get_some_tiles() {
    let mut tiles;
    tiles = get_tiles(0);
    println!("{:?}", tiles);
    tiles = get_tiles(1);
    println!("{:?}", tiles);
    tiles = get_tiles(2);
    println!("{:?}", tiles);
    tiles = get_tiles(3);
    println!("{:?}", tiles);
    tiles = get_tiles(4);
    println!("{:?}", tiles);
    tiles = get_tiles(5);
    println!("{:?}", tiles);
    tiles = get_tiles(6);
    println!("{:?}", tiles);
}