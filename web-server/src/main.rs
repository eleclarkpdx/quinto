mod game;

use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream)
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];

    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";

    if buffer.starts_with(get) {

        let contents = "{\"Hello\": \"World\"}";
        let headers = [format!("Content-Length: {}", contents.len()).as_str(), 
                        "Content-Type: application/json",
                        "X-Content-Type-Options: nosniff"]
                        .join("\r\n");
        send_response(stream, "HTTP/1.1 200 OK", contents, headers);
    } else {
        handle_404(stream);
    }

}

fn handle_404(stream: TcpStream) {
        let contents = "Invalid request";
        let headers = [format!("Content-Length: {}", contents.len()).as_str(), 
                        "X-Content-Type-Options: nosniff"]
                        .join("\r\n");
        send_response(stream, "HTTP/1.1 404 Not Found", contents, headers)
}

fn send_response(mut stream: TcpStream, status: &str, contents: &str, headers: String) {
        let response = format!(
            "{}\r\n{}\r\n\r\n{}",
            status,
            headers,
            contents
        );
        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
}

#[cfg(test)]
mod tests;
