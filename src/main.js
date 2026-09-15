import './styles.css';
import './motion.css';
import { basename, defaultOptions, formatBytes, formatReduction, previewOutputName, resizePreview } from './image-engine.js';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { listen } from '@tauri-apps/api/event';
import { open, message } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';

const icons = {
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 17 5-5 4 4 2-2 5 5"/></svg>',
  compress: '<svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 3 6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/></svg>',
  resize: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/><path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6"/></svg>',
  convert: '<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="M18 7l-3 3M6 17l3-3"/></svg>',
  crop: '<svg viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
  watermark: '<svg viewBox="0 0 24 24"><path d="M4 19h16M5 16l3-10 4 10 4-10 3 10"/></svg>',
  metadata: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>',
  optimize: '<svg viewBox="0 0 24 24"><path d="m12 2 2.4 6.1L21 10l-5 4.1.6 6.9-4.6-3.2L7.4 21 8 14.1 3 10l6.6-1.9z"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 6.5h6l2 2h10v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 8.5v-2a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2"/></svg>',
  files: '<svg viewBox="0 0 24 24"><path d="M7 2h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m7 9 5 5 5-5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg>',
  globe: '<svg class="globe-icon" viewBox="0 0 390 390" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M195,0C87.305,0,0,87.304,0,195s87.305,195,195,195s195-87.304,195-195S302.695,0,195,0z M119.524,45.678c-3.493,4.838-6.838,10.033-10.007,15.6c-4.841,8.503-9.16,17.656-12.945,27.33c-8.064-2.22-16.089-4.713-24.064-7.483C85.91,66.718,101.813,54.667,119.524,45.678z M52.298,107.694c11.438,4.293,22.976,8.056,34.591,11.293c-4.78,18.934-7.744,39.182-8.745,60.087h-49.72C30.888,153.108,39.305,128.852,52.298,107.694z M52.298,282.306c-12.994-21.159-21.411-45.414-23.874-71.38h49.72c1.002,20.905,3.965,41.153,8.745,60.087C75.274,274.25,63.736,278.013,52.298,282.306z M72.508,308.876c7.975-2.77,16-5.265,24.063-7.483c3.786,9.674,8.105,18.827,12.946,27.33c3.168,5.566,6.514,10.762,10.007,15.6C101.813,335.333,85.91,323.283,72.508,308.876z M179.074,354.07c-20.393-7.648-38.458-29.593-51.05-59.894c16.931-3.125,33.977-5.059,51.05-5.8V354.07z M179.074,256.454c-20.448,0.818-40.862,3.221-61.117,7.191c-4.16-16.355-6.908-34.13-7.915-52.72h69.032V256.454z M179.074,179.074h-69.032c1.007-18.59,3.755-36.365,7.915-52.72c20.254,3.971,40.669,6.373,61.117,7.191V179.074z M179.074,101.623c-17.073-0.741-34.118-2.675-51.05-5.8c12.592-30.301,30.657-52.245,51.05-59.894V101.623z M337.703,107.697c12.993,21.157,21.409,45.412,23.872,71.377h-49.72c-1.001-20.903-3.965-41.151-8.744-60.083C314.727,115.754,326.266,111.992,337.703,107.697z M317.495,81.128c-7.975,2.77-16,5.265-24.065,7.484c-3.786-9.676-8.105-18.831-12.947-27.335c-3.169-5.566-6.514-10.762-10.006-15.6C288.189,54.668,304.092,66.72,317.495,81.128z M210.926,35.93c20.393,7.648,38.459,29.595,51.051,59.898c-16.931,3.124-33.977,5.057-51.051,5.797V35.93z M210.926,133.547c20.45-0.817,40.865-3.219,61.118-7.188c4.16,16.354,6.907,34.128,7.914,52.716h-69.032V133.547z M210.926,210.926h69.032c-1.007,18.588-3.754,36.362-7.914,52.716c-20.253-3.97-40.668-6.371-61.118-7.189V210.926z M210.926,354.07v-65.694c17.075,0.741,34.121,2.673,51.051,5.798C249.385,324.475,231.319,346.422,210.926,354.07z M270.477,344.322c3.493-4.838,6.838-10.033,10.006-15.6c4.842-8.504,9.161-17.659,12.947-27.334c8.064,2.22,16.089,4.714,24.065,7.484C304.092,323.28,288.189,335.332,270.477,344.322z M337.703,282.304c-11.437-4.296-22.976-8.058-34.591-11.296c4.779-18.932,7.742-39.179,8.744-60.082h49.72C359.112,236.891,350.696,261.146,337.703,282.304z"/></svg>',
  coffee: '<svg class="coffee-icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m20.216 6.415-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/></svg>'
};

const toolData = {
  compress: ['Comprimi', 'Compress', 'Riduci il peso senza caricare nulla online.', 'Reduce file size without uploading anything.'],
  resize: ['Ridimensiona', 'Resize', 'Cambia dimensioni mantenendo il controllo sull’aspect ratio.', 'Change dimensions while keeping control of aspect ratio.'],
  convert: ['Converti', 'Convert', 'Converti batch di immagini nei formati moderni più comuni.', 'Batch convert images to common modern formats.'],
  crop: ['Ritaglia e ruota', 'Crop & Rotate', 'Ritaglia con coordinate precise e ruota in modo lossless quando possibile.', 'Crop with precise coordinates and rotate safely.'],
  watermark: ['Watermark', 'Watermark', 'Applica un’immagine watermark a un intero batch.', 'Apply an image watermark to an entire batch.'],
  metadata: ['Metadata', 'Metadata', 'Leggi EXIF e informazioni sensibili senza modificare il file.', 'Inspect EXIF and sensitive information without changing the file.'],
  optimize: ['Ottimizza per il Web', 'Optimize for Web', 'Ridimensiona, converte in WebP e comprime con un preset DAV.', 'Resize, convert to WebP and compress with a DAV preset.']
};

