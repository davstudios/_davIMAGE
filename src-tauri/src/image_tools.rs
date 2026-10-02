use exif::{In, Reader as ExifReader, Tag};
use image::codecs::jpeg::JpegEncoder;
use image::imageops::{overlay, FilterType};
use image::{DynamicImage, GenericImageView, ImageFormat, ImageReader, Rgba, RgbaImage};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;
use walkdir::WalkDir;

static CANCELLED: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub id: String,
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub format: String,
    pub supported: bool,
    pub animated: bool,
    pub warning: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MetadataInfo {
    pub camera: Option<String>,
    pub lens: Option<String>,
    pub date: Option<String>,
    pub gps: Option<String>,
    pub software: Option<String>,
    pub copyright: Option<String>,
    pub orientation: Option<String>,
    pub icc_profile: bool,
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub size: u64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessOptions {
    pub quality: u8,
    pub output_format: String,
    pub resize_mode: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub percentage: Option<f32>,
    pub rotate: i32,
    pub crop_x: Option<u32>,
    pub crop_y: Option<u32>,
    pub crop_width: Option<u32>,
    pub crop_height: Option<u32>,
    pub background: String,
    pub watermark_path: Option<String>,
    pub watermark_opacity: u8,
    pub watermark_scale: u8,
    pub watermark_position: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessRequest {
    pub paths: Vec<String>,
    pub tool: String,
    pub output_mode: String,
    pub output_folder: Option<String>,
    pub options: ProcessOptions,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessResult {
    pub path: String,
    pub output_path: Option<String>,
    pub original_size: u64,
    pub output_size: Option<u64>,
    pub status: String,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchResult {
    pub results: Vec<ProcessResult>,
    pub original_total: u64,
    pub output_total: u64,
    pub completed: usize,
    pub failed: usize,
    pub cancelled: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProgressPayload {
    index: usize,
    total: usize,
    path: String,
    status: String,
    output_path: Option<String>,
    original_size: u64,
    output_size: Option<u64>,
    error: Option<String>,
}

fn candidate_extension(path: &Path) -> String {
    path.extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_lowercase()
}

fn is_candidate(path: &Path) -> bool {
    matches!(
        candidate_extension(path).as_str(),
        "jpg" | "jpeg" | "png" | "webp" | "avif" | "gif" | "bmp" | "tif" | "tiff" | "heic" | "heif"
    )
}

fn format_name(format: Option<ImageFormat>, extension: &str) -> String {
    match format {
        Some(ImageFormat::Jpeg) => "JPEG".into(),
        Some(ImageFormat::Png) => "PNG".into(),
        Some(ImageFormat::WebP) => "WebP".into(),
        Some(ImageFormat::Avif) => "AVIF".into(),
        Some(ImageFormat::Gif) => "GIF".into(),
        Some(ImageFormat::Bmp) => "BMP".into(),
        Some(ImageFormat::Tiff) => "TIFF".into(),
        _ if extension == "heic" || extension == "heif" => "HEIC/HEIF".into(),
        _ => extension.to_uppercase(),
    }
}

fn inspect_path(path: &Path) -> ImageInfo {
    let name = path.file_name().and_then(|v| v.to_str()).unwrap_or_default().to_string();
    let extension = candidate_extension(path);
    let size = fs::metadata(path).map(|value| value.len()).unwrap_or(0);
    let guessed = ImageReader::open(path).and_then(|reader| reader.with_guessed_format());
    match guessed {
        Ok(reader) => {
            let format = reader.format();
            let dimensions = reader.into_dimensions().ok();
            let animated = matches!(format, Some(ImageFormat::Gif));
            let warning = if animated {
                Some("Animated GIF processing is currently unavailable to avoid losing frames.".into())
            } else {
                None
            };
            ImageInfo {
                id: Uuid::new_v4().to_string(),
                path: path.to_string_lossy().into_owned(),
                name,
                extension,
                size,
                width: dimensions.map(|value| value.0),
                height: dimensions.map(|value| value.1),
                format: format_name(format, &candidate_extension(path)),
                supported: !animated,
                animated,
                warning,
            }
        }
        Err(error) => ImageInfo {
            id: Uuid::new_v4().to_string(),
            path: path.to_string_lossy().into_owned(),
            name,
            extension: extension.clone(),
            size,
            width: None,
            height: None,
            format: format_name(None, &extension),
            supported: false,
            animated: false,
            warning: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn scan_images(paths: Vec<String>, recursive: bool) -> Result<Vec<ImageInfo>, String> {
    let mut files = Vec::new();
    for raw in paths {
        let path = PathBuf::from(raw);
        if path.is_file() {
            if is_candidate(&path) {
                files.push(path);
            }
            continue;
        }
        if path.is_dir() {
            let walker = if recursive {
                WalkDir::new(&path)
            } else {
                WalkDir::new(&path).max_depth(1)
            };
            for entry in walker.into_iter().filter_map(Result::ok) {
                let candidate = entry.path();
                if candidate.is_file() && is_candidate(candidate) {
                    files.push(candidate.to_path_buf());
                }
            }
        }
    }
    files.sort();
    files.dedup();
    Ok(files.iter().map(|path| inspect_path(path)).collect())
}

fn exif_value(exif: &exif::Exif, tag: Tag) -> Option<String> {
    exif.get_field(tag, In::PRIMARY)
        .map(|field| field.display_value().with_unit(exif).to_string())
}

fn contains_bytes(haystack: &[u8], needle: &[u8]) -> bool {
    haystack.windows(needle.len()).any(|window| window == needle)
}

fn has_icc_profile(path: &Path) -> bool {
    let mut data = Vec::new();
    if File::open(path).and_then(|mut file| file.read_to_end(&mut data)).is_err() {
        return false;
    }
    contains_bytes(&data, b"ICC_PROFILE") || contains_bytes(&data, b"iCCP") || contains_bytes(&data, b"acsp")
}

#[tauri::command]
pub fn inspect_metadata(path: String) -> Result<MetadataInfo, String> {
    let path_buf = PathBuf::from(&path);
    let metadata = fs::metadata(&path_buf).map_err(|error| error.to_string())?;
    let reader = ImageReader::open(&path_buf)
        .map_err(|error| error.to_string())?
        .with_guessed_format()
        .map_err(|error| error.to_string())?;
    let format = reader.format();
    let dimensions = reader.into_dimensions().map_err(|error| error.to_string())?;
    let file = File::open(&path_buf).map_err(|error| error.to_string())?;
    let mut buffered = BufReader::new(file);
    let exif = ExifReader::new().read_from_container(&mut buffered).ok();
    let camera = exif.as_ref().and_then(|data| exif_value(data, Tag::Model));
    let lens = exif.as_ref().and_then(|data| exif_value(data, Tag::LensModel));
    let date = exif.as_ref().and_then(|data| exif_value(data, Tag::DateTimeOriginal));
    let software = exif.as_ref().and_then(|data| exif_value(data, Tag::Software));
    let copyright = exif.as_ref().and_then(|data| exif_value(data, Tag::Copyright));
    let orientation = exif.as_ref().and_then(|data| exif_value(data, Tag::Orientation));
    let gps = exif.as_ref().and_then(|data| {
        let lat = exif_value(data, Tag::GPSLatitude);
        let lon = exif_value(data, Tag::GPSLongitude);
        match (lat, lon) {
            (Some(a), Some(b)) => Some(format!("{}, {}", a, b)),
            _ => None,
        }
    });
    Ok(MetadataInfo {
        camera,
        lens,
        date,
        gps,
        software,
        copyright,
        orientation,
        icc_profile: has_icc_profile(&path_buf),
        format: format_name(format, &candidate_extension(&path_buf)),
        width: dimensions.0,
        height: dimensions.1,
        size: metadata.len(),
    })
}

fn read_orientation(path: &Path) -> u32 {
    let file = match File::open(path) {
        Ok(value) => value,
        Err(_) => return 1,
    };
    let mut buffered = BufReader::new(file);
    let exif = match ExifReader::new().read_from_container(&mut buffered) {
        Ok(value) => value,
        Err(_) => return 1,
    };
    exif.get_field(Tag::Orientation, In::PRIMARY)
        .and_then(|field| field.value.get_uint(0))
        .unwrap_or(1)
}

fn orient_image(image: DynamicImage, orientation: u32) -> DynamicImage {
    match orientation {
        2 => image.fliph(),
        3 => image.rotate180(),
        4 => image.flipv(),
        5 => image.rotate90().fliph(),
        6 => image.rotate90(),
        7 => image.rotate270().fliph(),
        8 => image.rotate270(),
        _ => image,
    }
}

fn scale_dimensions(width: u32, height: u32, scale: f32) -> (u32, u32) {
    let w = ((width as f32 * scale).round() as u32).max(1);
    let h = ((height as f32 * scale).round() as u32).max(1);
    (w, h)
}

fn resize_image(image: DynamicImage, options: &ProcessOptions) -> DynamicImage {
    let (width, height) = image.dimensions();
    match options.resize_mode.as_str() {
        "width" => {
            let target = options.width.unwrap_or(width).max(1);
            let scale = target as f32 / width as f32;
            let (_, h) = scale_dimensions(width, height, scale);
            image.resize_exact(target, h, FilterType::Lanczos3)
        }
        "height" => {
            let target = options.height.unwrap_or(height).max(1);
            let scale = target as f32 / height as f32;
            let (w, _) = scale_dimensions(width, height, scale);
            image.resize_exact(w, target, FilterType::Lanczos3)
        }
        "dimensions" => image.resize_exact(
            options.width.unwrap_or(width).max(1),
            options.height.unwrap_or(height).max(1),
            FilterType::Lanczos3,
        ),
        "percentage" => {
            let scale = options.percentage.unwrap_or(100.0).max(1.0) / 100.0;
            let (w, h) = scale_dimensions(width, height, scale);
            image.resize_exact(w, h, FilterType::Lanczos3)
        }
        "longest" => {
            let target = options.width.unwrap_or(width.max(height)).max(1);
            let scale = target as f32 / width.max(height) as f32;
            let (w, h) = scale_dimensions(width, height, scale);
            image.resize_exact(w, h, FilterType::Lanczos3)
        }
        "shortest" => {
            let target = options.width.unwrap_or(width.min(height)).max(1);
            let scale = target as f32 / width.min(height) as f32;
            let (w, h) = scale_dimensions(width, height, scale);
            image.resize_exact(w, h, FilterType::Lanczos3)
        }
        "fill" => image.resize_to_fill(
            options.width.unwrap_or(width).max(1),
            options.height.unwrap_or(height).max(1),
            FilterType::Lanczos3,
        ),
        "fit" => image.resize(
            options.width.unwrap_or(width).max(1),
            options.height.unwrap_or(height).max(1),
            FilterType::Lanczos3,
        ),
        _ => image,
    }
}

fn crop_image(image: DynamicImage, options: &ProcessOptions) -> Result<DynamicImage, String> {
    let (width, height) = image.dimensions();
    let x = options.crop_x.unwrap_or(0).min(width.saturating_sub(1));
    let y = options.crop_y.unwrap_or(0).min(height.saturating_sub(1));
    let max_width = width.saturating_sub(x).max(1);
    let max_height = height.saturating_sub(y).max(1);
    let crop_width = options.crop_width.unwrap_or(max_width).min(max_width).max(1);
    let crop_height = options.crop_height.unwrap_or(max_height).min(max_height).max(1);
    Ok(image.crop_imm(x, y, crop_width, crop_height))
}

fn rotate_image(image: DynamicImage, degrees: i32) -> DynamicImage {
    match degrees.rem_euclid(360) {
        90 => image.rotate90(),
        180 => image.rotate180(),
        270 => image.rotate270(),
        _ => image,
    }
}

fn watermark_image(image: DynamicImage, options: &ProcessOptions) -> Result<DynamicImage, String> {
    let watermark_path = options.watermark_path.as_ref().ok_or("Choose a watermark image first")?;
    let mark = image::open(watermark_path).map_err(|error| error.to_string())?;
    let mut base = image.to_rgba8();
    let target_width = ((base.width() as f32 * (options.watermark_scale.max(1) as f32 / 100.0)).round() as u32).max(1);
    let ratio = target_width as f32 / mark.width().max(1) as f32;
    let target_height = ((mark.height() as f32 * ratio).round() as u32).max(1);
    let mut mark = mark.resize_exact(target_width, target_height, FilterType::Lanczos3).to_rgba8();
    let opacity = options.watermark_opacity.min(100) as f32 / 100.0;
    for pixel in mark.pixels_mut() {
        pixel.0[3] = ((pixel.0[3] as f32 * opacity).round() as u8).min(255);
    }
    let margin = ((base.width().min(base.height()) as f32 * 0.025).round() as i64).max(8);
    let max_x = base.width().saturating_sub(mark.width()) as i64;
    let max_y = base.height().saturating_sub(mark.height()) as i64;
    let (x, y) = match options.watermark_position.as_str() {
        "top-left" => (margin.min(max_x), margin.min(max_y)),
        "top-right" => ((max_x - margin).max(0), margin.min(max_y)),
        "bottom-left" => (margin.min(max_x), (max_y - margin).max(0)),
        "center" => (max_x / 2, max_y / 2),
        _ => ((max_x - margin).max(0), (max_y - margin).max(0)),
    };
    overlay(&mut base, &mark, x, y);
    Ok(DynamicImage::ImageRgba8(base))
}

fn parse_hex_color(value: &str) -> Rgba<u8> {
    let clean = value.trim().trim_start_matches('#');
    if clean.len() == 6 {
        if let Ok(rgb) = u32::from_str_radix(clean, 16) {
            return Rgba([((rgb >> 16) & 255) as u8, ((rgb >> 8) & 255) as u8, (rgb & 255) as u8, 255]);
        }
    }
    Rgba([255, 255, 255, 255])
}

fn flatten_alpha(image: DynamicImage, background: Rgba<u8>) -> DynamicImage {
    let rgba = image.to_rgba8();
    let mut output = RgbaImage::new(rgba.width(), rgba.height());
    for (x, y, pixel) in rgba.enumerate_pixels() {
        let alpha = pixel.0[3] as f32 / 255.0;
        let inv = 1.0 - alpha;
        let red = (pixel.0[0] as f32 * alpha + background.0[0] as f32 * inv).round() as u8;
        let green = (pixel.0[1] as f32 * alpha + background.0[1] as f32 * inv).round() as u8;
        let blue = (pixel.0[2] as f32 * alpha + background.0[2] as f32 * inv).round() as u8;
        output.put_pixel(x, y, Rgba([red, green, blue, 255]));
    }
    DynamicImage::ImageRgba8(output)
}

fn output_format(requested: &str, input: Option<ImageFormat>) -> (String, ImageFormat) {
    match requested.to_lowercase().as_str() {
        "jpeg" | "jpg" => ("jpg".into(), ImageFormat::Jpeg),
        "png" => ("png".into(), ImageFormat::Png),
        "webp" => ("webp".into(), ImageFormat::WebP),
        "avif" => ("avif".into(), ImageFormat::Avif),
        "tiff" | "tif" => ("tiff".into(), ImageFormat::Tiff),
        _ => match input {
            Some(ImageFormat::Jpeg) => ("jpg".into(), ImageFormat::Jpeg),
            Some(ImageFormat::Png) => ("png".into(), ImageFormat::Png),
            Some(ImageFormat::WebP) => ("webp".into(), ImageFormat::WebP),
            Some(ImageFormat::Avif) => ("avif".into(), ImageFormat::Avif),
            Some(ImageFormat::Tiff) => ("tiff".into(), ImageFormat::Tiff),
            _ => ("png".into(), ImageFormat::Png),
        },
    }
}

fn tool_suffix(tool: &str) -> &'static str {
    match tool {
        "compress" => "compressed",
        "resize" => "resized",
        "convert" => "converted",
        "crop" => "edited",
        "watermark" => "watermarked",
        "optimize" => "web",
        _ => "processed",
    }
}

fn output_directory(source: &Path, mode: &str, custom: &Option<String>) -> Result<PathBuf, String> {
    let parent = source.parent().ok_or("Source file has no parent folder")?;
    match mode {
        "custom" => custom.as_ref().map(PathBuf::from).ok_or("Choose an output folder".into()),
        "new" => Ok(parent.join("_davIMAGE")),
        _ => Ok(parent.to_path_buf()),
    }
}

fn available_output_path(source: &Path, mode: &str, custom: &Option<String>, suffix: &str, extension: &str) -> Result<PathBuf, String> {
    let directory = output_directory(source, mode, custom)?;
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let stem = source.file_stem().and_then(|value| value.to_str()).unwrap_or("image");
    let mut index = 1u32;
    loop {
        let name = if index == 1 {
            format!("{}-{}.{}", stem, suffix, extension)
        } else {
            format!("{}-{}-{}.{}", stem, suffix, index, extension)
        };
        let candidate = directory.join(name);
        if !candidate.exists() {
            return Ok(candidate);
        }
        index += 1;
    }
}

fn encode_image(image: &DynamicImage, path: &Path, format: ImageFormat, quality: u8) -> Result<(), String> {
    let file = File::create(path).map_err(|error| error.to_string())?;
    let mut writer = BufWriter::new(file);
    match format {
        ImageFormat::Jpeg => {
            let rgb = image.to_rgb8();
            let mut encoder = JpegEncoder::new_with_quality(&mut writer, quality.clamp(1, 100));
            encoder.encode_image(&DynamicImage::ImageRgb8(rgb)).map_err(|error| error.to_string())?;
        }
        ImageFormat::WebP => {
            let rgba = image.to_rgba8();
            let encoder = webp::Encoder::from_rgba(rgba.as_raw(), rgba.width(), rgba.height());
            let encoded = encoder.encode(quality.clamp(1, 100) as f32);
            writer.write_all(&encoded).map_err(|error| error.to_string())?;
        }
        _ => image.write_to(&mut writer, format).map_err(|error| error.to_string())?,
    }
    writer.flush().map_err(|error| error.to_string())?;
    Ok(())
}

fn transform_image(path: &Path, tool: &str, options: &ProcessOptions) -> Result<(DynamicImage, ImageFormat), String> {
    let reader = ImageReader::open(path)
        .map_err(|error| error.to_string())?
        .with_guessed_format()
        .map_err(|error| error.to_string())?;
    let input_format = reader.format().ok_or("Unknown image format")?;
    if input_format == ImageFormat::Gif {
        return Err("Animated GIF processing is currently unavailable to avoid losing frames".into());
    }
    let mut image = reader.decode().map_err(|error| error.to_string())?;
    image = orient_image(image, read_orientation(path));
    match tool {
        "resize" => image = resize_image(image, options),
        "crop" => {
            image = crop_image(image, options)?;
            image = rotate_image(image, options.rotate);
        }
        "watermark" => image = watermark_image(image, options)?,
        "optimize" => {
            let (width, height) = image.dimensions();
            if width.max(height) > 1920 {
                let scale = 1920.0 / width.max(height) as f32;
                let (w, h) = scale_dimensions(width, height, scale);
                image = image.resize_exact(w, h, FilterType::Lanczos3);
            }
        }
        _ => {}
    }
    Ok((image, input_format))
}

fn process_one(path: &Path, request: &ProcessRequest) -> Result<ProcessResult, String> {
    let original_size = fs::metadata(path).map_err(|error| error.to_string())?.len();
    let (mut image, input_format) = transform_image(path, &request.tool, &request.options)?;
    let requested = if request.tool == "optimize" { "webp" } else { request.options.output_format.as_str() };
    let (extension, format) = output_format(requested, Some(input_format));
    if format == ImageFormat::Jpeg && image.color().has_alpha() {
        image = flatten_alpha(image, parse_hex_color(&request.options.background));
    }
    let quality = if request.tool == "optimize" { 82 } else { request.options.quality };
    let destination = available_output_path(
        path,
        &request.output_mode,
        &request.output_folder,
        tool_suffix(&request.tool),
        &extension,
    )?;
    let temp_path = destination.with_file_name(format!(".davimage-{}.tmp", Uuid::new_v4()));
    let encoded = encode_image(&image, &temp_path, format, quality);
    if let Err(error) = encoded {
        let _ = fs::remove_file(&temp_path);
        return Err(error);
    }
    fs::rename(&temp_path, &destination).map_err(|error| {
        let _ = fs::remove_file(&temp_path);
        error.to_string()
    })?;
    let output_size = fs::metadata(&destination).map_err(|error| error.to_string())?.len();
    Ok(ProcessResult {
        path: path.to_string_lossy().into_owned(),
        output_path: Some(destination.to_string_lossy().into_owned()),
        original_size,
        output_size: Some(output_size),
        status: "completed".into(),
        error: None,
    })
}

fn process_blocking(app: &AppHandle, request: ProcessRequest) -> BatchResult {
    CANCELLED.store(false, Ordering::SeqCst);
    let total = request.paths.len();
    let mut results = Vec::with_capacity(total);
    let mut original_total = 0u64;
    let mut output_total = 0u64;
    let mut completed = 0usize;
    let mut failed = 0usize;
    let mut cancelled = false;
    for (index, raw) in request.paths.iter().enumerate() {
        if CANCELLED.load(Ordering::SeqCst) {
            cancelled = true;
            break;
        }
        let path = PathBuf::from(raw);
        let original_size = fs::metadata(&path).map(|value| value.len()).unwrap_or(0);
        original_total += original_size;
        let _ = app.emit("image-job-progress", ProgressPayload {
            index,
            total,
            path: raw.clone(),
            status: "processing".into(),
            output_path: None,
            original_size,
            output_size: None,
            error: None,
        });
        match process_one(&path, &request) {
            Ok(result) => {
                completed += 1;
                output_total += result.output_size.unwrap_or(0);
                let _ = app.emit("image-job-progress", ProgressPayload {
                    index,
                    total,
                    path: raw.clone(),
                    status: "completed".into(),
                    output_path: result.output_path.clone(),
                    original_size,
                    output_size: result.output_size,
                    error: None,
                });
                results.push(result);
            }
            Err(error) => {
                failed += 1;
                let result = ProcessResult {
                    path: raw.clone(),
                    output_path: None,
                    original_size,
                    output_size: None,
                    status: "failed".into(),
                    error: Some(error.clone()),
                };
                let _ = app.emit("image-job-progress", ProgressPayload {
                    index,
                    total,
                    path: raw.clone(),
                    status: "failed".into(),
                    output_path: None,
                    original_size,
                    output_size: None,
                    error: Some(error),
                });
                results.push(result);
            }
        }
    }
    BatchResult {
        results,
        original_total,
        output_total,
        completed,
        failed,
        cancelled,
    }
}

#[tauri::command]
pub async fn process_images(app: AppHandle, request: ProcessRequest) -> Result<BatchResult, String> {
    tauri::async_runtime::spawn_blocking(move || process_blocking(&app, request))
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn cancel_processing() {
    CANCELLED.store(true, Ordering::SeqCst);
}

#[tauri::command]
pub fn thumbnail_image(path: String) -> Result<String, String> {
    use base64::Engine;
    let path_buf = PathBuf::from(path);
    let mut image = image::open(&path_buf).map_err(|error| error.to_string())?;
    image = orient_image(image, read_orientation(&path_buf));
    image = image.resize(720, 720, FilterType::Lanczos3);
    let mut bytes = Vec::new();
    {
        let mut encoder = JpegEncoder::new_with_quality(&mut bytes, 82);
        encoder.encode_image(&image.to_rgb8()).map_err(|error| error.to_string())?;
    }
    Ok(format!("data:image/jpeg;base64,{}", base64::engine::general_purpose::STANDARD.encode(bytes)))
}

