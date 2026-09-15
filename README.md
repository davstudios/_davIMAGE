<div align="center">

# _davIMAGE

**Toolbox immagini locale, veloce e multipiattaforma.**  
**A fast, local and cross-platform image toolbox.**

`v1.0.0`

[Italiano](#italiano) · [English](#english)

</div>

---

<a id="italiano"></a>

## Italiano 🇮🇹

_davIMAGE è un'app desktop per elaborare immagini **direttamente sul computer**, senza upload, account, pubblicità o limiti artificiali sul numero di file.

È la seconda applicazione della suite `_davstudios` e condivide lo stesso design system, le stesse animazioni, il cambio tema/lingua e la stessa filosofia di `_davRENAME`.

<p>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" alt="Comprami Un Caffè" height="42"></a>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" alt="Visita il sito" height="42"></a>
</p>

### Cosa fa

- **Comprimi** immagini JPEG, PNG, WebP, AVIF e TIFF.
- **Ridimensiona** per larghezza, altezza, dimensioni, percentuale, lato lungo/corto, Fit e Fill.
- **Converti** in JPEG, PNG, WebP, AVIF e TIFF.
- **Ritaglia e ruota** con coordinate precise.
- **Watermark** batch con immagine, opacità, dimensione e posizione configurabili.
- **Metadata** EXIF in sola lettura per fotocamera, obiettivo, data, GPS, software, copyright, orientamento e profilo ICC rilevato.
- **Optimize for Web** con preset DAV: lato lungo massimo 1920 px, WebP, qualità 82.
- **Batch processing** con coda, stato per file, annullamento e riepilogo delle dimensioni finali.

### Sicurezza dei file

_davIMAGE segue una regola semplice: **l'originale non viene mai sovrascritto**.

Ogni operazione produce un nuovo file con suffisso descrittivo:

```text
photo.jpg
→ photo-compressed.jpg
→ photo-resized.jpg
→ photo-converted.webp
→ photo-web.webp
```

Se il nome esiste già, viene creato automaticamente un nuovo nome numerato.

<details>
<summary><strong>Elaborazione e privacy</strong></summary>

Tutta l'elaborazione avviene localmente. L'app non invia immagini a server esterni e non contiene telemetria. I nuovi file vengono ricodificati senza copiare automaticamente i metadata EXIF; la modifica selettiva dei metadata verrà estesa in aggiornamenti futuri.

</details>

### Formati in v1.0.0

| Formato | Input | Output | Stato |
| --- | :---: | :---: | --- |
| JPEG | ✅ | ✅ | Supportato |
| PNG | ✅ | ✅ | Supportato |
| WebP | ✅ | ✅ | Supportato |
| AVIF | ✅ | ✅ | Supportato |
| BMP | ✅ | — | Conversione verso altri formati |
| TIFF | ✅ | ✅ | Supportato |
| GIF | Rilevato | — | Rilevato, elaborazione non disponibile |
| HEIC / HEIF | Rilevato | — | Rilevato, supporto codec da estendere |

### Piattaforme

- Windows 10/11 x64
- macOS Intel e Apple Silicon
- Linux x64

### Avvio in sviluppo

Con Node.js, Rust e i prerequisiti Tauri installati:

```bash
npm install
npm run desktop
```

Sono inclusi anche gli script `RUN-*` e `BUILD-*` specifici per sistema operativo.

### Note della release

La v1.0.0 è la prima release stabile di `_davIMAGE`. Le aree già previste per gli aggiornamenti futuri sono l'estensione del supporto HEIC/HEIF, l'elaborazione GIF animata e una gestione metadata ancora più avanzata.

[↑ Torna in alto](#davimage)

---

<a id="english"></a>

## English 🇬🇧

_davIMAGE is a desktop application for processing images **directly on your computer**, with no uploads, accounts, ads or artificial file-count limits.

It is the second application in the `_davstudios` suite and shares the same design system, motion language, theme/language transitions and product philosophy as `_davRENAME`.

<p>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" alt="Buy Me A Coffee" height="42"></a>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" alt="Visit website" height="42"></a>
</p>

### What it does

- **Compress** JPEG, PNG, WebP, AVIF and TIFF images.
- **Resize** by width, height, dimensions, percentage, longest/shortest side, Fit and Fill.
- **Convert** to JPEG, PNG, WebP, AVIF and TIFF.
- **Crop & Rotate** with precise coordinates.
- **Watermark** batches with configurable image, opacity, size and position.
- **Metadata** read-only EXIF inspection for camera, lens, date, GPS, software, copyright, orientation and detected ICC profile.
- **Optimize for Web** with the DAV preset: maximum 1920 px longest side, WebP, quality 82.
- **Batch processing** with queue state, per-file status, cancellation and final size summary.

### File safety

_davIMAGE follows one simple rule: **the original is never overwritten**.

Every operation produces a new file with a descriptive suffix:

```text
photo.jpg
→ photo-compressed.jpg
→ photo-resized.jpg
→ photo-converted.webp
→ photo-web.webp
```

If the output name already exists, a new numbered name is generated automatically.

<details>
<summary><strong>Processing and privacy</strong></summary>

All processing happens locally. The app does not upload images to external servers and includes no telemetry. New files are re-encoded without automatically copying EXIF metadata; more advanced selective metadata handling is planned for future updates.

</details>

### Formats in v1.0.0

| Format | Input | Output | Status |
| --- | :---: | :---: | --- |
| JPEG | ✅ | ✅ | Supported |
| PNG | ✅ | ✅ | Supported |
| WebP | ✅ | ✅ | Supported |
| AVIF | ✅ | ✅ | Supported |
| BMP | ✅ | — | Convert to another format |
| TIFF | ✅ | ✅ | Supported |
| GIF | Detected | — | Detected, processing unavailable |
| HEIC / HEIF | Detected | — | Detected, codec support to be extended |

### Platforms

- Windows 10/11 x64
- macOS Intel and Apple Silicon
- Linux x64

### Development

With Node.js, Rust and the Tauri prerequisites installed:

```bash
npm install
npm run desktop
```

Platform-specific `RUN-*` and `BUILD-*` scripts are included as well.

### Release notes

v1.0.0 is the first stable release of `_davIMAGE`. Already planned areas for future updates include broader HEIC/HEIF support, animated GIF processing and more advanced metadata handling.

[↑ Back to top](#davimage)

---

<div align="center">

Built by **_davstudios** · MIT License

</div>