const storedSettings = JSON.parse(localStorage.getItem('davimage-settings') || 'null');
const state = {
  tool: 'compress',
  page: 'tool',
  files: [],
  selectedId: null,
  options: defaultOptions(),
  outputMode: 'same',
  outputFolder: null,
  settings: storedSettings || { theme: 'system', language: 'it', recursiveFolders: true },
  busy: false,
  dragOver: false,
  jobs: new Map(),
  result: null,
  metadata: null,
  metadataLoading: false,
  thumbnail: null,
  thumbnailLoading: false,
  reveal: 'startup'
};

const app = document.querySelector('#app');

function t(it, en) {
  return state.settings.language === 'en' ? en : it;
}

function saveSettings() {
  localStorage.setItem('davimage-settings', JSON.stringify(state.settings));
}

function applyTheme() {
  const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.lang = state.settings.language;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0b0d' : '#fbfbfd');
}

function runUiTransition(kind, update) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    update();
    return;
  }
  if (typeof document.startViewTransition === 'function') {
    root.dataset.uiTransition = kind;
    const transition = document.startViewTransition(() => update());
    transition.finished.finally(() => {
      if (root.dataset.uiTransition === kind) delete root.dataset.uiTransition;
    });
    return;
  }
  root.dataset.uiTransition = `${kind}-out`;
  setTimeout(() => {
    update();
    root.dataset.uiTransition = `${kind}-in`;
    setTimeout(() => {
      delete root.dataset.uiTransition;
    }, 430);
  }, 180);
}

function selectedFile() {
  return state.files.find((file) => file.id === state.selectedId) || state.files[0] || null;
}

function supportedFiles() {
  return state.files.filter((file) => file.supported);
}

function navItem(tool, iconKey) {
  const data = toolData[tool];
  return `<button class="nav-item ${state.page === 'tool' && state.tool === tool ? 'active' : ''}" data-tool="${tool}">${icons[iconKey]}<span>${t(data[0], data[1])}</span></button>`;
}

function renderShell() {
  const tool = toolData[state.tool];
  app.innerHTML = `
    <div class="shell" data-motion-mode="${state.reveal}">
      <aside class="sidebar">
        <div class="brand">_dav<span>IMAGE</span></div>
        <nav>
          ${navItem('compress', 'compress')}
          ${navItem('resize', 'resize')}
          ${navItem('convert', 'convert')}
          ${navItem('crop', 'crop')}
          ${navItem('watermark', 'watermark')}
          ${navItem('metadata', 'metadata')}
          ${navItem('optimize', 'optimize')}
          <button class="nav-item ${state.page === 'settings' ? 'active' : ''}" data-page="settings">${icons.settings}<span>${t('Impostazioni', 'Settings')}</span></button>
        </nav>
        <div class="sidebar-bottom">
          <button class="coffee-button" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè', 'Buy Me A Coffee')}</span></button>
          <button class="icon-button theme-toggle" data-action="quick-theme" aria-label="${t('Cambia tema', 'Change theme')}"><span class="theme-icon theme-icon-sun">${icons.sun}</span><span class="theme-icon theme-icon-moon">${icons.moon}</span></button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <div class="eyebrow">_davIMAGE · v1.0.0</div>
            <h1>${state.page === 'settings' ? t('Impostazioni', 'Settings') : t(tool[0], tool[1])}</h1>
            <p class="top-subtitle">${state.page === 'settings' ? t('Preferenze dell’app e informazioni sulla build.', 'App preferences and build information.') : t(tool[2], tool[3])}</p>
          </div>
          ${state.page === 'tool' ? `<div class="top-actions"><button class="button secondary" data-action="add-folder">${icons.folder}${t('Cartella', 'Folder')}</button><button class="button primary" data-action="add-files">${icons.files}${t('Aggiungi immagini', 'Add images')}</button></div>` : ''}
        </header>
        ${state.page === 'settings' ? renderSettings() : renderToolPage()}
      </main>
    </div>
    <div id="toast-region" aria-live="polite"></div>
  `;
  bindEvents();
  queueMicrotask(() => {
    state.reveal = 'page';
  });
}

function renderToolPage() {
  if (!state.files.length) return renderEmpty();
  if (state.tool === 'metadata') return renderMetadataWorkspace();
  return renderWorkspace();
}

function renderEmpty() {
  return `<section class="empty-wrap">
    <div class="drop-zone ${state.dragOver ? 'drag-over' : ''}">
      <div class="drop-icon">${icons.image}</div>
      <h2>${t('Trascina qui le tue immagini', 'Drop your images here')}</h2>
      <p>${t('JPEG, PNG, WebP, AVIF, BMP e TIFF. I file restano sul tuo computer e gli originali non vengono sovrascritti.', 'JPEG, PNG, WebP, AVIF, BMP and TIFF. Files stay on your computer and originals are never overwritten.')}</p>
      <div class="drop-actions"><button class="button primary" data-action="add-files">${t('Seleziona immagini', 'Choose images')}</button><button class="button secondary" data-action="add-folder">${t('Apri cartella', 'Open folder')}</button></div>
      <div class="format-note">${t('HEIC/HEIF vengono rilevati ma il supporto completo verrà esteso in aggiornamenti futuri. Le GIF animate vengono rilevate ma non elaborate per evitare la perdita dei fotogrammi.', 'HEIC/HEIF files are detected, with broader support planned for future updates. Animated GIF files are detected but not processed to avoid frame loss.')}</div>
    </div>
    <div class="trust-row">
      <div><strong>${t('Elaborazione locale', 'Local processing')}</strong><span>${t('Nessun upload e nessun account.', 'No uploads and no account.')}</span></div>
      <div><strong>${t('Output sicuro', 'Safe output')}</strong><span>${t('Ogni operazione crea un nuovo file.', 'Every operation creates a new file.')}</span></div>
      <div><strong>${t('Batch reale', 'Real batch')}</strong><span>${t('Una singola coda per decine o migliaia di immagini.', 'One queue for dozens or thousands of images.')}</span></div>
    </div>
  </section>`;
}

