//! # Canvas WebGPU Library
//!
//! A WebGPU-based canvas renderer built with Rust and compiled to WebAssembly.
//! Provides high-performance rendering for web applications.

mod adapters;

#[path = "types/mod.rs"]
mod types;

mod error;

#[path = "constants/mod.rs"]
mod constants;

mod telemetry;

pub use crate::adapters::renderer::client::Client;
pub use crate::adapters::renderer3d::client::create_client_3d as createClient3d;
pub use crate::adapters::renderer3d::client::Client3d;
pub use crate::types::Size;
