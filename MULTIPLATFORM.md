# Multipiattaforma

`_davIMAGE` usa una singola codebase Tauri 2 per Windows, macOS e Linux.

La pipeline GitHub Actions inclusa compila sui runner nativi:

- Windows x64 → NSIS `.exe`
- macOS Universal → `.dmg`
- Linux x64 → `.AppImage` e `.deb`

La build macOS Universal include Intel e Apple Silicon nello stesso pacchetto.