function fileRows() {
  const visible = state.files.slice(0, 250);
  return `${visible.map((file) => {
    const active = file.id === selectedFile()?.id;
    const job = state.jobs.get(file.path);
    const status = job?.status || (file.supported ? 'ready' : 'unsupported');
    const statusText = status === 'completed' ? t('Completato', 'Completed') : status === 'processing' ? t('Elaborazione', 'Processing') : status === 'failed' ? t('Errore', 'Failed') : status === 'unsupported' ? t('Non supportato', 'Unsupported') : t('Pronto', 'Ready');
    return `<button class="file-row ${active ? 'active' : ''}" data-file-id="${escapeAttr(file.id)}">
      <span class="file-thumb-mini">${icons.image}</span>
      <span class="file-copy"><strong>${escapeHtml(file.name)}</strong><small>${file.width && file.height ? `${file.width}×${file.height} · ` : ''}${escapeHtml(file.format)} · ${formatBytes(file.size)}</small></span>
      <span class="file-state ${status}">${statusText}</span>
    </button>`;
  }).join('')}${state.files.length > 250 ? `<div class="file-overflow">${t(`Altri ${state.files.length - 250} file sono nella coda ma non vengono renderizzati per mantenere l’interfaccia fluida.`, `${state.files.length - 250} more files are queued but not rendered to keep the interface responsive.`)}</div>` : ''}`;
}

function renderWorkspace() {
  const file = selectedFile();
  const previewName = previewOutputName(file, state.tool, state.options.outputFormat);
  const progressDone = [...state.jobs.values()].filter((job) => job.status === 'completed' || job.status === 'failed').length;
  const total = supportedFiles().length;
  return `<section class="image-workspace">
    <div class="panel file-panel">
      <div class="panel-head sticky-head"><div><h2>${t('Immagini', 'Images')}</h2><span>${state.files.length} ${t('selezionate', 'selected')}</span></div><button class="icon-button" data-action="clear-files" title="${t('Svuota', 'Clear')}">${icons.trash}</button></div>
      <div class="file-list">${fileRows()}</div>
    </div>
    <div class="workspace-center">
      <div class="panel preview-card">
        <div class="preview-stage">
          ${state.thumbnail ? `<img src="${state.thumbnail}" alt="${escapeAttr(file?.name || '')}" />` : `<div class="preview-placeholder">${state.thumbnailLoading ? '<span class="loader-ring"></span>' : icons.image}<span>${state.thumbnailLoading ? t('Generazione anteprima…', 'Generating preview…') : t('Anteprima', 'Preview')}</span></div>`}
        </div>
        <div class="preview-info">
          <div><strong>${escapeHtml(file?.name || '')}</strong><span>${file?.width && file?.height ? `${file.width}×${file.height} · ` : ''}${formatBytes(file?.size || 0)}</span></div>
          <div class="output-arrow">→</div>
          <div class="preview-output"><strong>${escapeHtml(previewName)}</strong><span>${previewDimensionText(file)}</span></div>
        </div>
      </div>
      ${state.result ? renderResultSummary() : ''}
      ${state.busy ? `<div class="panel progress-card"><div class="progress-line"><div class="progress-fill" style="width:${total ? Math.min(100, progressDone / total * 100) : 0}%"></div></div><div><strong>${t('Elaborazione in corso', 'Processing')}</strong><span>${progressDone}/${total}</span><button class="text-button danger" data-action="cancel">${t('Annulla', 'Cancel')}</button></div></div>` : ''}
    </div>
    <div class="panel controls-panel">
      <div class="controls-scroll">
        ${renderToolControls()}
        ${renderOutputControls()}
      </div>
      <div class="process-footer">
        <div><strong>${supportedFiles().length}</strong><span>${t('immagini elaborabili', 'processable images')}</span></div>
        <button class="button primary process-button" data-action="process" ${state.busy || !supportedFiles().length ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>' : icons.optimize}${t('Avvia elaborazione', 'Start processing')}</button>
      </div>
    </div>
  </section>`;
}

function previewDimensionText(file) {
  if (!file?.width || !file?.height) return t('Nuovo file', 'New file');
  if (state.tool === 'resize') {
    const [width, height] = resizePreview(file.width, file.height, state.options);
    return `${width}×${height}`;
  }
  if (state.tool === 'optimize' && Math.max(file.width, file.height) > 1920) {
    const scale = 1920 / Math.max(file.width, file.height);
    return `${Math.round(file.width * scale)}×${Math.round(file.height * scale)} · WebP`;
  }
  return `${file.width}×${file.height}`;
}

