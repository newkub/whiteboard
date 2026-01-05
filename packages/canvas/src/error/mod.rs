/// Error types for canvas WebGPU operations
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CanvasError {
    #[error("WebGPU not supported")]
    WebGpuNotSupported,

    #[error("Failed to create surface: {0}")]
    SurfaceCreate(String),

    #[error("Failed to request adapter: {0}")]
    AdapterRequest(String),

    #[error("Failed to request device: {0}")]
    DeviceRequest(String),

    #[error("Failed to get current texture: {0}")]
    GetCurrentTexture(String),

    #[error("Failed to configure surface: {0}")]
    SurfaceConfigure(String),
}

impl From<CanvasError> for wasm_bindgen::JsValue {
    fn from(err: CanvasError) -> Self {
        wasm_bindgen::JsValue::from_str(&err.to_string())
    }
}
