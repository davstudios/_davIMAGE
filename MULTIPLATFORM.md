# Supporto multipiattaforma

`_davIMAGE v26.10.2` usa una singola codebase Tauri 2 per Windows, macOS e Linux. L'elaborazione immagini avviene localmente nel backend Rust.

## Windows

Usa `RUN-WINDOWS.bat` per lo sviluppo e `BUILD-WINDOWS.bat` per il bundle. Le release GitHub non sono attualmente firmate con un certificato Authenticode commerciale; SmartScreen può quindi mostrare un avviso.

## macOS

Usa `RUN-MACOS.sh` e `BUILD-MACOS.sh`. Le release GitHub non sono attualmente firmate con Developer ID né notarizzate da Apple; Gatekeeper può quindi richiedere l'apertura manuale da Privacy e Sicurezza.

## Linux

Su Ubuntu/Debian esegui prima `INSTALL-LINUX-DEPS-UBUNTU.sh`, poi `RUN-LINUX.sh` o `BUILD-LINUX.sh`. Il workflow GitHub disabilita eventuali sorgenti Microsoft non raggiungibili prima di installare le dipendenze Tauri.

## Pacchetti GitHub Actions

- Windows x64 → NSIS `.exe`
- macOS Universal → `.dmg`
- Linux x64 → `.AppImage` e `.deb`

La build macOS Universal include Intel e Apple Silicon nello stesso pacchetto.

## Privacy e rete

Le immagini vengono elaborate sul dispositivo. L'app non invia i file a server esterni per eseguire le operazioni di elaborazione.