function renderToolControls() {
  if (state.tool === 'compress') return `<section class="control-section"><div class="control-title"><div><h2>${t('Compressione', 'Compression')}</h2><p>${t('La qualità controlla JPEG e WebP. PNG resta lossless.', 'Quality controls JPEG and WebP. PNG stays lossless.')}</p></div><span class="value-pill">${state.options.quality}</span></div>${qualityControl()}${presetRow([['92', t('Alta qualità', 'High quality')], ['82', t('Bilanciata', 'Balanced')], ['65', t('Massima', 'Maximum')]])}<div class="field"><label>${t('Formato output', 'Output format')}</label>${nativeSelect('output-format', [['same', t('Come originale', 'Same as source')], ['jpeg', 'JPEG'], ['png', 'PNG'], ['webp', 'WebP'], ['avif', 'AVIF'], ['tiff', 'TIFF']], state.options.outputFormat)}</div>${jpegBackground()}</section>`;
  if (state.tool === 'resize') return `<section class="control-section"><div class="control-title"><div><h2>${t('Ridimensionamento', 'Resize')}</h2><p>${t('Lanczos ad alta qualità e orientamento EXIF applicato automaticamente.', 'High-quality Lanczos filtering with EXIF orientation applied automatically.')}</p></div></div><div class="preset-grid">${[['instagram','Instagram'],['fullhd','Full HD'],['4k','4K'],['email','Email'],['avatar','Avatar'],['website','Website']].map(([value,label]) => `<button class="preset-tile" data-preset="${value}">${label}</button>`).join('')}</div><div class="field"><label>${t('Modalità', 'Mode')}</label>${nativeSelect('resize-mode', [['width', t('Larghezza', 'Width')], ['height', t('Altezza', 'Height')], ['dimensions', t('Larghezza × Altezza', 'Width × Height')], ['percentage', t('Percentuale', 'Percentage')], ['longest', t('Lato lungo', 'Longest side')], ['shortest', t('Lato corto', 'Shortest side')], ['fit', 'Fit inside'], ['fill', 'Fill']], state.options.resizeMode)}</div>${resizeFields()}<div class="field"><label>${t('Formato output', 'Output format')}</label>${nativeSelect('output-format', [['same', t('Come originale', 'Same as source')], ['jpeg','JPEG'], ['png','PNG'], ['webp','WebP'], ['avif','AVIF'], ['tiff','TIFF']], state.options.outputFormat)}</div>${jpegBackground()}</section>`;
  if (state.tool === 'convert') return `<section class="control-section"><div class="control-title"><div><h2>${t('Conversione', 'Conversion')}</h2><p>${t('Il formato viene identificato dai contenuti del file, non solo dall’estensione.', 'The format is identified from file contents, not only the extension.')}</p></div></div><div class="format-grid">${['jpeg','png','webp','avif','tiff'].map((format) => `<button class="format-tile ${state.options.outputFormat === format ? 'active' : ''}" data-format="${format}"><strong>${format === 'jpeg' ? 'JPEG' : format.toUpperCase()}</strong><span>${formatDescription(format)}</span></button>`).join('')}</div>${qualityControl()}${jpegBackground()}</section>`;
  if (state.tool === 'crop') return `<section class="control-section"><div class="control-title"><div><h2>${t('Ritaglia e ruota', 'Crop & Rotate')}</h2><p>${t('Coordinate espresse in pixel sull’immagine orientata correttamente.', 'Pixel coordinates are applied after EXIF orientation correction.')}</p></div></div><div class="field-grid two"><label>X<input type="number" min="0" data-option="cropX" value="${state.options.cropX}"></label><label>Y<input type="number" min="0" data-option="cropY" value="${state.options.cropY}"></label><label>${t('Larghezza', 'Width')}<input type="number" min="1" data-option="cropWidth" value="${state.options.cropWidth}"></label><label>${t('Altezza', 'Height')}<input type="number" min="1" data-option="cropHeight" value="${state.options.cropHeight}"></label></div><div class="field"><label>${t('Rotazione', 'Rotation')}</label><div class="segmented">${[0,90,180,270].map((value) => `<button class="${state.options.rotate === value ? 'active' : ''}" data-rotate="${value}">${value}°</button>`).join('')}</div></div><div class="field"><label>${t('Formato output', 'Output format')}</label>${nativeSelect('output-format', [['same', t('Come originale', 'Same as source')], ['jpeg','JPEG'], ['png','PNG'], ['webp','WebP'], ['avif','AVIF'], ['tiff','TIFF']], state.options.outputFormat)}</div>${jpegBackground()}</section>`;
  if (state.tool === 'watermark') return `<section class="control-section"><div class="control-title"><div><h2>Watermark</h2><p>${t('Usa PNG/WebP con trasparenza per risultati migliori.', 'Use transparent PNG/WebP files for best results.')}</p></div></div><button class="watermark-picker" data-action="watermark-file">${icons.image}<span><strong>${state.options.watermarkPath ? escapeHtml(basename(state.options.watermarkPath)) : t('Scegli watermark', 'Choose watermark')}</strong><small>${state.options.watermarkPath ? t('Clicca per sostituire', 'Click to replace') : t('PNG, WebP, JPEG', 'PNG, WebP, JPEG')}</small></span></button><div class="slider-block"><div><label>${t('Opacità', 'Opacity')}</label><span>${state.options.watermarkOpacity}%</span></div><input type="range" min="1" max="100" value="${state.options.watermarkOpacity}" data-range="watermarkOpacity"></div><div class="slider-block"><div><label>${t('Dimensione', 'Size')}</label><span>${state.options.watermarkScale}%</span></div><input type="range" min="5" max="80" value="${state.options.watermarkScale}" data-range="watermarkScale"></div><div class="field"><label>${t('Posizione', 'Position')}</label>${nativeSelect('watermark-position', [['top-left', t('Alto sinistra', 'Top left')], ['top-right', t('Alto destra', 'Top right')], ['center', t('Centro', 'Center')], ['bottom-left', t('Basso sinistra', 'Bottom left')], ['bottom-right', t('Basso destra', 'Bottom right')]], state.options.watermarkPosition)}</div><div class="field"><label>${t('Formato output', 'Output format')}</label>${nativeSelect('output-format', [['same', t('Come originale', 'Same as source')], ['jpeg','JPEG'], ['png','PNG'], ['webp','WebP'], ['avif','AVIF'], ['tiff','TIFF']], state.options.outputFormat)}</div>${jpegBackground()}</section>`;
  return `<section class="control-section optimize-section"><div class="optimize-mark">${icons.optimize}</div><h2>${t('Preset DAV per il Web', 'DAV Web preset')}</h2><p>${t('Porta il lato più lungo a massimo 1920 px, applica l’orientamento EXIF, converte in WebP e usa qualità 82. Pensato per immagini di siti web moderne.', 'Limits the longest side to 1920 px, applies EXIF orientation, converts to WebP and uses quality 82. Designed for modern website imagery.')}</p><div class="optimize-flow"><span>3200×1800<br><small>JPEG · 2.7 MB</small></span><b>→</b><span>1920×1080<br><small>WebP · ${t('output stimato', 'estimated output')}</small></span></div><div class="privacy-callout">${icons.check}<span>${t('La ricodifica rimuove i metadata EXIF dal nuovo file. L’originale resta intatto.', 'Re-encoding removes EXIF metadata from the new file. The original stays untouched.')}</span></div></section>`;
}

