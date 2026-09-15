export const tools = ['compress', 'resize', 'convert', 'crop', 'watermark', 'metadata', 'optimize'];

export const outputFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff'];

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value >= 100 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function reductionPercent(before, after) {
  if (!before || after == null) return null;
  return ((before - after) / before) * 100;
}

export function formatReduction(before, after) {
  const value = reductionPercent(before, after);
  if (value == null) return '—';
  const sign = value >= 0 ? '−' : '+';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

export function basename(path) {
  return String(path || '').split(/[\\/]/).pop() || '';
}

export function toolSuffix(tool) {
  return {
    compress: 'compressed',
    resize: 'resized',
    convert: 'converted',
    crop: 'edited',
    watermark: 'watermarked',
    optimize: 'web'
  }[tool] || 'processed';
}

export function outputExtension(format, inputExtension = '') {
  const normalized = String(format || '').toLowerCase();
  if (normalized === 'jpeg' || normalized === 'jpg') return 'jpg';
  if (normalized === 'tiff' || normalized === 'tif') return 'tiff';
  if (outputFormats.includes(normalized)) return normalized;
  const source = String(inputExtension || '').toLowerCase();
  if (source === 'jpeg') return 'jpg';
  if (['jpg', 'png', 'webp', 'avif', 'tif', 'tiff'].includes(source)) return source === 'tif' ? 'tiff' : source;
  return 'png';
}

export function previewOutputName(file, tool, format) {
  const name = file?.name || basename(file?.path || '') || 'image';
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const inputExtension = dot > 0 ? name.slice(dot + 1) : '';
  const extension = outputExtension(tool === 'optimize' ? 'webp' : format, inputExtension);
  return `${stem}-${toolSuffix(tool)}.${extension}`;
}

export function defaultOptions() {
  return {
    quality: 82,
    outputFormat: 'webp',
    resizeMode: 'width',
    width: 1920,
    height: 1080,
    percentage: 50,
    rotate: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 1000,
    cropHeight: 1000,
    background: '#ffffff',
    watermarkPath: null,
    watermarkOpacity: 72,
    watermarkScale: 22,
    watermarkPosition: 'bottom-right'
  };
}

export function resizePreview(width, height, options) {
  const w = Math.max(1, Number(width) || 1);
  const h = Math.max(1, Number(height) || 1);
  const targetW = Math.max(1, Number(options.width) || w);
  const targetH = Math.max(1, Number(options.height) || h);
  if (options.resizeMode === 'width') return [targetW, Math.max(1, Math.round(h * targetW / w))];
  if (options.resizeMode === 'height') return [Math.max(1, Math.round(w * targetH / h)), targetH];
  if (options.resizeMode === 'dimensions' || options.resizeMode === 'fill') return [targetW, targetH];
  if (options.resizeMode === 'percentage') {
    const scale = Math.max(1, Number(options.percentage) || 100) / 100;
    return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
  }
  if (options.resizeMode === 'longest') {
    const scale = targetW / Math.max(w, h);
    return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
  }
  if (options.resizeMode === 'shortest') {
    const scale = targetW / Math.min(w, h);
    return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
  }
  const scale = Math.min(targetW / w, targetH / h);
  return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
}

export function presetOptions(name) {
  const presets = {
    instagram: { resizeMode: 'dimensions', width: 1080, height: 1080 },
    fullhd: { resizeMode: 'dimensions', width: 1920, height: 1080 },
    '4k': { resizeMode: 'dimensions', width: 3840, height: 2160 },
    email: { resizeMode: 'longest', width: 1600 },
    avatar: { resizeMode: 'dimensions', width: 512, height: 512 },
    website: { resizeMode: 'longest', width: 1920 }
  };
  return presets[name] || null;
}
