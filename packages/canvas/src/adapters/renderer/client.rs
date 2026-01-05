use wasm_bindgen::prelude::*;

use crate::adapters::renderer::{buffers, pipeline, wgpu_setup};
use crate::constants::colors::CLEAR_COLOR;
use crate::telemetry::{init_subscriber, set_panic_hook};
use crate::types::Size;

/// WebGPU canvas client for high-performance rendering
#[wasm_bindgen]
#[derive(Debug)]
pub struct Client {
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: Size,
    render_pipeline: wgpu::RenderPipeline,
    vertex_buffer: wgpu::Buffer,
    num_vertices: u32,
}

#[wasm_bindgen(js_name = "createClient")]
pub async fn create_client(canvas: web_sys::HtmlCanvasElement) -> Result<Client, JsValue> {
    Client::create_impl(canvas).await
}

#[wasm_bindgen]
impl Client {
    #[allow(deprecated)]
    async fn create_impl(canvas: web_sys::HtmlCanvasElement) -> Result<Client, JsValue> {
        init_subscriber();
        set_panic_hook();

        let wgpu_setup::WgpuContext {
            surface,
            device,
            queue,
            config,
            surface_format,
            size,
        } = wgpu_setup::init(canvas).await?;

        let render_pipeline = pipeline::create_render_pipeline(&device, surface_format);
        let (vertex_buffer, num_vertices) = buffers::create_vertex_buffer(&device);

        Ok(Client {
            surface,
            device,
            queue,
            config,
            size,
            render_pipeline,
            vertex_buffer,
            num_vertices,
        })
    }

    /// Resizes the canvas
    #[wasm_bindgen]
    pub fn resize(&mut self, width: u32, height: u32) {
        if width > 0 && height > 0 {
            self.size = Size { width, height };
            self.config.width = width;
            self.config.height = height;
            self.surface.configure(&self.device, &self.config);
        }
    }

    /// Renders a frame
    pub fn draw(&mut self) {
        let output = match self.surface.get_current_texture() {
            Ok(x) => x,
            Err(e) => {
                tracing::error!("Failed to get current texture: {:?}", e);
                return;
            }
        };

        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(CLEAR_COLOR),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });

            render_pass.set_pipeline(&self.render_pipeline);
            render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
            render_pass.draw(0..self.num_vertices, 0..1);
        }

        self.queue.submit(std::iter::once(encoder.finish()));
        output.present();
    }
}