function qualityControl() {
  return `<div class="slider-block"><div><label>${t('Qualità', 'Quality')}</label><span>${state.options.quality}</span></div><input type="range" min="1" max="100" value="${state.options.quality}" data-range="quality"></div>`;
}

function presetRow(items) {
  return `<div class="segmented quality-presets">${items.map(([value,label]) => `<button data-quality="${value}" class="${state.options.quality === Number(value) ? 'active' : ''}">${label}</button>`).join('')}</div>`;
}

function resizeFields() {
  const mode = state.options.resizeMode;
  if (mode === 'percentage') return `<label>${t('Percentuale', 'Percentage')}<div class="input-suffix"><input type="number" min="1" max="1000" data-option="percentage" value="${state.options.percentage}"><span>%</span></div></label>`;
  if (mode === 'width' || mode === 'longest' || mode === 'shortest') return `<label>${mode === 'width' ? t('Larghezza', 'Width') : mode === 'longest' ? t('Lato lungo', 'Longest side') : t('Lato corto', 'Shortest side')}<div class="input-suffix"><input type="number" min="1" data-option="width" value="${state.options.width}"><span>px</span></div></label>`;
  if (mode === 'height') return `<label>${t('Altezza', 'Height')}<div class="input-suffix"><input type="number" min="1" data-option="height" value="${state.options.height}"><span>px</span></div></label>`;
  return `<div class="field-grid two"><label>${t('Larghezza', 'Width')}<div class="input-suffix"><input type="number" min="1" data-option="width" value="${state.options.width}"><span>px</span></div></label><label>${t('Altezza', 'Height')}<div class="input-suffix"><input type="number" min="1" data-option="height" value="${state.options.height}"><span>px</span></div></label></div>`;
}

function jpegBackground() {
  if (state.options.outputFormat !== 'jpeg') return '';
  return `<div class="jpeg-warning"><div>${t('JPEG non supporta la trasparenza.', 'JPEG does not support transparency.')}</div><label>${t('Sfondo', 'Background')}<input type="color" data-option="background" value="${escapeAttr(state.options.background)}"></label></div>`;
}

function formatDescription(format) {
  const values = {
    jpeg: t('Foto e compatibilità', 'Photos & compatibility'),
    png: t('Lossless e trasparenza', 'Lossless & transparency'),
    webp: t('Web moderno', 'Modern web'),
    avif: t('Alta efficienza', 'High efficiency'),
    tiff: t('Archivio e stampa', 'Archive & print')
  };
  return values[format];
}

function renderOutputControls() {
  return `<section class="control-section output-section"><div class="control-title"><div><h2>${t('Output', 'Output')}</h2><p>${t('Gli originali non vengono mai sovrascritti.', 'Original files are never overwritten.')}</p></div></div><div class="output-mode">${[['same', t('Stessa cartella', 'Same folder')], ['new', t('Nuova cartella', 'New folder')], ['custom', t('Cartella personalizzata', 'Custom folder')]].map(([value,label]) => `<button class="${state.outputMode === value ? 'active' : ''}" data-output-mode="${value}">${label}</button>`).join('')}</div>${state.outputMode === 'custom' ? `<button class="folder-choice" data-action="output-folder">${icons.folder}<span><strong>${state.outputFolder ? escapeHtml(basename(state.outputFolder)) : t('Scegli cartella', 'Choose folder')}</strong><small>${state.outputFolder ? escapeHtml(state.outputFolder) : t('Obbligatoria per avviare', 'Required to start')}</small></span></button>` : ''}<div class="naming-preview"><span>${t('Nome output', 'Output name')}</span><strong>${escapeHtml(previewOutputName(selectedFile(), state.tool, state.options.outputFormat))}</strong></div></section>`;
}

function renderResultSummary() {
  const result = state.result;
  const savings = result.originalTotal - result.outputTotal;
  return `<div class="panel result-card"><div class="result-icon">${icons.check}</div><div><span>${t('Totale prima', 'Total before')}</span><strong>${formatBytes(result.originalTotal)}</strong></div><div><span>${t('Totale dopo', 'Total after')}</span><strong>${formatBytes(result.outputTotal)}</strong></div><div><span>${t('Risparmiati', 'Saved')}</span><strong class="saved">${savings > 0 ? formatBytes(savings) : '—'}</strong></div><div><span>${t('Riduzione', 'Reduction')}</span><strong class="saved">${formatReduction(result.originalTotal, result.outputTotal)}</strong></div><div><span>${t('Completati', 'Completed')}</span><strong>${result.completed}</strong></div>${result.failed ? `<div><span>${t('Errori', 'Failed')}</span><strong class="failed">${result.failed}</strong></div>` : ''}</div>`;
}

