pub(crate) fn create_depth_texture(
    device: &wgpu::Device,
    config: &wgpu::SurfaceConfiguration,
) -> (wgpu::Texture, wgpu::TextureView) {
    let size = wgpu::Extent3d {
        width: config.width.max(1),
        height: config.height.max(1),
        depth_or_array_layers: 1,
    };

    let desc = wgpu::TextureDescriptor {
        label: Some("Depth Texture"),
        size,
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Depth24Plus,
        usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
        view_formats: &[],
    };

    let texture = device.create_texture(&desc);
    let view = texture.create_view(&wgpu::TextureViewDescriptor::default());
    (texture, view)
}

pub(crate) fn mat4_identity() -> [f32; 16] {
    [
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
    ]
}

// Column-major (WGSL compatible): index = col * 4 + row
pub(crate) fn mat4_mul(a: [f32; 16], b: [f32; 16]) -> [f32; 16] {
    let mut m = [0.0f32; 16];
    for c in 0..4 {
        for r in 0..4 {
            let c4 = c * 4;
            m[c4 + r] =
                a[r] * b[c4] + a[4 + r] * b[c4 + 1] + a[8 + r] * b[c4 + 2] + a[12 + r] * b[c4 + 3];
        }
    }
    m
}

// WebGPU clip space: z in [0, 1]
pub(crate) fn mat4_perspective(aspect: f32, fovy_radians: f32, znear: f32, zfar: f32) -> [f32; 16] {
    let f = 1.0 / (fovy_radians * 0.5).tan();
    let nf = 1.0 / (znear - zfar);
    [
        f / aspect,
        0.0,
        0.0,
        0.0,
        0.0,
        f,
        0.0,
        0.0,
        0.0,
        0.0,
        zfar * nf,
        -1.0,
        0.0,
        0.0,
        (zfar * znear) * nf,
        0.0,
    ]
}

pub(crate) fn mat4_translate(x: f32, y: f32, z: f32) -> [f32; 16] {
    [
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, z, 1.0,
    ]
}

pub(crate) fn mat4_rotate_y(angle: f32) -> [f32; 16] {
    let (s, c) = angle.sin_cos();
    [
        c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0,
    ]
}
