# Changelog

## 26.10.2
- Updated the complete Tauri icon set in `src-tauri/icons` using the new official `icon.ico` asset.
- Regenerated `32x32.png`, `128x128.png`, `128x128@2x.png`, `app-icon.png`, `icon.ico` and `icon.icns` to keep all app icons visually aligned across Windows, macOS and Linux.
- Bumped release metadata and technical versions to `26.10.2` without changing the image-processing engine or application logic.

## 26.10.1

- Adottato il nuovo standard di versioning `_davstudios` `YY.M.REVISIONE`.
- Sincronizzata la versione dell'app su npm, Tauri, Cargo, lockfile, documentazione e test.
- Standardizzati i metadata ufficiali del pacchetto con publisher `_davstudios`, homepage, copyright, licenza MIT e metadata Debian.
- Mantenuto l'identifier storico `studio.dav.image` per preservare la continuità dell'identità applicativa.
- Aggiunte al README le istruzioni per le release GitHub non firmate su Windows, macOS e Linux.
- Il workflow GitHub Actions usa automaticamente la Description bilingue del commit associato al tag come descrizione della GitHub Release.
- Rafforzata l'installazione delle dipendenze Linux contro repository Microsoft non raggiungibili sui runner Ubuntu.
- Nessuna modifica al motore immagini, al backend Rust, ai formati supportati o all'interfaccia.

## 1.1.3

- Versione UI letta automaticamente dal runtime Tauri.
- Allineamento release alla strategia di incremento patch.

## 1.1.2

- La versione mostrata nell’interfaccia viene letta automaticamente dal runtime Tauri.
- Added automatic runtime version display so the UI stays aligned with the app package version.

## 1.0.0

First stable release of `_davIMAGE`.

- Shared `_davstudios` design system and motion language from `_davRENAME`.
- Italian and English interface.
- Animated light/dark theme and language transitions.
- Local file/folder drag and drop.
- Batch compression, resize, conversion, crop/rotate and image watermark workflows.
- Read-only EXIF metadata inspection.
- DAV Optimize for Web preset.
- Safe output naming with no automatic overwrite.
- Cancellation and batch result summary.
- Buy Me A Coffee donation button.
- New `_davIMAGE` icon set for Windows, macOS and Linux.
- Windows, macOS and Linux project configuration.
- Source comment audit test.