function renderMetadataWorkspace() {
  const file = selectedFile();
  const metadata = state.metadata;
  return `<section class="metadata-workspace">
    <div class="panel file-panel"><div class="panel-head sticky-head"><div><h2>${t('Immagini', 'Images')}</h2><span>${state.files.length} ${t('selezionate', 'selected')}</span></div><button class="icon-button" data-action="clear-files">${icons.trash}</button></div><div class="file-list">${fileRows()}</div></div>
    <div class="metadata-main">
      <div class="panel metadata-preview"><div class="preview-stage metadata-stage">${state.thumbnail ? `<img src="${state.thumbnail}" alt="${escapeAttr(file?.name || '')}">` : `<div class="preview-placeholder">${state.thumbnailLoading ? '<span class="loader-ring"></span>' : icons.image}</div>`}</div><div class="preview-info single"><div><strong>${escapeHtml(file?.name || '')}</strong><span>${file?.format || ''} · ${formatBytes(file?.size || 0)}</span></div></div></div>
      <div class="panel metadata-card"><div class="panel-head"><div><h2>Metadata</h2><span>${t('Solo lettura', 'Read-only')}</span></div></div>${state.metadataLoading ? `<div class="metadata-loading"><span class="loader-ring"></span>${t('Lettura metadata…', 'Reading metadata…')}</div>` : metadata ? `<div class="metadata-grid">${metadataRow(t('Fotocamera', 'Camera'), metadata.camera)}${metadataRow(t('Obiettivo', 'Lens'), metadata.lens)}${metadataRow(t('Data', 'Date'), metadata.date)}${metadataRow('GPS', metadata.gps, Boolean(metadata.gps))}${metadataRow('Software', metadata.software)}${metadataRow('Copyright', metadata.copyright)}${metadataRow(t('Orientamento', 'Orientation'), metadata.orientation)}${metadataRow('ICC profile', metadata.iccProfile ? t('Presente', 'Present') : t('Non rilevato', 'Not detected'))}${metadataRow(t('Dimensioni', 'Dimensions'), `${metadata.width}×${metadata.height}`)}${metadataRow(t('Formato', 'Format'), metadata.format)}</div><div class="privacy-callout">${icons.check}<span>${t('Le operazioni di elaborazione ricodificano i nuovi file senza copiare EXIF. La gestione selettiva dei metadata verrà estesa in aggiornamenti futuri.', 'Processing re-encodes new files without copying EXIF. Selective metadata handling will be extended in future updates.')}</span></div>` : `<div class="metadata-loading">${t('Impossibile leggere i metadata.', 'Unable to read metadata.')}</div>`}</div>
    </div>
  </section>`;
}

function metadataRow(label, value, sensitive = false) {
  return `<div class="metadata-row ${sensitive ? 'sensitive' : ''}"><span>${label}</span><strong>${value ? escapeHtml(String(value)) : '—'}</strong></div>`;
}

function renderSettings() {
  return `<section class="settings-grid">
    <div class="panel settings-card">
      <h2>${t('Generali', 'General')}</h2>
      <div class="setting-row"><span><strong>${t('Scansione ricorsiva cartelle', 'Recursive folder scan')}</strong><small>${t('Include automaticamente le sottocartelle.', 'Automatically includes subfolders.')}</small></span><label class="switch"><input type="checkbox" data-setting="recursiveFolders" ${state.settings.recursiveFolders ? 'checked' : ''}><span></span></label></div>
      <div class="setting-control"><span class="setting-control-label">${t('Tema', 'Theme')}</span>${davSelect('theme', state.settings.theme, [['system', t('Sistema', 'System')], ['light', t('Chiaro', 'Light')], ['dark', t('Scuro', 'Dark')]])}</div>
      <div class="setting-control"><span class="setting-control-label">${t('Lingua', 'Language')}</span>${davSelect('language', state.settings.language, [['it', 'Italiano'], ['en', 'English']])}</div>
    </div>
    <div class="panel about-card">
      <div class="brand big">_dav<span>IMAGE</span></div>
      <p>${t('Toolbox immagini locale e multipiattaforma. Nessun account, nessuna pubblicità e nessun upload dei tuoi file.', 'Local cross-platform image toolbox. No account, no ads and no file uploads.')}</p>
      <div class="about-links"><button class="website-button" data-action="website">${icons.globe}<span>davstudios.it</span></button><button class="coffee-button wide" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè', 'Buy Me A Coffee')}</span></button></div>
      <div class="version">v1.0.0 · ${t('Release stabile', 'Stable release')}</div>
    </div>
    <div class="panel capability-card"><h2>${t('Stato formati', 'Format status')}</h2><div class="capability-list"><div><strong>JPEG / PNG / WebP / AVIF / BMP / TIFF</strong><span>${t('Lettura supportata; output disponibile per JPEG, PNG, WebP, AVIF e TIFF.', 'Input supported; output available for JPEG, PNG, WebP, AVIF and TIFF.')}</span></div><div><strong>GIF</strong><span>${t('Rilevato ma non elaborato per evitare perdita di frame.', 'Detected but not processed to avoid frame loss.')}</span></div><div><strong>HEIC / HEIF</strong><span>${t('Rilevato. Il supporto codec verrà esteso in aggiornamenti futuri.', 'Detected. Codec support will be extended in future updates.')}</span></div></div></div>
  </section>`;
}

