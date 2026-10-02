<div align="center">

# _davIMAGE

**Toolbox immagini locale, veloce e multipiattaforma.**  
**A fast, local and cross-platform image toolbox.**

`v26.10.3`

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

### Formati della release corrente

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


## Installazione delle release GitHub non firmate

Le release di `_davIMAGE` sono distribuite direttamente tramite GitHub e, al momento, non utilizzano certificati commerciali di code signing o notarizzazione Apple. Il codice sorgente è disponibile pubblicamente con licenza MIT.

### Windows

Windows SmartScreen può mostrare l'avviso **“Windows ha protetto il PC”** perché l'installer non è firmato con un certificato di publisher attendibile. Se hai scaricato il file dalla repository GitHub ufficiale di `_davstudios`, seleziona **Ulteriori informazioni** e poi **Esegui comunque**.

### macOS

Gatekeeper può impedire la prima apertura perché l'app non è firmata con Developer ID e non è notarizzata da Apple. Dopo aver tentato di aprire l'app, vai in **Impostazioni di Sistema → Privacy e Sicurezza**, individua il messaggio relativo a `_davIMAGE` e scegli **Apri comunque**.

### Linux

Per un'AppImage può essere necessario rendere il file eseguibile prima dell'avvio:

```bash
chmod +x _davIMAGE*.AppImage
```

Scarica sempre le release dalla repository GitHub ufficiale di `_davstudios`. Quando viene pubblicato un hash SHA-256, puoi usarlo per verificare l'integrità del file scaricato.

## Informazioni pacchetto

- Developer / Publisher: `_davstudios`
- Homepage: https://davstudios.it
- Licenza: MIT
- Bundle identifier: `studio.dav.image`
- Versione corrente: `26.10.3`

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

La v26.10.3 mantiene lo standard di versioning e packaging `_davstudios`, completa la repository normalization dei file testuali e rafforza i controlli multipiattaforma della versione senza modificare il motore di elaborazione immagini. La v1.0.0 rimane la prima release stabile di `_davIMAGE`; tra le aree future restano l'estensione del supporto HEIC/HEIF, l'elaborazione GIF animata e una gestione metadata ancora più avanzata.

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

### Formats in the current release

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


## Installing unsigned GitHub releases

`_davIMAGE` releases are distributed directly through GitHub and currently do not use a commercial code-signing certificate or Apple notarization. The source code is publicly available under the MIT License.

### Windows

Windows SmartScreen may display **“Windows protected your PC”** because the installer is not signed by a trusted publisher certificate. If you downloaded it from the official `_davstudios` GitHub repository, select **More info** and then **Run anyway**.

### macOS

Gatekeeper may block the first launch because the app is not signed with Developer ID and is not notarized by Apple. After attempting to open it, go to **System Settings → Privacy & Security**, locate the `_davIMAGE` notice and choose **Open Anyway**.

### Linux

An AppImage may need executable permission before launch:

```bash
chmod +x _davIMAGE*.AppImage
```

Always download releases from the official `_davstudios` GitHub repository. When a SHA-256 hash is published, you can use it to verify the integrity of the downloaded file.

## Package information

- Developer / Publisher: `_davstudios`
- Homepage: https://davstudios.it
- License: MIT
- Bundle identifier: `studio.dav.image`
- Current version: `26.10.3`

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

v26.10.3 retains the `_davstudios` versioning and packaging standard, completes repository normalization across text files and strengthens cross-platform version checks without changing the image-processing engine. v1.0.0 remains the first stable `_davIMAGE` release; planned areas for future updates still include broader HEIC/HEIF support, animated GIF processing and more advanced metadata handling.

[↑ Back to top](#davimage)

---

<div align="center">

Built by **_davstudios** · MIT License

</div>

