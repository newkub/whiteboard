#[cfg(target_arch = "wasm32")]
pub mod client;

#[cfg(target_arch = "wasm32")]
pub(crate) mod wgpu_setup;

#[cfg(target_arch = "wasm32")]
pub(crate) mod pipeline;

#[cfg(target_arch = "wasm32")]
pub(crate) mod buffers;

#[cfg(not(target_arch = "wasm32"))]
#[path = "client_stub.rs"]
pub mod client;
pub mod vertex;
