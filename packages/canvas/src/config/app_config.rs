use figment::providers::Format;
use figment::{
    providers::{Env, Toml},
    Figment,
};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub webgpu: WebGpuConfig,
}

#[derive(Deserialize, Debug)]
pub struct WebGpuConfig {
    pub power_preference: String,
    pub force_fallback: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            webgpu: WebGpuConfig {
                power_preference: "default".to_string(),
                force_fallback: false,
            },
        }
    }
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("CANVAS_").split("_"))
            .extract()
    }
}
