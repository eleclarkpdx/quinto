use super::game;

#[test]
fn get_some_tiles() {
    let mut tiles;
    for i in 0..10 {
        tiles = game::get_tiles(i);
        println!("{:?}", tiles);
    }
}
