use tracing_subscriber::{EnvFilter, FmtSubscriber};

pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder().with_env_filter(filter).finish();

    let _ = tracing::subscriber::set_global_default(subscriber);
}

pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}
