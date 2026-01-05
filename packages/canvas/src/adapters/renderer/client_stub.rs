#[derive(Debug)]
pub struct Client;

impl Client {
    pub fn new() -> Client {
        Client
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn client_is_constructible_on_host() {
        let _client = Client::new();
    }
}