function nativeSelect(id, options, value) {
  return `<select data-select="${id}">${options.map(([optionValue,label]) => `<option value="${optionValue}" ${optionValue === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select>`;
}

function davSelect(id, value, options) {
  const current = options.find(([optionValue]) => optionValue === value) || options[0];
  return `<div class="dav-select" data-dav-select="${id}"><button class="dav-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>${escapeHtml(current[1])}</span><span class="dav-select-chevron">${icons.chevron}</span></button><div class="dav-select-menu" role="listbox">${options.map(([optionValue,label]) => `<button class="dav-select-option ${optionValue === value ? 'is-selected' : ''}" type="button" role="option" data-value="${optionValue}" aria-selected="${optionValue === value}"><span>${escapeHtml(label)}</span><span class="dav-select-check">${icons.check}</span></button>`).join('')}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function toast(text, kind = 'success') {
  const region = document.querySelector('#toast-region');
  if (!region) return;
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.textContent = text;
  region.appendChild(node);
  setTimeout(() => {
    node.classList.add('is-leaving');
    setTimeout(() => node.remove(), 190);
  }, 3200);
}

async function addPaths(paths) {
  if (!paths?.length) return;
  try {
    const scanned = await invoke('scan_images', { paths, recursive: state.settings.recursiveFolders });
    const existing = new Set(state.files.map((file) => file.path));
    state.files.push(...scanned.filter((file) => !existing.has(file.path)));
    if (!state.selectedId && state.files.length) state.selectedId = state.files[0].id;
    state.jobs.clear();
    state.result = null;
    state.reveal = 'content';
    renderShell();
    await refreshSelectedDetails();
    const unsupported = scanned.filter((file) => !file.supported).length;
    if (unsupported) toast(t(`${unsupported} file rilevati ma non elaborabili in questa preview.`, `${unsupported} files were detected but cannot be processed in this preview.`), 'warning');
  } catch (error) {
    await message(String(error), { title: '_davIMAGE', kind: 'error' });
  }
}

async function chooseFiles() {
  const result = await open({ multiple: true, directory: false, filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','webp','avif','gif','bmp','tif','tiff','heic','heif'] }] });
  if (!result) return;
  await addPaths(Array.isArray(result) ? result : [result]);
}

async function chooseFolder() {
  const result = await open({ multiple: false, directory: true });
  if (result) await addPaths([result]);
}

async function chooseOutputFolder() {
  const result = await open({ multiple: false, directory: true });
  if (!result) return;
  state.outputFolder = result;
  renderShell();
}

async function chooseWatermark() {
  const result = await open({ multiple: false, directory: false, filters: [{ name: 'Images', extensions: ['png','webp','jpg','jpeg'] }] });
  if (!result) return;
  state.options.watermarkPath = result;
  renderShell();
}

async function refreshSelectedDetails() {
  const file = selectedFile();
  state.thumbnail = null;
  state.metadata = null;
  if (!file || !file.supported) {
    renderShell();
    return;
  }
  state.thumbnailLoading = true;
  if (state.tool === 'metadata') state.metadataLoading = true;
  renderShell();
  const id = file.id;
  try {
    const thumbnail = await invoke('thumbnail_image', { path: file.path });
    if (selectedFile()?.id === id) state.thumbnail = thumbnail;
  } catch {
    if (selectedFile()?.id === id) state.thumbnail = null;
  } finally {
    if (selectedFile()?.id === id) state.thumbnailLoading = false;
  }
  if (state.tool === 'metadata') {
    try {
      const metadata = await invoke('inspect_metadata', { path: file.path });
      if (selectedFile()?.id === id) state.metadata = metadata;
    } catch {
      if (selectedFile()?.id === id) state.metadata = null;
    } finally {
      if (selectedFile()?.id === id) state.metadataLoading = false;
    }
  }
  if (selectedFile()?.id === id) renderShell();
}

async function processBatch() {
  const files = supportedFiles();
  if (!files.length || state.busy) return;
  if (state.outputMode === 'custom' && !state.outputFolder) {
    toast(t('Scegli prima una cartella di output.', 'Choose an output folder first.'), 'warning');
    return;
  }
  if (state.tool === 'watermark' && !state.options.watermarkPath) {
    toast(t('Scegli prima un watermark.', 'Choose a watermark first.'), 'warning');
    return;
  }
  state.busy = true;
  state.jobs = new Map(files.map((file) => [file.path, { status: 'queued' }]));
  state.result = null;
  renderShell();
  try {
    const result = await invoke('process_images', {
      request: {
        paths: files.map((file) => file.path),
        tool: state.tool,
        outputMode: state.outputMode,
        outputFolder: state.outputFolder,
        options: state.options
      }
    });
    state.result = result;
    toast(result.cancelled ? t('Elaborazione annullata.', 'Processing cancelled.') : result.failed ? t(`Completato con ${result.failed} errori.`, `Completed with ${result.failed} errors.`) : t('Elaborazione completata.', 'Processing completed.'), result.failed ? 'warning' : 'success');
  } catch (error) {
    await message(String(error), { title: '_davIMAGE', kind: 'error' });
  } finally {
    state.busy = false;
    renderShell();
  }
}

async function cancelBatch() {
  await invoke('cancel_processing');
}

function applyPreset(name) {
  const values = {
    instagram: { resizeMode: 'dimensions', width: 1080, height: 1080 },
    fullhd: { resizeMode: 'dimensions', width: 1920, height: 1080 },
    '4k': { resizeMode: 'dimensions', width: 3840, height: 2160 },
    email: { resizeMode: 'longest', width: 1600 },
    avatar: { resizeMode: 'dimensions', width: 512, height: 512 },
    website: { resizeMode: 'longest', width: 1920 }
  }[name];
  if (!values) return;
  Object.assign(state.options, values);
  renderShell();
}

function setTool(tool) {
  state.page = 'tool';
  state.tool = tool;
  state.result = null;
  state.jobs.clear();
  if (tool === 'compress') state.options.outputFormat = 'same';
  if (tool === 'convert' && state.options.outputFormat === 'same') state.options.outputFormat = 'webp';
  if (tool === 'resize' || tool === 'crop' || tool === 'watermark') state.options.outputFormat = 'same';
  if (tool === 'optimize') state.options.outputFormat = 'webp';
  state.reveal = 'page';
  renderShell();
  refreshSelectedDetails();
}

function quickTheme() {
  const current = document.documentElement.dataset.theme;
  state.settings.theme = current === 'dark' ? 'light' : 'dark';
  saveSettings();
  runUiTransition('theme', () => {
    applyTheme();
    renderShell();
  });
}

function handleSettingSelect(id, value) {
  if (id === 'theme') {
    state.settings.theme = value;
    saveSettings();
    runUiTransition('theme', () => {
      applyTheme();
      renderShell();
    });
  }
  if (id === 'language') {
    state.settings.language = value;
    saveSettings();
    runUiTransition('language', () => {
      applyTheme();
      renderShell();
    });
  }
}

function closeSelects(except = null) {
  document.querySelectorAll('.dav-select.is-open').forEach((select) => {
    if (select === except) return;
    select.classList.remove('is-open');
    select.querySelector('.dav-select-trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function bindEvents() {
  document.querySelectorAll('[data-tool]').forEach((node) => node.addEventListener('click', () => setTool(node.dataset.tool)));
  document.querySelector('[data-page="settings"]')?.addEventListener('click', () => {
    state.page = 'settings';
    state.reveal = 'page';
    renderShell();
  });
  document.querySelectorAll('[data-action="add-files"]').forEach((node) => node.addEventListener('click', chooseFiles));
  document.querySelectorAll('[data-action="add-folder"]').forEach((node) => node.addEventListener('click', chooseFolder));
  document.querySelector('[data-action="clear-files"]')?.addEventListener('click', () => {
    state.files = [];
    state.selectedId = null;
    state.thumbnail = null;
    state.metadata = null;
    state.jobs.clear();
    state.result = null;
    renderShell();
  });
  document.querySelector('[data-action="process"]')?.addEventListener('click', processBatch);
  document.querySelector('[data-action="cancel"]')?.addEventListener('click', cancelBatch);
  document.querySelector('[data-action="output-folder"]')?.addEventListener('click', chooseOutputFolder);
  document.querySelector('[data-action="watermark-file"]')?.addEventListener('click', chooseWatermark);
  document.querySelectorAll('[data-action="coffee"]').forEach((node) => node.addEventListener('click', () => openUrl('https://buymeacoffee.com/davstudios')));
  document.querySelector('[data-action="website"]')?.addEventListener('click', () => openUrl(state.settings.language === 'en' ? 'https://www.davstudios.it/en' : 'https://www.davstudios.it'));
  document.querySelector('[data-action="quick-theme"]')?.addEventListener('click', quickTheme);
  document.querySelectorAll('[data-file-id]').forEach((node) => node.addEventListener('click', async () => {
    state.selectedId = node.dataset.fileId;
    await refreshSelectedDetails();
  }));
  document.querySelectorAll('[data-output-mode]').forEach((node) => node.addEventListener('click', () => {
    state.outputMode = node.dataset.outputMode;
    renderShell();
  }));
  document.querySelectorAll('[data-format]').forEach((node) => node.addEventListener('click', () => {
    state.options.outputFormat = node.dataset.format;
    renderShell();
  }));
  document.querySelectorAll('[data-quality]').forEach((node) => node.addEventListener('click', () => {
    state.options.quality = Number(node.dataset.quality);
    renderShell();
  }));
  document.querySelectorAll('[data-preset]').forEach((node) => node.addEventListener('click', () => applyPreset(node.dataset.preset)));
  document.querySelectorAll('[data-rotate]').forEach((node) => node.addEventListener('click', () => {
    state.options.rotate = Number(node.dataset.rotate);
    renderShell();
  }));
  document.querySelectorAll('[data-range]').forEach((node) => node.addEventListener('input', () => {
    state.options[node.dataset.range] = Number(node.value);
    const span = node.parentElement.querySelector('span');
    if (span) span.textContent = node.dataset.range === 'quality' ? node.value : `${node.value}%`;
  }));
  document.querySelectorAll('[data-option]').forEach((node) => node.addEventListener('change', () => {
    const key = node.dataset.option;
    state.options[key] = node.type === 'number' ? Number(node.value) : node.value;
    renderShell();
  }));
  document.querySelector('[data-select="output-format"]')?.addEventListener('change', (event) => {
    state.options.outputFormat = event.target.value;
    renderShell();
  });
  document.querySelector('[data-select="resize-mode"]')?.addEventListener('change', (event) => {
    state.options.resizeMode = event.target.value;
    renderShell();
  });
  document.querySelector('[data-select="watermark-position"]')?.addEventListener('change', (event) => {
    state.options.watermarkPosition = event.target.value;
    renderShell();
  });
  document.querySelector('[data-setting="recursiveFolders"]')?.addEventListener('change', (event) => {
    state.settings.recursiveFolders = event.target.checked;
    saveSettings();
  });
  document.querySelectorAll('.dav-select').forEach((select) => {
    const trigger = select.querySelector('.dav-select-trigger');
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const openNow = !select.classList.contains('is-open');
      closeSelects(select);
      select.classList.toggle('is-open', openNow);
      trigger.setAttribute('aria-expanded', String(openNow));
    });
    select.querySelectorAll('.dav-select-option').forEach((option) => option.addEventListener('click', () => handleSettingSelect(select.dataset.davSelect, option.dataset.value)));
  });
}

document.addEventListener('click', () => closeSelects());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSelects();
});

applyTheme();
renderShell();

getCurrentWebview().onDragDropEvent((event) => {
  const payload = event.payload;
  if (payload.type === 'over') {
    state.dragOver = true;
    document.querySelector('.drop-zone')?.classList.add('drag-over');
  }
  if (payload.type === 'leave') {
    state.dragOver = false;
    document.querySelector('.drop-zone')?.classList.remove('drag-over');
  }
  if (payload.type === 'drop') {
    state.dragOver = false;
    addPaths(payload.paths);
  }
});

listen('image-job-progress', (event) => {
  const payload = event.payload;
  state.jobs.set(payload.path, payload);
  const nodes = [...document.querySelectorAll('[data-file-id]')];
  const file = state.files.find((item) => item.path === payload.path);
  if (file) {
    const row = nodes.find((node) => node.dataset.fileId === file.id);
    const badge = row?.querySelector('.file-state');
    if (badge) {
      badge.className = `file-state ${payload.status}`;
      badge.textContent = payload.status === 'processing' ? t('Elaborazione', 'Processing') : payload.status === 'completed' ? t('Completato', 'Completed') : t('Errore', 'Failed');
    }
  }
  const progress = document.querySelector('.progress-fill');
  const progressCard = document.querySelector('.progress-card span');
  const total = supportedFiles().length;
  const done = [...state.jobs.values()].filter((job) => job.status === 'completed' || job.status === 'failed').length;
  if (progress) progress.style.width = `${total ? Math.min(100, done / total * 100) : 0}%`;
  if (progressCard) progressCard.textContent = `${done}/${total}`;
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.settings.theme === 'system') {
    runUiTransition('theme', () => {
      applyTheme();
      renderShell();
    });
  }
});
