use wasm_bindgen::prelude::*;

use crate::adapters::renderer::wgpu_setup;
use crate::adapters::renderer3d::{pipeline, resources};
use crate::telemetry::{init_subscriber, set_panic_hook};
use crate::types::Size;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Client3d {
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: Size,

    pipeline: wgpu::RenderPipeline,
    vertex_buffer: wgpu::Buffer,
    index_buffer: wgpu::Buffer,
    index_count: u32,

    uniform_buffer: wgpu::Buffer,
    bind_group: wgpu::BindGroup,

    depth_texture: wgpu::Texture,
    depth_view: wgpu::TextureView,

    angle: f32,
    auto_rotate: bool,
}

#[wasm_bindgen(js_name = "createClient3d")]
pub async fn create_client_3d(canvas: web_sys::HtmlCanvasElement) -> Result<Client3d, JsValue> {
    Client3d::create_impl(canvas).await
}

#[wasm_bindgen]
impl Client3d {
    #[allow(deprecated)]
    async fn create_impl(canvas: web_sys::HtmlCanvasElement) -> Result<Client3d, JsValue> {
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

        let (pipeline, bind_group_layout) = pipeline::create_pipeline(&device, surface_format);
        let (vertex_buffer, index_buffer, index_count) = pipeline::create_mesh_buffers(&device);

        let uniforms = pipeline::Uniforms {
            mvp: resources::mat4_identity(),
        };
        let uniform_buffer = pipeline::create_uniform_buffer(&device, &uniforms);
        let bind_group = pipeline::create_bind_group(&device, &bind_group_layout, &uniform_buffer);

        let (depth_texture, depth_view) = resources::create_depth_texture(&device, &config);

        Ok(Client3d {
            surface,
            device,
            queue,
            config,
            size,
            pipeline,
            vertex_buffer,
            index_buffer,
            index_count,
            uniform_buffer,
            bind_group,
            depth_texture,
            depth_view,
            angle: 0.0,
            auto_rotate: true,
        })
    }

    pub fn reset(&mut self) {
        self.angle = 0.0;
    }

    #[wasm_bindgen(js_name = "setAutoRotate")]
    pub fn set_auto_rotate(&mut self, enabled: bool) {
        self.auto_rotate = enabled;
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        if width > 0 && height > 0 {
            self.size = Size { width, height };
            self.config.width = width;
            self.config.height = height;
            self.surface.configure(&self.device, &self.config);
            let (depth_texture, depth_view) =
                resources::create_depth_texture(&self.device, &self.config);
            self.depth_texture = depth_texture;
            self.depth_view = depth_view;
        }
    }

    pub fn draw(&mut self) {
        if self.auto_rotate {
            self.angle += 0.01;
        }

        let aspect = (self.config.width.max(1) as f32) / (self.config.height.max(1) as f32);
        let proj = resources::mat4_perspective(aspect, 60.0f32.to_radians(), 0.1, 100.0);
        let view = resources::mat4_translate(0.0, 0.0, -2.5);
        let model = resources::mat4_rotate_y(self.angle);
        let mv = resources::mat4_mul(view, model);
        let mvp = resources::mat4_mul(proj, mv);

        let uniforms = pipeline::Uniforms { mvp };
        self.queue
            .write_buffer(&self.uniform_buffer, 0, bytemuck::bytes_of(&uniforms));

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
                label: Some("3D Render Encoder"),
            });

        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("3D Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.06,
                            g: 0.08,
                            b: 0.10,
                            a: 1.0,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: &self.depth_view,
                    depth_ops: Some(wgpu::Operations {
                        load: wgpu::LoadOp::Clear(1.0),
                        store: wgpu::StoreOp::Store,
                    }),
                    stencil_ops: None,
                }),
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });

            pass.set_pipeline(&self.pipeline);
            pass.set_bind_group(0, &self.bind_group, &[]);
            pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
            pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint16);
            pass.draw_indexed(0..self.index_count, 0, 0..1);
        }

        self.queue.submit(std::iter::once(encoder.finish()));
        output.present();
    }
}
