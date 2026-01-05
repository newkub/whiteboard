use wgpu::util::DeviceExt;

use crate::adapters::renderer::vertex::VERTICES;

pub(crate) fn create_vertex_buffer(device: &wgpu::Device) -> (wgpu::Buffer, u32) {
    let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("Vertex Buffer"),
        contents: bytemuck::cast_slice(VERTICES),
        usage: wgpu::BufferUsages::VERTEX,
    });

    (vertex_buffer, VERTICES.len() as u32)
}
