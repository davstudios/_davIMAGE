import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultOptions, formatBytes, formatReduction, outputExtension, previewOutputName, resizePreview, toolSuffix } from '../src/image-engine.js';

test('formats byte sizes cleanly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
});

test('formats reduction percentage', () => {
  assert.equal(formatReduction(1000, 250), '−75.0%');
  assert.equal(formatReduction(1000, 1250), '+25.0%');
});

test('normalizes output extensions', () => {
  assert.equal(outputExtension('jpeg', 'png'), 'jpg');
  assert.equal(outputExtension('tiff', 'png'), 'tiff');
  assert.equal(outputExtension('same', 'jpeg'), 'jpg');
});

test('creates safe output preview names', () => {
  assert.equal(previewOutputName({ name: 'photo.jpg' }, 'convert', 'webp'), 'photo-converted.webp');
  assert.equal(previewOutputName({ name: 'photo.final.png' }, 'optimize', 'same'), 'photo.final-web.webp');
});

test('uses operation suffixes', () => {
  assert.equal(toolSuffix('compress'), 'compressed');
  assert.equal(toolSuffix('watermark'), 'watermarked');
});

test('width resize preserves aspect ratio', () => {
  const options = { ...defaultOptions(), resizeMode: 'width', width: 1920 };
  assert.deepEqual(resizePreview(3200, 1800, options), [1920, 1080]);
});

test('height resize preserves aspect ratio', () => {
  const options = { ...defaultOptions(), resizeMode: 'height', height: 900 };
  assert.deepEqual(resizePreview(3200, 1800, options), [1600, 900]);
});

test('percentage resize scales both dimensions', () => {
  const options = { ...defaultOptions(), resizeMode: 'percentage', percentage: 50 };
  assert.deepEqual(resizePreview(2000, 1000, options), [1000, 500]);
});

test('fit resize stays inside bounds', () => {
  const options = { ...defaultOptions(), resizeMode: 'fit', width: 1000, height: 1000 };
  assert.deepEqual(resizePreview(2000, 1000, options), [1000, 500]);
});

test('longest-side resize uses target', () => {
  const options = { ...defaultOptions(), resizeMode: 'longest', width: 1600 };
  assert.deepEqual(resizePreview(3200, 1800, options), [1600, 900]);
});

