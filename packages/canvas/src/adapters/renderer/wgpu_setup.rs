use crate::error::CanvasError;
use crate::types::Size;

pub(crate) struct WgpuContext {
    pub(crate) surface: wgpu::Surface<'static>,
    pub(crate) device: wgpu::Device,
    pub(crate) queue: wgpu::Queue,
    pub(crate) config: wgpu::SurfaceConfiguration,
    pub(crate) surface_format: wgpu::TextureFormat,
    pub(crate) size: Size,
}

pub(crate) fn create_instance() -> wgpu::Instance {
    wgpu::Instance::new(&wgpu::InstanceDescriptor {
        backends: wgpu::Backends::BROWSER_WEBGPU,
        ..Default::default()
    })
}

pub(crate) fn create_surface(
    instance: &wgpu::Instance,
    canvas: web_sys::HtmlCanvasElement,
) -> Result<wgpu::Surface<'static>, CanvasError> {
    instance
        .create_surface(wgpu::SurfaceTarget::Canvas(canvas))
        .map_err(|e| CanvasError::SurfaceCreate(format!("{:?}", e)))
}

pub(crate) async fn request_adapter(
    instance: &wgpu::Instance,
    surface: &wgpu::Surface<'static>,
) -> Result<wgpu::Adapter, CanvasError> {
    instance
        .request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::default(),
            compatible_surface: Some(surface),
            force_fallback_adapter: false,
        })
        .await
        .map_err(|e| CanvasError::AdapterRequest(format!("{:?}", e)))
}

pub(crate) async fn request_device(
    adapter: &wgpu::Adapter,
) -> Result<(wgpu::Device, wgpu::Queue), CanvasError> {
    adapter
        .request_device(&wgpu::DeviceDescriptor {
            label: None,
            required_features: wgpu::Features::empty(),
            required_limits: wgpu::Limits::default(),
            memory_hints: Default::default(),
            trace: Default::default(),
            experimental_features: Default::default(),
        })
        .await
        .map_err(|e| CanvasError::DeviceRequest(format!("{:?}", e)))
}

pub(crate) fn surface_config_for_size(
    surface: &wgpu::Surface<'static>,
    adapter: &wgpu::Adapter,
    size: Size,
) -> (wgpu::SurfaceConfiguration, wgpu::TextureFormat) {
    let surface_caps = surface.get_capabilities(adapter);
    let surface_format = surface_caps
        .formats
        .iter()
        .find(|f| f.is_srgb())
        .copied()
        .unwrap_or(surface_caps.formats[0]);

    let config = wgpu::SurfaceConfiguration {
        usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
        format: surface_format,
        width: size.width,
        height: size.height,
        present_mode: surface_caps.present_modes[0],
        alpha_mode: surface_caps.alpha_modes[0],
        view_formats: vec![],
        desired_maximum_frame_latency: 2,
    };

    (config, surface_format)
}

pub(crate) async fn init(canvas: web_sys::HtmlCanvasElement) -> Result<WgpuContext, CanvasError> {
    let size = Size {
        width: canvas.width(),
        height: canvas.height(),
    };

    let instance = create_instance();
    let surface = create_surface(&instance, canvas)?;
    let adapter = request_adapter(&instance, &surface).await?;
    let (device, queue) = request_device(&adapter).await?;
    let (config, surface_format) = surface_config_for_size(&surface, &adapter, size);

    surface.configure(&device, &config);

    Ok(WgpuContext {
        surface,
        device,
        queue,
        config,
        surface_format,
        size,
    })
}
